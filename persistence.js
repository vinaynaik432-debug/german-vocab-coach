/* Inactive storage foundation: one JSON snapshot per synchronous adapter write.
 * get/set provide optimistic conflict detection, not a cross-tab transaction.
 * No DOM, application initialization, schema migration, or automatic writes.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Persistence = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
  const MAX_DEPTH = 64;
  const MAX_NODES = 1000000;
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

  // Inspect descriptors rather than reading properties: getters and toJSON must
  // never execute while validating caller-owned data. Null prototypes are safe.
  function cloneDatabase(database) {
    let nodes = 0;
    const ancestors = new Set();
    function copy(value, depth) {
      if (++nodes > MAX_NODES || depth > MAX_DEPTH) throw new TypeError('Snapshot exceeds the structural limit.');
      if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
      if (typeof value === 'number') {
        if (!Number.isFinite(value) || Object.is(value, -0) || (Number.isInteger(value) && !Number.isSafeInteger(value))) {
          throw new TypeError('Snapshot contains a number that cannot be safely preserved.');
        }
        return value;
      }
      if (typeof value !== 'object') throw new TypeError('Snapshot contains non-JSON data.');
      if (ancestors.has(value)) throw new TypeError('Snapshot contains a cycle.');
      const array = Array.isArray(value);
      const prototype = Object.getPrototypeOf(value);
      if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
        throw new TypeError('Snapshot contains an unsupported object prototype.');
      }
      const keys = Reflect.ownKeys(value);
      if (keys.some(key => typeof key !== 'string')) throw new TypeError('Snapshot contains symbol properties.');
      if (array && (keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9]\d*)$/.test(key)))) {
        throw new TypeError('Snapshot contains a sparse or extended array.');
      }
      const result = array ? [] : {};
      ancestors.add(value);
      try {
        for (const key of keys) {
          if (array && key === 'length') continue;
          if (RESERVED.has(key)) throw new TypeError('Snapshot contains a reserved property name.');
          const descriptor = Object.getOwnPropertyDescriptor(value, key);
          if (!descriptor || !own(descriptor, 'value') || !descriptor.enumerable) {
            throw new TypeError('Snapshot contains an accessor or non-enumerable property.');
          }
          if (array && (Number(key) >= value.length || !Number.isSafeInteger(Number(key)))) {
            throw new TypeError('Snapshot contains an invalid array property.');
          }
          result[key] = copy(descriptor.value, depth + 1);
        }
      } finally { ancestors.delete(value); }
      return result;
    }
    if (database === null || typeof database !== 'object' || Array.isArray(database)) {
      throw new TypeError('A database snapshot must be a plain object.');
    }
    return copy(database, 0);
  }

  function parseRaw(raw) {
    if (raw === null) return { raw, database: null };
    if (typeof raw !== 'string') throw new TypeError('Storage must return a string or null.');
    return { raw, database: cloneDatabase(JSON.parse(raw)) };
  }

  function create({ storage, key, initialRaw } = {}) {
    if (!storage || typeof storage.get !== 'function' || typeof storage.set !== 'function') {
      throw new TypeError('A synchronous storage adapter with get and set is required.');
    }
    if (typeof key !== 'string' || !key.length) throw new TypeError('A non-empty storage key is required.');
    const suppliedInitial = arguments.length > 0 && own(arguments[0], 'initialRaw');
    let committed = null;
    let pending = null;
    let status = 'unread';
    let lastReason = null;
    let observation = null;
    let busy = false;

    function snapshot(value) {
      return value && { raw: value.raw, database: value.database === null ? null : cloneDatabase(value.database) };
    }
    function getState() {
      return {
        status, reason: lastReason, hasBaseline: committed !== null,
        committed: snapshot(committed),
        pending: pending && { ...snapshot(pending), hasExpectedRaw: pending.hasExpectedRaw,
          ...(pending.hasExpectedRaw ? { expectedRaw: pending.expectedRaw } : {}) },
        observation: observation && { ...observation },
      };
    }
    function outcome(kind, operation, detail = {}) {
      status = kind;
      lastReason = detail.reason || null;
      return { status: kind, operation, ...detail, pendingAvailable: pending !== null };
    }
    function storageSnapshot(operation, phase) {
      let raw;
      try { raw = storage.get(key); }
      catch {
        observation = { status: 'unavailable' };
        return { failure: outcome('unavailable', operation, { reason: `${phase}-read-failed` }) };
      }
      try {
        const value = parseRaw(raw);
        observation = { status: 'success', raw };
        return { value };
      } catch {
        observation = { status: 'invalid', ...(typeof raw === 'string' || raw === null ? { raw } : {}) };
        return { failure: outcome('invalid', operation, {
          reason: typeof raw === 'string' ? 'corrupt-json' : 'invalid-storage-value',
        }) };
      }
    }
    function accept(value, operation, wrote) {
      committed = value;
      if (pending && pending.raw === value.raw) pending = null;
      return outcome('success', operation, { ...snapshot(value), wrote });
    }
    function run(operation, callback) {
      // An injected adapter may call back into the helper. Reject that operation
      // without changing the outer operation's baseline or recovery snapshot.
      if (busy) return { status: 'conflict', operation, reason: 'operation-in-progress', pendingAvailable: pending !== null };
      busy = true;
      try { return callback(); } finally { busy = false; }
    }
    function read() {
      return run('read', () => {
        const result = storageSnapshot('read', 'storage');
        return result.failure || accept(result.value, 'read', false);
      });
    }
    function writePending(operation) {
      if (!pending) return outcome('invalid', operation, { reason: 'no-pending-snapshot' });
      if (!pending.hasExpectedRaw) return outcome('invalid', operation, { reason: 'missing-baseline' });
      const result = storageSnapshot(operation, 'storage');
      if (result.failure) return result.failure;
      // Recover a previous write whose acknowledgement/readback failed, without
      // rewriting or treating an already identical snapshot as a stale conflict.
      if (result.value.raw === pending.raw) return accept(result.value, operation, false);
      if (result.value.raw !== pending.expectedRaw) {
        return outcome('conflict', operation, { reason: 'storage-changed', expectedRaw: pending.expectedRaw, actualRaw: result.value.raw });
      }
      try { storage.set(key, pending.raw); }
      catch { return outcome('unavailable', operation, { reason: 'storage-write-failed' }); }
      const verification = storageSnapshot(operation, 'verification');
      if (verification.failure) return verification.failure;
      if (verification.value.raw !== pending.raw) {
        return outcome('conflict', operation, { reason: 'changed-during-write', expectedRaw: pending.raw, actualRaw: verification.value.raw });
      }
      return accept(verification.value, operation, true);
    }
    function commit(nextDatabase, options = {}) {
      return run('commit', () => {
        let candidate;
        let expectedRaw;
        let hasExpectedRaw;
        try {
          if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Invalid commit options.');
          const descriptor = Object.getOwnPropertyDescriptor(options, 'expectedRaw');
          if (descriptor && !own(descriptor, 'value')) throw new TypeError('Invalid expectedRaw accessor.');
          hasExpectedRaw = !!descriptor || committed !== null;
          expectedRaw = descriptor ? descriptor.value : committed && committed.raw;
          if (hasExpectedRaw && expectedRaw !== null && typeof expectedRaw !== 'string') throw new TypeError('Invalid expectedRaw token.');
          const database = cloneDatabase(nextDatabase);
          candidate = { database, raw: JSON.stringify(database), hasExpectedRaw, expectedRaw };
        } catch {
          return outcome('invalid', 'commit', { reason: 'invalid-candidate-or-options' });
        }
        // A new explicit commit replaces the previous pending intent only after
        // validation succeeds. Invalid input never destroys recoverable work.
        pending = candidate;
        return writePending('commit');
      });
    }
    function retry() { return run('retry', () => writePending('retry')); }

    if (suppliedInitial) {
      try {
        committed = parseRaw(initialRaw);
        observation = { status: 'success', raw: initialRaw };
        status = 'success';
      } catch {
        status = 'invalid'; lastReason = 'invalid-initial-raw';
        observation = { status: 'invalid', ...(typeof initialRaw === 'string' ? { raw: initialRaw } : {}) };
      }
    } else read();

    return Object.freeze({ read, commit, getState, retry });
  }

  return Object.freeze({ create });
});
