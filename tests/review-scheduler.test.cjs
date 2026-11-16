const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Scheduler = require('../review-scheduler.js');

const day = n => new Date(2024, 0, n, 12).toISOString();
const plus = (at, ms) => new Date(Date.parse(at) + ms).toISOString();
const clone = value => JSON.parse(JSON.stringify(value));
const word = id => ({ id: id || 'target', word_de: 'die Zielgruppe', status: 'mastered',
  times_seen: 17, correct_streak: 6, recall: { version: 1, successful_recalls: [{ at: day(1), day: '2024-01-01' }] },
  exposure: { total: 4 }, legacy_mastery: { status: 'mastered' }, custom: { note: 'keep me' } });
const record = (w, at, result = 'correct', assisted = false) => Scheduler.record(w, { result, at, assisted });

test('legacy and unseen words stay unscheduled without invented evidence', () => {
  for (const w of [word(), { id: 'new', status: 'new' }, { id: 'null-review', review: null }]) {
    const before = clone(w);
    assert.equal(Scheduler.normalizeWord(w), w);
    assert.deepEqual(w, before);
    assert.equal(Scheduler.isDue(w, day(30)), false);
    assert.deepEqual(Scheduler.dueWords([w], day(30)), []);
  }
});

test('record changes only review and returns the same word', () => {
  const w = word();
  const before = clone(w);
  const recallReference = w.recall;
  assert.equal(record(w, day(1)), w);
  const { review, ...remaining } = w;
  assert.deepEqual(remaining, before);
  assert.equal(w.recall, recallReference);
  assert.equal(review.version, Scheduler.VERSION);
  assert.equal(review.schedule_version, Scheduler.SCHEDULE_VERSION);
  assert.equal(review.stage, 1);
  assert.equal(review.due_at, plus(day(1), Scheduler.DAY_MS));
});

test('independent due successes follow the fixed candidate intervals and cap at thirty days', () => {
  const w = word();
  let at = day(1);
  for (const [index, interval] of [1, 3, 7, 14, 30, 30].entries()) {
    record(w, at);
    assert.equal(w.review.stage, Math.min(index + 1, 5));
    assert.equal(w.review.due_at, plus(at, interval * Scheduler.DAY_MS));
    at = w.review.due_at;
  }
  assert.deepEqual(Scheduler.INTERVAL_DAYS, [1, 3, 7, 14, 30]);
  assert.throws(() => Scheduler.INTERVAL_DAYS.push(90));
});

test('due boundary is inclusive and one millisecond early is not due', () => {
  const w = word(); record(w, day(1));
  const due = w.review.due_at;
  assert.equal(Scheduler.isDue(w, plus(due, -1)), false);
  assert.equal(Scheduler.isDue(w, due), true);
  assert.equal(Scheduler.isDue(w, plus(due, 1)), true);
});

test('early and same-day correct attempts do not advance or postpone the deadline', () => {
  const w = word(); record(w, day(1));
  const firstDue = w.review.due_at;
  for (const offset of [1000, 60000, 3600000, Scheduler.DAY_MS - 1]) record(w, plus(day(1), offset));
  assert.equal(w.review.stage, 1);
  assert.equal(w.review.due_at, firstDue);
  record(w, firstDue);
  const secondDue = w.review.due_at;
  record(w, plus(firstDue, Scheduler.DAY_MS));
  assert.equal(w.review.stage, 2);
  assert.equal(w.review.due_at, secondDue);
});

test('a different local day less than twenty-four hours later cannot qualify', () => {
  const w = word();
  const late = new Date(2024, 0, 1, 23, 55);
  const shortlyAfter = new Date(2024, 0, 2, 0, 5);
  record(w, late); record(w, shortlyAfter);
  assert.equal(w.review.stage, 1);
  assert.equal(w.review.due_at, plus(late.toISOString(), Scheduler.DAY_MS));
});

test('failure and partial answers reset schedule, while immediate corrections cannot advance', () => {
  for (const result of ['wrong', 'half']) {
    const w = word(); record(w, day(1)); record(w, day(2));
    record(w, day(5), result);
    assert.equal(w.review.stage, 0);
    assert.equal(w.review.due_at, day(6));
    record(w, plus(day(5), 60000));
    assert.equal(w.review.stage, 0);
    assert.equal(w.review.due_at, day(6));
    assert.equal(Scheduler.isDue(w, day(6)), true);
    record(w, day(6));
    assert.equal(w.review.stage, 1);
    assert.equal(w.review.due_at, day(7));
    assert.equal(w.status, 'mastered'); // Mastery is owned by RecallEvidence, not this module.
  }
});

test('assisted correct preserves stage, shortens review and blocks same-day advancement', () => {
  const w = word(); record(w, day(1)); record(w, day(2));
  assert.equal(w.review.stage, 2);
  record(w, day(3), 'correct', true);
  assert.equal(w.review.stage, 2);
  assert.equal(w.review.due_at, day(4));
  record(w, plus(day(3), 3600000));
  assert.equal(w.review.stage, 2);
  assert.equal(w.review.due_at, day(4));
  record(w, day(4));
  assert.equal(w.review.stage, 3);
});

test('first assisted answer schedules next-day practice without a confident stage', () => {
  const w = word(); record(w, day(1), 'correct', true);
  assert.equal(w.review.stage, 0);
  assert.equal(w.review.last_advanced_at, '');
  assert.equal(Scheduler.isDue(w, day(1)), false);
  record(w, day(2));
  assert.equal(w.review.stage, 1);
});

test('repeated same-day failures and assisted corrections retain the first short deadline', () => {
  const w = word(); record(w, day(1), 'wrong');
  for (const [offset, result, assisted] of [[1, 'half', false], [2, 'correct', true], [3, 'wrong', false]]) {
    record(w, plus(day(1), offset * 3600000), result, assisted);
    assert.equal(w.review.due_at, day(2));
    assert.equal(w.review.stage, 0);
  }
});

test('identical timestamp/result replay is idempotent; conflicting failure is conservative', () => {
  const w = word(); record(w, day(1));
  const before = clone(w);
  record(w, day(1));
  assert.deepEqual(w, before);
  record(w, day(1), 'wrong');
  assert.equal(w.review.stage, 0);
});

test('clock rollback rejects attempts atomically and cannot invent due history', () => {
  const w = word(); record(w, day(5));
  const before = clone(w);
  for (const result of ['correct', 'wrong', 'half']) {
    assert.throws(() => record(w, day(1), result), RangeError);
    assert.deepEqual(w, before);
  }
  assert.equal(Scheduler.isDue(w, day(1)), false);
  record(w, day(6));
  assert.equal(w.review.stage, 2);
});

test('a future last-attempt timestamp suppresses due selection even with an earlier due date', () => {
  const w = word(); record(w, day(1));
  w.review.last_attempt_at = day(10);
  assert.equal(Scheduler.isDue(w, day(3)), false);
  assert.equal(Scheduler.isDue(w, day(10)), true);
});

test('invalid or future-version imported state is preserved, never silently migrated or due', () => {
  const valid = word(); record(valid, day(1));
  const edits = [
    r => { r.version = 999; }, r => { r.schedule_version = 'future'; },
    r => { r.stage = 99; }, r => { r.stage = 1.5; },
    r => { r.due_at = 'not-a-date'; }, r => { r.due_at = '2024-02-30T12:00:00Z'; },
    r => { r.last_assisted = 'false'; }, r => { r.last_advanced_at = day(9); },
    r => { r.last_advanced_day = '2024-02-30'; }, r => { r.last_result = 'wrong'; },
    r => { delete r.blocked_until; }, r => { r.due_at = day(1); },
  ];
  for (const edit of edits) {
    const w = clone(valid); edit(w.review); const before = clone(w);
    Scheduler.normalizeWord(w);
    assert.deepEqual(w, before);
    assert.equal(Scheduler.isDue(w, day(30)), false);
    assert.throws(() => record(w, day(30)), TypeError);
    assert.deepEqual(w, before);
  }
  for (const review of [[], 'legacy', { version: 0 }]) {
    const w = { ...word(), review }; const before = clone(w);
    Scheduler.normalizeWord(w); assert.deepEqual(w, before);
    assert.equal(Scheduler.isDue(w, day(30)), false);
    assert.throws(() => record(w, day(30)));
  }
});

test('invalid attempts and timestamps fail before changing the word', () => {
  const invalidTimes = [null, true, {}, NaN, Infinity, new Date(NaN), '2024-02-30T12:00:00Z',
    '2024-01-01', '2024-01-01T24:00:00Z', '2024-01-01T12:70:00Z', '2024-01-01T12:00:00+24:00'];
  const w = word(); const before = clone(w);
  for (const at of invalidTimes) {
    assert.throws(() => record(w, at)); assert.deepEqual(w, before);
    assert.throws(() => Scheduler.isDue(w, at));
  }
  assert.throws(() => Scheduler.record(w, { result: 'maybe', at: day(1) }));
  assert.throws(() => Scheduler.record(w, { result: 'correct', at: day(1), assisted: 'no' }));
  assert.deepEqual(w, before);
  assert.throws(() => Scheduler.normalizeWord(null));
  assert.throws(() => Scheduler.dueWords({}, day(1)));
});

test('date objects, epoch milliseconds and offset timestamps identify the same instant', () => {
  const inputs = [new Date('2024-01-01T12:00:00Z'), Date.parse('2024-01-01T12:00:00Z'), '2024-01-01T14:00:00+02:00'];
  const results = inputs.map(at => { const w = word(); record(w, at); return w.review; });
  assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
});

test('JSON round trips preserve all scheduling fields and next decision', () => {
  const w = word(); record(w, day(1)); record(w, day(2)); record(w, day(3), 'correct', true);
  w.review.custom_import_note = 'preserve';
  const copy = clone(w);
  Scheduler.normalizeWord(copy); Scheduler.normalizeWord(copy);
  assert.deepEqual(copy, w);
  assert.equal(Scheduler.isDue(copy, day(4)), Scheduler.isDue(w, day(4)));
  record(copy, day(4)); record(w, day(4)); assert.deepEqual(copy, w);
});

test('dueWords returns original references in stable earliest-due order without mutation', () => {
  const late = word('late'); record(late, day(2));
  const early = word('early'); record(early, day(1));
  const tied = word('tied'); record(tied, day(1));
  const fresh = { id: 'fresh' };
  const words = [late, tied, fresh, early]; const before = clone(words);
  assert.deepEqual(Scheduler.dueWords(words, day(3)), [tied, early, late]);
  assert.equal(Scheduler.dueWords(words, day(3))[0], tied);
  assert.deepEqual(words, before);
});

test('elapsed-day schedule remains twenty-four hours across daylight-saving changes', () => {
  for (const date of [new Date(2024, 2, 30, 12), new Date(2024, 9, 26, 12)]) {
    const w = word(); record(w, date);
    assert.equal(Date.parse(w.review.due_at) - date.getTime(), Scheduler.DAY_MS);
    assert.equal(Scheduler.isDue(w, plus(w.review.due_at, -1)), false);
  }
  const w = word(); const start = new Date(2024, 9, 27, 0, 15);
  record(w, start);
  const next = new Date(start.getTime() + Scheduler.DAY_MS);
  if (start.getDate() === next.getDate()) {
    record(w, next); assert.equal(w.review.stage, 1);
    record(w, new Date(2024, 9, 28, 0, 15)); assert.equal(w.review.stage, 2);
  }
});

test('plain browser script exports a usable lexical API without CommonJS', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../review-scheduler.js'), 'utf8'), context);
  assert.equal(vm.runInContext('ReviewScheduler.VERSION', context), 1);
  assert.equal(vm.runInContext("ReviewScheduler.isDue({id:'new'}, '2024-01-01T12:00:00Z')", context), false);
});
