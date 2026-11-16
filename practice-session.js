/* Inactive save coordinator. Pending write intent locks all new practice transitions. */
const PracticeSession = (() => {
  const METHODS = Object.freeze(['initialize', 'start', 'saveDraft', 'markHint', 'reveal', 'submitAnswer', 'advance', 'pause', 'resume']);
  function copy(value, ancestors = new Set(), depth = 0) {
    if (depth > 64) throw new TypeError('Snapshot is nested too deeply.');
    if (value === null || ['string', 'boolean'].includes(typeof value)) return value;
    // Preserve values such as -0 so retry cannot sanitize a rejected candidate.
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value || typeof value !== 'object' || ancestors.has(value)) throw new TypeError('Acyclic snapshot data is required.');
    const array = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) throw new TypeError('Plain snapshot data is required.');
    const keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string')) throw new TypeError('Symbol data is unsupported.');
    if (array && (keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9]\d*)$/.test(key)))) throw new TypeError('Dense arrays are required.');
    ancestors.add(value);
    const result = array ? [] : {};
    for (const key of keys) {
      if (array && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value') || !descriptor.enumerable) throw new TypeError('Accessors are unsupported.');
      Object.defineProperty(result, key, { value: copy(descriptor.value, ancestors, depth + 1), enumerable: true, writable: true, configurable: true });
    }
    ancestors.delete(value);
    return result;
  }

  function create({ persistence, engine } = {}) {
    if (!persistence || !['read', 'commit', 'retry', 'getState'].every(key => typeof persistence[key] === 'function')) {
      throw new TypeError('A Persistence instance is required.');
    }
    if (!engine || !METHODS.every(key => typeof engine[key] === 'function')) throw new TypeError('A PracticeEngine instance is required.');

    let intent = null;
    let busy = false;
    const initial = persistence.getState();
    let last = { status: initial.status, operation: 'create', reason: initial.reason || null };

    function adoptPending(state) {
      if (!intent && state.pending) intent = { ...copy(state.pending), transition: 'existing-write' };
    }
    adoptPending(initial);

    function getState() {
      const state = persistence.getState();
      const pending = intent || (state.pending && { ...state.pending, transition: 'existing-write' });
      return {
        ...last,
        saved: last.status === 'success' && !pending && state.status === 'success' && state.committed?.database != null,
        recoveryRequired: Boolean(pending),
        persistenceStatus: state.status,
        persistenceReason: state.reason,
        committed: copy(state.committed),
        pending: copy(pending || null),
        observation: copy(state.observation),
      };
    }

    function report(status, operation, reason = null, details = {}) {
      last = { status, operation, reason, ...details };
      return getState();
    }

    function run(operation, callback) {
      if (busy) return { ...getState(), status: 'blocked', operation, reason: 'operation-in-progress', saved: false };
      busy = true;
      try { return callback(); } finally { busy = false; }
    }

    function acceptOutcome(result, operation) {
      const state = persistence.getState();
      if (result.status === 'success') {
        if (!intent || state.committed?.raw !== intent.raw || state.pending) {
          return report('conflict', operation, 'unexpected-commit-acknowledgement');
        }
        intent = null;
      }
      return report(result.status, operation, result.reason || null);
    }

    function read() {
      return run('read', () => {
        adoptPending(persistence.getState());
        try {
          const result = persistence.read();
          // Reading may observe new data, but never rebases or unlocks an unresolved intent.
          return report(result.status, 'read', result.reason || null);
        } catch { return report('unavailable', 'read', 'persistence-read-threw'); }
      });
    }

    function transition(method, ...args) {
      return run(method, () => {
        const state = persistence.getState();
        adoptPending(state);
        if (intent) return report('blocked', method, 'pending-write');
        if (!METHODS.includes(method)) return report('invalid', 'transition', 'unknown-transition');
        if (!state.committed || state.committed.database === null) {
          return report(state.status === 'unavailable' ? 'unavailable' : 'invalid', method, 'no-committed-database');
        }
        let candidate;
        try {
          candidate = engine[method](state.committed.database, ...args);
          // PracticeEngine guarantees JSON data. Persistence performs its stricter
          // validation on the original candidate before any write is attempted.
          const retained = copy(candidate);
          const raw = JSON.stringify(retained);
          intent = { database: retained, raw, hasExpectedRaw: true, expectedRaw: state.committed.raw, transition: method };
        } catch (error) {
          return report('invalid', method, 'transition-rejected', { errorCode: error.code || null });
        }
        try {
          return acceptOutcome(persistence.commit(candidate, { expectedRaw: intent.expectedRaw }), method);
        } catch { return report('unavailable', method, 'persistence-commit-threw'); }
      });
    }

    function retry() {
      return run('retry', () => {
        const state = persistence.getState();
        adoptPending(state);
        if (!intent) return report('invalid', 'retry', 'no-pending-write');
        if (!intent.hasExpectedRaw) return report('invalid', 'retry', 'missing-original-baseline');
        if (state.pending && (state.pending.raw !== intent.raw || !state.pending.hasExpectedRaw || state.pending.expectedRaw !== intent.expectedRaw)) {
          return report('conflict', 'retry', 'pending-intent-changed');
        }
        try {
          // Normally Persistence retains the same pending snapshot. If read() has
          // already confirmed it, recommitting this exact snapshot only acknowledges
          // the identical value and cannot silently use a newer baseline.
          const result = state.pending ? persistence.retry()
            : persistence.commit(intent.database, { expectedRaw: intent.expectedRaw });
          return acceptOutcome(result, 'retry');
        } catch { return report('unavailable', 'retry', 'persistence-retry-threw'); }
      });
    }

    const api = { getState, read, transition, retry };
    for (const method of METHODS) api[method] = (...args) => transition(method, ...args);
    return Object.freeze(api);
  }

  return Object.freeze({ create });
})();
if (typeof module !== 'undefined') module.exports = PracticeSession;
