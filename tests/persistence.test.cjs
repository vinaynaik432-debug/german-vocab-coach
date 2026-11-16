const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Persistence = require('../persistence.js');

function store(initial = null) {
  return {
    raw: initial, reads: 0, writes: 0, failGet: false, failSet: false,
    get(key) { assert.equal(key, 'db'); this.reads++; if (this.failGet) throw Error('blocked'); return this.raw; },
    set(key, value) { assert.equal(key, 'db'); this.writes++; if (this.failSet) throw Error('quota'); this.raw = value; },
  };
}
const old = { version: 6, words: [{ word: 'die Freigabe', count: 2 }], sessions: [], preferences: { audio: true } };
const next = { ...old, words: [{ word: 'die Freigabe', count: 3 }] };
const rawOld = JSON.stringify(old);

test('browser and CommonJS exports work without DOM or writes', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../persistence.js'), 'utf8'), context);
  assert.equal(vm.runInContext('typeof Persistence.create', context), 'function');
  assert.equal(vm.runInContext("Persistence.create({storage:{get(){return null},set(){throw Error('unexpected')}},key:'db'}).read().status", context), 'success');
  assert.throws(() => Persistence.create(), /adapter/);
});

test('empty storage and initial reads never write or invent a database', () => {
  const storage = store(); const helper = Persistence.create({ storage, key: 'db' });
  assert.equal(helper.read().database, null);
  assert.equal(helper.getState().committed.raw, null);
  assert.equal(storage.writes, 0);
  const result = helper.commit(old);
  assert.equal(result.status, 'success'); assert.equal(result.wrote, true);
  assert.equal(storage.raw, rawOld);
});

test('roundtrip snapshots and returned state cannot mutate committed or caller data', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  const input = JSON.parse(JSON.stringify(next));
  const result = helper.commit(input);
  assert.deepEqual(result.database, input);
  input.words[0].count = 99; result.database.words[0].count = 88;
  helper.getState().committed.database.words[0].count = 77;
  assert.equal(helper.getState().committed.database.words[0].count, 3);
  assert.equal(JSON.parse(storage.raw).words[0].count, 3);
  assert.equal(old.words[0].count, 2);
});

test('write failure leaves committed snapshot unchanged, retains detached pending data, then retries', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.failSet = true;
  assert.equal(helper.commit(next).status, 'unavailable');
  const state = helper.getState();
  assert.equal(state.committed.raw, rawOld); assert.equal(storage.raw, rawOld);
  assert.deepEqual(state.pending.database, next); assert.equal(state.pending.expectedRaw, rawOld);
  state.pending.database.words[0].count = 42;
  storage.failSet = false;
  assert.equal(helper.retry().status, 'success');
  assert.deepEqual(helper.getState().committed.database, next);
  assert.equal(helper.getState().pending, null);
  assert.equal(helper.retry().reason, 'no-pending-snapshot');
});

test('read failure never replaces a previously committed snapshot or pending recovery data', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.failSet = true; helper.commit(next); storage.failGet = true;
  assert.equal(helper.read().status, 'unavailable');
  assert.equal(helper.retry().status, 'unavailable');
  assert.equal(helper.getState().committed.raw, rawOld);
  assert.deepEqual(helper.getState().pending.database, next);
});

test('stale tabs detect another complete snapshot before writing', () => {
  const storage = store(rawOld);
  const a = Persistence.create({ storage, key: 'db' });
  const b = Persistence.create({ storage, key: 'db' });
  a.commit(next); const written = storage.raw;
  assert.equal(b.commit({ ...old, preferences: { audio: false } }).status, 'conflict');
  assert.equal(storage.raw, written); assert.equal(storage.writes, 1);
  assert.equal(b.getState().committed.raw, rawOld); assert.ok(b.getState().pending);
  assert.equal(b.retry().status, 'conflict');
});

test('read adopts newer valid data without silently rebasing the pending retry', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.failSet = true; helper.commit(next); storage.failSet = false;
  storage.raw = JSON.stringify({ ...old, preferences: { audio: false } });
  const current = helper.read(); assert.equal(current.status, 'success');
  assert.equal(helper.getState().pending.expectedRaw, rawOld);
  assert.equal(helper.retry().status, 'conflict');
  const merged = { ...current.database, words: next.words };
  assert.equal(helper.commit(merged, { expectedRaw: current.raw }).status, 'success');
  assert.equal(helper.getState().pending, null);
});

test('explicit raw tokens, whitespace changes, deletion and initialRaw are checked exactly', () => {
  const storage = store(rawOld);
  const helper = Persistence.create({ storage, key: 'db', initialRaw: rawOld });
  assert.equal(storage.reads, 0);
  storage.raw = JSON.stringify(old, null, 2);
  assert.equal(helper.commit(next).status, 'conflict');
  assert.equal(helper.commit(next, { expectedRaw: storage.raw }).status, 'success');
  storage.raw = null;
  assert.equal(helper.commit(old).status, 'conflict');
  assert.equal(helper.commit(old, { expectedRaw: null }).status, 'success');
});

test('corrupt data is never overwritten, even with a matching explicit token', () => {
  for (const raw of ['{broken', 'null', '[]', '{"version":1e400}', '{"__proto__":{}}', '{"x":9007199254740993}']) {
    const storage = store(raw); const helper = Persistence.create({ storage, key: 'db' });
    assert.equal(helper.getState().status, 'invalid');
    assert.equal(helper.commit(next, { expectedRaw: raw }).status, 'invalid');
    assert.equal(storage.raw, raw); assert.equal(storage.writes, 0);
    assert.deepEqual(helper.getState().pending.database, next);
    assert.equal(helper.getState().committed, null);
  }
});

test('storage returning undefined or a promise is not mistaken for empty storage', () => {
  for (const raw of [undefined, Promise.resolve(null), 5]) {
    const storage = store(); storage.raw = raw;
    const helper = Persistence.create({ storage, key: 'db' });
    assert.equal(helper.read().reason, 'invalid-storage-value');
    assert.equal(storage.writes, 0);
  }
});

test('startup unavailable/corrupt data needs a deliberate fresh baseline before retrying', () => {
  const storage = store(rawOld); storage.failGet = true;
  const helper = Persistence.create({ storage, key: 'db' });
  assert.equal(helper.commit(next).reason, 'missing-baseline');
  storage.failGet = false; assert.equal(helper.read().status, 'success');
  assert.equal(helper.retry().reason, 'missing-baseline');
  assert.equal(storage.writes, 0);
  assert.equal(helper.commit(next).status, 'success');
});

test('a failed acknowledgement can be confirmed without a duplicate write', () => {
  const storage = store(rawOld);
  storage.set = function (key, raw) { this.writes++; this.raw = raw; throw Error('acknowledgement failed'); };
  const helper = Persistence.create({ storage, key: 'db' });
  assert.equal(helper.commit(next).status, 'unavailable');
  assert.equal(helper.getState().committed.raw, rawOld);
  const result = helper.retry();
  assert.equal(result.status, 'success'); assert.equal(result.wrote, false);
  assert.equal(storage.writes, 1); assert.equal(helper.getState().pending, null);
});

test('readback failure and post-write changes never falsely report a successful commit', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.set = function (key, raw) { this.writes++; this.raw = raw; this.failGet = true; };
  assert.equal(helper.commit(next).reason, 'verification-read-failed');
  assert.equal(helper.getState().committed.raw, rawOld);
  storage.failGet = false;
  assert.equal(helper.read().status, 'success');
  assert.equal(helper.getState().pending, null);
  storage.set = function () { this.raw = '{"otherTab":true}'; };
  assert.equal(helper.commit(old).reason, 'changed-during-write');
  assert.deepEqual(helper.getState().committed.database, next);
  assert.deepEqual(helper.getState().pending.database, old);
});

test('invalid input never destroys an existing valid pending snapshot', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.failSet = true; helper.commit(next);
  assert.equal(helper.commit({ value: undefined }).status, 'invalid');
  assert.deepEqual(helper.getState().pending.database, next);
  assert.equal(helper.commit(old, { expectedRaw: 5 }).status, 'invalid');
  assert.deepEqual(helper.getState().pending.database, next);
});

test('new explicit valid commit replaces pending intent with the latest complete snapshot', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.failSet = true; helper.commit(next);
  const latest = { ...next, preferences: { audio: false } };
  helper.commit(latest); storage.failSet = false; helper.retry();
  assert.deepEqual(JSON.parse(storage.raw), latest);
});

test('lossy values, accessors, cycles and prototype-poisoning are rejected without calling user hooks', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  let invoked = 0;
  const accessor = Object.defineProperty({}, 'value', { enumerable: true, get() { invoked++; return 1; } });
  const hidden = Object.defineProperty({}, 'value', { value: 1 });
  const hiddenAccessor = Object.defineProperty({}, 'hidden', { get() { invoked++; return 1; } });
  const symbol = { [Symbol('hidden')]: 1 };
  const cycle = {}; cycle.self = cycle;
  const extraArray = [1]; extraArray.note = 'would be lost';
  const customArray = [1]; Object.setPrototypeOf(customArray, null);
  const invalid = [undefined, null, [], { x: undefined }, { x: NaN }, { x: Infinity }, { x: -0 },
    { x: Number.MAX_SAFE_INTEGER + 1 }, { x: 1n }, { x: Symbol('x') }, { x() {} },
    { x: new Date() }, { x: new Map() }, { x: new Set() }, { x: /re/ },
    { x: new (class Custom {})() }, Object.create({ inherited: 1 }), accessor, hidden, hiddenAccessor,
    symbol, cycle, { x: [, 1] }, { x: extraArray }, { x: customArray },
    JSON.parse('{"nested":{"constructor":{"prototype":{"polluted":true}}}}'),
    { toJSON() { invoked++; return {}; } }];
  for (const value of invalid) assert.equal(helper.commit(value).status, 'invalid');
  assert.equal(invoked, 0); assert.equal(storage.writes, 0); assert.equal({}.polluted, undefined);
  assert.equal(helper.getState().committed.raw, rawOld);
});

test('null-prototype records, empty arrays, fractional numbers and shared subobjects preserve JSON values', () => {
  const storage = store(); const helper = Persistence.create({ storage, key: 'db' });
  const shared = { word: 'größer', score: 0.5 };
  const value = Object.assign(Object.create(null), { a: shared, b: shared, empty: [], nested: [null, true, 'ß'] });
  assert.equal(helper.commit(value).status, 'success');
  assert.deepEqual(JSON.parse(storage.raw), { a: shared, b: shared, empty: [], nested: [null, true, 'ß'] });
});

test('adapter re-entry cannot replace an outer pending write', () => {
  const storage = store(rawOld); const helper = Persistence.create({ storage, key: 'db' });
  storage.set = function (key, raw) {
    assert.equal(helper.commit({ corrupt: true }).reason, 'operation-in-progress');
    this.raw = raw;
  };
  assert.equal(helper.commit(next).status, 'success');
  assert.deepEqual(helper.getState().committed.database, next);
});
