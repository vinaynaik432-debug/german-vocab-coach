const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Persistence = require('../persistence.js');
const Practice = require('../practice-engine.js');
const Session = require('../practice-session.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');
const at = second => `2026-11-16T12:00:${String(second).padStart(2, '0')}.000Z`;
const startOptions = { wordId: 'w1', attemptId: 'a1', at: at(0) };
const answer = (overrides = {}) => ({ wordId: 'w1', attemptId: 'a1', at: at(10), answer: 'die Freigabe', result: 'correct', ...overrides });
const fixture = () => ({ version: 6, words: [{ id: 'w1', word_en: 'approval', word_de: 'die Freigabe', status: 'new', times_seen: 0, correct_streak: 0, wrong_count: 0, half_count: 0 }], sessions: [{ round_id: 'legacy', score_correct: 2, score_total: 3 }], profile: { name: 'Learner' }, preferences: { learningFocus: 'marketing' } });

function setup(initial = fixture()) {
  const store = {
    raw: initial === null ? null : JSON.stringify(initial), failRead: false, failWrite: false, failAfterWrite: false, writes: 0,
    get() { if (this.failRead) throw Error('read blocked'); return this.raw; },
    set(_, raw) { this.writes++; if (this.failWrite) throw Error('storage full'); this.raw = raw; if (this.failAfterWrite) throw Error('acknowledgement failed'); },
  };
  const persistence = Persistence.create({ storage: store, key: 'coach' });
  const realEngine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
  const calls = [];
  const engine = Object.fromEntries(Object.entries(realEngine).map(([name, fn]) => [name, (...args) => { calls.push(name); return fn(...args); }]));
  const session = Session.create({ persistence, engine });
  return { store, persistence, engine, session, calls };
}

test('wrong response survives a failed save and cannot be replaced by a corrected resubmission', () => {
  const { store, session, calls } = setup();
  assert.equal(session.start(startOptions).saved, true);
  store.failWrite = true;
  const failure = session.submitAnswer(answer({ answer: 'wrong', result: 'wrong' }));
  assert.equal(failure.status, 'unavailable');
  assert.equal(failure.saved, false);
  assert.equal(failure.committed.database.practice.attempts.length, 0);
  assert.equal(failure.pending.database.practice.attempts[0].result, 'wrong');
  assert.equal(session.submitAnswer(answer()).reason, 'pending-write');
  assert.equal(calls.filter(name => name === 'submitAnswer').length, 1);
  store.failWrite = false;
  const recovered = session.retry();
  assert.equal(recovered.saved, true);
  assert.equal(recovered.pending, null);
  assert.equal(recovered.committed.database.practice.attempts[0].result, 'wrong');
  assert.equal(Recall.count(recovered.committed.database.words[0]), 0);
  assert.equal(session.submitAnswer(answer()).errorCode, 'ATTEMPT_CONFLICT');
  const correction = session.submitAnswer(answer({ attemptId: 'correction1', at: at(20) }));
  assert.equal(correction.saved, true);
  assert.equal(correction.committed.database.practice.attempts[0].result, 'wrong');
  assert.equal(correction.committed.database.practice.attempts[1].kind, 'correction');
  assert.equal(correction.committed.database.practice.attempts[1].assisted, true);
  assert.equal(Recall.count(correction.committed.database.words[0]), 0);
});

test('every new transition is locked while any save remains unresolved', () => {
  const { store, session, calls } = setup();
  session.start(startOptions);
  store.failWrite = true;
  session.saveDraft({ attemptId: 'a1', answer: 'unfinished', at: at(1) });
  const count = calls.length;
  const transitions = {
    initialize: [], start: [{ ...startOptions, attemptId: 'a2' }], saveDraft: [{ attemptId: 'a1', answer: 'changed', at: at(2) }],
    markHint: [{ attemptId: 'a1', at: at(2) }], reveal: [{ attemptId: 'a1', at: at(2) }],
    submitAnswer: [answer()], advance: [{ attemptId: 'a1', discard: true }], pause: [], resume: [],
  };
  for (const [method, args] of Object.entries(transitions)) {
    const result = session[method](...args);
    assert.equal(result.status, 'blocked', method);
    assert.equal(result.saved, false);
  }
  assert.equal(calls.length, count);
  assert.equal(session.getState().pending.database.practice.pending.draft, 'unfinished');
  assert.equal(session.getState().committed.database.practice.pending.draft, '');
});

test('failed hint and reveal saves must recover before an answer can be submitted', () => {
  for (const method of ['markHint', 'reveal']) {
    const { store, session } = setup();
    session.start(startOptions);
    store.failWrite = true;
    assert.equal(session[method]({ attemptId: 'a1', at: at(1) }).status, 'unavailable');
    assert.equal(session.submitAnswer(answer()).status, 'blocked');
    store.failWrite = false;
    assert.equal(session.retry().saved, true);
    const result = session.submitAnswer(answer());
    assert.equal(result.committed.database.practice.attempts[0].assisted, true);
    assert.equal(Recall.count(result.committed.database.words[0]), 0);
  }
});

test('retry persists the exact candidate without grading again or generating a new timestamp', () => {
  const { store, session, calls } = setup();
  session.start(startOptions);
  store.failWrite = true;
  session.submitAnswer(answer());
  const raw = session.getState().pending.raw;
  const count = calls.length;
  assert.equal(session.retry().status, 'unavailable');
  store.failWrite = false;
  const result = session.retry();
  assert.equal(result.saved, true);
  assert.equal(store.raw, raw);
  assert.equal(calls.length, count);
  assert.equal(result.committed.database.practice.attempts.length, 1);
  assert.equal(result.committed.database.words[0].recall.attempts, 1);
  assert.equal(result.committed.database.practice.attempts[0].at, at(10));
});

test('acknowledgement failure, read confirmation and retry never permit a replacement response', () => {
  const { store, session } = setup();
  session.start(startOptions);
  store.failAfterWrite = true;
  assert.equal(session.submitAnswer(answer({ result: 'wrong', answer: 'wrong' })).status, 'unavailable');
  const writes = store.writes;
  const observed = session.read();
  assert.equal(observed.status, 'success');
  assert.equal(observed.saved, false);
  assert.equal(observed.recoveryRequired, true);
  assert.equal(session.submitAnswer(answer()).status, 'blocked');
  store.failAfterWrite = false;
  const retried = session.retry();
  assert.equal(retried.saved, true);
  assert.equal(retried.committed.database.practice.attempts[0].result, 'wrong');
  assert.equal(store.writes, writes);
});

test('conflicting storage is observed but never automatically used to rebase pending work', () => {
  const { store, session } = setup();
  session.start(startOptions);
  store.failWrite = true;
  session.submitAnswer(answer({ result: 'wrong', answer: 'wrong' }));
  const pending = session.getState().pending;
  store.failWrite = false;
  const other = JSON.parse(store.raw);
  other.profile.name = 'Other tab';
  store.raw = JSON.stringify(other);
  const external = store.raw;
  assert.equal(session.retry().status, 'conflict');
  session.read();
  assert.equal(session.getState().committed.database.profile.name, 'Other tab');
  assert.deepEqual(session.getState().pending, pending);
  assert.equal(session.retry().status, 'conflict');
  assert.equal(store.raw, external);
  assert.equal(session.advance({ attemptId: 'a1' }).status, 'blocked');
});

test('corrupt or unreadable storage cannot destroy the last committed and pending snapshots', () => {
  const { store, session } = setup();
  session.start(startOptions);
  store.failWrite = true;
  session.submitAnswer(answer());
  const before = session.getState();
  store.failRead = true;
  assert.equal(session.read().status, 'unavailable');
  assert.equal(session.retry().status, 'unavailable');
  store.failRead = false;
  store.raw = '{broken';
  assert.equal(session.read().status, 'invalid');
  assert.equal(session.retry().status, 'invalid');
  assert.deepEqual(session.getState().pending, before.pending);
  assert.deepEqual(session.getState().committed, before.committed);
  assert.equal(store.raw, '{broken');
});

test('a new coordinator adopts an existing Persistence pending intent and keeps it locked', () => {
  const { store, persistence, engine, session } = setup();
  session.start(startOptions);
  store.failWrite = true;
  session.submitAnswer(answer({ result: 'wrong', answer: 'wrong' }));
  const reopened = Session.create({ persistence, engine });
  assert.equal(reopened.submitAnswer(answer()).status, 'blocked');
  store.failWrite = false;
  const result = reopened.retry();
  assert.equal(result.saved, true);
  assert.equal(result.committed.database.practice.attempts[0].result, 'wrong');
});

test('returned committed and pending objects are detached from the retained intent', () => {
  const { store, session } = setup();
  const started = session.start(startOptions);
  started.committed.database.words[0].word_de = 'changed';
  store.failWrite = true;
  const failed = session.submitAnswer(answer({ answer: 'wrong', result: 'wrong' }));
  failed.pending.database.practice.attempts[0].result = 'correct';
  failed.pending.database.practice.attempts[0].answer = 'die Freigabe';
  failed.pending.expectedRaw = 'changed';
  failed.committed.database.profile.name = 'changed';
  const state = session.getState();
  assert.equal(state.pending.database.practice.attempts[0].result, 'wrong');
  assert.equal(state.committed.database.words[0].word_de, 'die Freigabe');
  store.failWrite = false;
  assert.equal(session.retry().committed.database.practice.attempts[0].result, 'wrong');
});

test('successful pause and resume preserve a saved draft without grading it', () => {
  const { store, session, engine } = setup();
  session.start(startOptions);
  session.saveDraft({ attemptId: 'a1', answer: 'die Frei', at: at(1) });
  assert.equal(session.pause().saved, true);
  const reloaded = Session.create({ persistence: Persistence.create({ storage: store, key: 'coach' }), engine });
  assert.equal(reloaded.getState().committed.database.practice.paused, true);
  const resumed = reloaded.resume();
  assert.equal(resumed.saved, true);
  assert.equal(resumed.committed.database.practice.pending.draft, 'die Frei');
  assert.equal(resumed.committed.database.practice.attempts.length, 0);
  assert.deepEqual(resumed.committed.database.words, fixture().words);
});

test('adapter re-entry cannot advance or replace an in-flight submission', () => {
  const { store, session } = setup();
  session.start(startOptions);
  let blocked;
  store.set = function (_, raw) {
    blocked = session.submitAnswer(answer());
    this.raw = raw;
  };
  const result = session.submitAnswer(answer({ result: 'wrong', answer: 'wrong' }));
  assert.equal(blocked.reason, 'operation-in-progress');
  assert.equal(result.saved, true);
  assert.equal(result.committed.database.practice.attempts[0].result, 'wrong');
  assert.equal(result.committed.database.practice.attempts.length, 1);
});

test('a thrown Persistence call keeps the same local intent for recovery', () => {
  const { persistence, engine } = setup();
  let throwCommit = false;
  const injected = { ...persistence, commit(...args) { if (throwCommit) throw Error('unexpected'); return persistence.commit(...args); } };
  const session = Session.create({ persistence: injected, engine });
  session.start(startOptions);
  throwCommit = true;
  assert.equal(session.submitAnswer(answer({ result: 'wrong', answer: 'wrong' })).reason, 'persistence-commit-threw');
  assert.equal(session.submitAnswer(answer()).status, 'blocked');
  throwCommit = false;
  assert.equal(session.retry().committed.database.practice.attempts[0].result, 'wrong');
});

test('strictly rejected candidate is retained exactly and retry cannot sanitize it into success', () => {
  const { persistence, engine, store } = setup();
  const injected = { ...engine, start(...args) { const db = engine.start(...args); db.negativeZero = -0; return db; } };
  const session = Session.create({ persistence, engine: injected });
  const before = store.raw;
  const rejected = session.start(startOptions);
  assert.equal(rejected.status, 'invalid');
  assert.equal(Object.is(rejected.pending.database.negativeZero, -0), true);
  assert.equal(session.pause().status, 'blocked');
  assert.equal(session.retry().status, 'invalid');
  assert.equal(store.raw, before);
});

test('replacing the underlying pending candidate outside the coordinator is detected', () => {
  const { persistence, store, session } = setup();
  session.start(startOptions);
  store.failWrite = true;
  session.submitAnswer(answer({ result: 'wrong', answer: 'wrong' }));
  const foreign = persistence.getState().committed.database;
  foreign.profile.name = 'Foreign intent';
  persistence.commit(foreign);
  const result = session.retry();
  assert.equal(result.reason, 'pending-intent-changed');
  assert.equal(result.pending.database.practice.attempts[0].result, 'wrong');
});

test('empty storage, unknown transitions and rejected engine input never invent or write data', () => {
  const empty = setup(null);
  assert.equal(empty.session.start(startOptions).reason, 'no-committed-database');
  assert.equal(empty.store.writes, 0);
  const { session, store } = setup();
  assert.equal(session.transition('constructor').reason, 'unknown-transition');
  assert.equal(session.submitAnswer(answer()).reason, 'transition-rejected');
  assert.equal(session.getState().pending, null);
  assert.equal(store.writes, 0);
});

test('a pending intent without its original baseline cannot be silently rebased after read', () => {
  const { store, engine } = setup();
  store.failRead = true;
  const persistence = Persistence.create({ storage: store, key: 'coach' });
  assert.equal(persistence.commit(fixture()).reason, 'missing-baseline');
  const session = Session.create({ persistence, engine });
  store.failRead = false;
  session.read();
  assert.equal(session.retry().reason, 'missing-original-baseline');
  assert.equal(session.start(startOptions).status, 'blocked');
  assert.equal(store.writes, 0);
});

test('browser script loads without UI, network or storage globals', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../practice-session.js'), 'utf8'), context);
  assert.equal(vm.runInContext('typeof PracticeSession.create', context), 'function');
  assert.throws(() => Session.create(), /Persistence/);
});
