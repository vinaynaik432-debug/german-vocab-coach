const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Practice = require('../practice-engine.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');

const at = (day, second = 0) => new Date(2024, 0, day, 12, 0, second).toISOString();
const fresh = () => ({
  version: 6, words: [{ id: 'w1', word_en: 'the target group', word_de: 'die Zielgruppe', status: 'new', times_seen: 0, correct_streak: 0, wrong_count: 0, half_count: 0 }],
  sessions: [{ round_id: 'legacy', date: at(1), score_correct: 4, score_total: 5 }],
  profile: { name: 'Learner', level: 'B1' }, preferences: { learningFocus: 'marketing' }, extra: { retained: ['unknown', 42] },
});

function setup() {
  const calls = [];
  const scheduler = {
    normalizeWord(word) { return word; },
    record(word, options) { calls.push({ wordId: word.id, ...options }); word.review = { version: 1, test_record_count: (word.review?.test_record_count || 0) + 1 }; return word; },
  };
  return { engine: Practice.create({ recallEvidence: Recall, reviewScheduler: scheduler }), calls };
}
const start = (engine, db, id = 'a1', day = 1, source = 'typed') => engine.start(db, { wordId: 'w1', attemptId: id, at: at(day), source });
const submit = (engine, db, options = {}) => engine.submitAnswer(db, {
  attemptId: 'a1', wordId: 'w1', answer: 'die Zielgruppe', result: 'correct', at: at(1, 10), ...options,
});
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const errorCode = code => error => error.code === code;

test('initial migration preserves every existing database field and remains idempotent', () => {
  const original = freeze(fresh());
  const migrated = Practice.initialize(original);
  assert.deepEqual(migrated.practice, { version: 1, attempts: [], pending: null, paused: false });
  const { practice, ...rest } = migrated;
  assert.deepEqual(rest, original);
  assert.notStrictEqual(migrated.words, original.words);
  assert.deepEqual(Practice.initialize(migrated), migrated);
});

test('draft, hint, reveal, pause, reload and resume never grade or lose typed work', () => {
  const { engine, calls } = setup();
  const original = fresh();
  let db = start(engine, original);
  db = engine.saveDraft(db, { attemptId: 'a1', answer: 'die Zielgr', at: at(1, 1) });
  db = engine.markHint(db, { attemptId: 'a1', at: at(1, 2) });
  db = engine.reveal(db, { attemptId: 'a1', at: at(1, 3) });
  db = engine.pause(db);
  const saved = JSON.parse(JSON.stringify(db));
  const restored = engine.resume(engine.initialize(saved));
  assert.equal(restored.practice.pending.draft, 'die Zielgr');
  assert.equal(restored.practice.pending.hint_used, true);
  assert.equal(restored.practice.pending.revealed, true);
  assert.equal(restored.practice.attempts.length, 0);
  assert.deepEqual(restored.words, original.words);
  assert.deepEqual(restored.sessions, original.sessions);
  assert.deepEqual(calls, []);
});

test('correct direct first attempts retain the existing three-day mastery rule', () => {
  const { engine, calls } = setup();
  let db = fresh();
  for (let day = 1; day <= 3; day += 1) {
    const id = `a${day}`;
    db = start(engine, db, id, day);
    db = submit(engine, db, { attemptId: id, at: at(day, 10) });
    assert.equal(db.practice.pending.phase, 'feedback');
    assert.equal(db.practice.attempts.at(-1).recall_eligible, true);
    db = engine.advance(db, { attemptId: id });
  }
  assert.equal(Recall.count(db.words[0]), 3);
  assert.equal(db.words[0].status, 'mastered');
  assert.equal(calls.length, 3);
  assert.equal(calls.every(call => !call.assisted), true);
  assert.deepEqual(db.sessions, fresh().sessions);
});

test('wrong and half first responses retain their original evidence after a correct correction', () => {
  for (const result of ['wrong', 'half']) {
    const { engine, calls } = setup();
    let db = start(engine, fresh());
    db = submit(engine, db, { result, answer: 'der Zielgruppe' });
    const first = JSON.parse(JSON.stringify(db.practice.attempts[0]));
    db = engine.saveDraft(db, { attemptId: 'a1', answer: 'die Zielgruppe', at: at(1, 20) });
    db = submit(engine, db, { attemptId: 'correction1', at: at(1, 30) });
    assert.deepEqual(db.practice.attempts[0], first);
    assert.equal(db.practice.attempts[1].kind, 'correction');
    assert.equal(db.practice.attempts[1].first_attempt_id, 'a1');
    assert.equal(db.practice.attempts[1].assisted, true);
    assert.equal(db.practice.attempts[1].recall_eligible, false);
    assert.equal(db.words[0].recall.attempts, 1);
    assert.equal(db.words[0].recall[result], 1);
    assert.equal(db.words[0].last_result, result);
    assert.equal(Recall.count(db.words[0]), 0);
    assert.equal(db.words[0].exposure.sources.other.correct, 1);
    assert.deepEqual(calls.map(call => call.assisted), [false, true]);
    assert.deepEqual(db.practice.pending.correction_ids, ['correction1']);
  }
});

test('hinted, revealed, explicitly assisted and recognition answers never earn typed evidence', () => {
  for (const assistance of ['hint', 'reveal', 'explicit', 'recognition']) {
    const { engine, calls } = setup();
    const source = assistance === 'recognition' ? 'recognition' : 'typed';
    let db = start(engine, fresh(), 'a1', 1, source);
    if (assistance === 'hint') db = engine.markHint(db, { attemptId: 'a1', at: at(1, 1) });
    if (assistance === 'reveal') db = engine.reveal(db, { attemptId: 'a1', at: at(1, 1) });
    db = submit(engine, db, { source, assisted: assistance === 'explicit' });
    assert.equal(Recall.count(db.words[0]), 0);
    assert.equal(db.words[0].recall.attempts, 0);
    assert.equal(db.words[0].exposure.sources.other.correct, 1);
    assert.equal(db.practice.attempts[0].assisted, true);
    assert.equal(calls[0].assisted, true);
  }
});

test('assisted errors preserve existing typed mastery rather than rewriting it', () => {
  const { engine } = setup();
  const original = fresh();
  for (let day = 1; day <= 3; day += 1) Recall.record(original.words[0], { result: 'correct', at: at(day) });
  const recall = JSON.parse(JSON.stringify(original.words[0].recall));
  const db = submit(engine, start(engine, original, 'a4', 4), { attemptId: 'a4', result: 'wrong', answer: '', assisted: true, at: at(4, 10) });
  assert.deepEqual(db.words[0].recall, recall);
  assert.equal(db.words[0].status, 'mastered');
  assert.equal(db.words[0].exposure.sources.other.wrong, 1);
});

test('double submit, JSON reload, and replay after advancing are exactly idempotent', () => {
  const { engine, calls } = setup();
  let db = submit(engine, start(engine, fresh()));
  assert.deepEqual(submit(engine, freeze(db)), db);
  const reloaded = JSON.parse(JSON.stringify(db));
  assert.deepEqual(submit(engine, reloaded), db);
  db = engine.advance(db, { attemptId: 'a1' });
  db = start(engine, db, 'a2', 2);
  const replayed = submit(engine, db);
  assert.deepEqual(replayed, db);
  assert.equal(replayed.practice.pending.attempt_id, 'a2');
  assert.equal(calls.length, 1);
});

test('the same ID with any changed submission field is rejected even after reload', () => {
  const { engine, calls } = setup();
  const db = JSON.parse(JSON.stringify(submit(engine, start(engine, fresh()))));
  for (const patch of [{ answer: 'Die Zielgruppe' }, { result: 'half' }, { at: at(1, 11) }, { wordId: 'other' }, { source: 'other' }, { assisted: true }]) {
    assert.throws(() => submit(engine, db, patch), errorCode('ATTEMPT_CONFLICT'));
  }
  assert.equal(calls.length, 1);
  assert.equal(db.practice.attempts.length, 1);
});

test('correction submissions are also idempotent and cannot replace the first result', () => {
  const { engine, calls } = setup();
  let db = submit(engine, start(engine, fresh()), { result: 'wrong', answer: '' });
  const correction = { attemptId: 'c1', at: at(1, 20) };
  db = submit(engine, db, correction);
  assert.deepEqual(submit(engine, JSON.parse(JSON.stringify(db)), correction), db);
  assert.throws(() => submit(engine, db, { ...correction, answer: 'changed' }), errorCode('ATTEMPT_CONFLICT'));
  assert.equal(calls.length, 2);
  assert.equal(db.practice.attempts[0].result, 'wrong');
});

test('no operation mutates the input, its legacy sessions, or unknown fields', () => {
  const { engine } = setup();
  let db = fresh();
  const operations = [
    value => engine.initialize(value), value => start(engine, value),
    value => engine.saveDraft(value, { attemptId: 'a1', answer: 'raw <answer> $stuff', at: at(1, 1) }),
    value => engine.markHint(value, { attemptId: 'a1', at: at(1, 2) }),
    value => engine.reveal(value, { attemptId: 'a1', at: at(1, 3) }),
    value => engine.pause(value), value => engine.resume(value),
    value => submit(engine, value), value => engine.advance(value, { attemptId: 'a1' }),
  ];
  for (const operation of operations) {
    const before = JSON.stringify(db);
    const output = operation(freeze(db));
    assert.equal(JSON.stringify(db), before);
    assert.notStrictEqual(output, db);
    assert.deepEqual(output.sessions, fresh().sessions);
    assert.deepEqual(output.extra, fresh().extra);
    assert.deepEqual(output.profile, fresh().profile);
    db = output;
  }
});

test('pending draft requires explicit discard and cannot be silently replaced', () => {
  const { engine } = setup();
  let db = start(engine, fresh());
  db = engine.saveDraft(db, { attemptId: 'a1', answer: 'unfinished', at: at(1, 1) });
  assert.deepEqual(start(engine, db), db);
  assert.throws(() => start(engine, db, 'a2'), errorCode('PENDING_ITEM_CONFLICT'));
  assert.throws(() => engine.advance(db, { attemptId: 'a1' }), errorCode('UNFINISHED_ITEM'));
  const discarded = engine.advance(db, { attemptId: 'a1', discard: true });
  assert.equal(discarded.practice.pending, null);
  assert.deepEqual(discarded.words, fresh().words);
  assert.equal(discarded.practice.attempts.length, 0);
});

test('paused practice cannot be edited or newly graded, and resume keeps all state', () => {
  const { engine } = setup();
  const db = engine.pause(start(engine, fresh()));
  assert.throws(() => submit(engine, db), errorCode('PRACTICE_PAUSED'));
  assert.throws(() => engine.saveDraft(db, { attemptId: 'a1', answer: 'x', at: at(1, 1) }), errorCode('PRACTICE_PAUSED'));
  assert.deepEqual(engine.resume(db).practice.pending, db.practice.pending);
  assert.equal(submit(engine, engine.resume(db)).practice.attempts.length, 1);
});

test('invalid IDs, grades, sources, dates and stale updates cannot alter state', () => {
  const { engine, calls } = setup();
  const db = freeze(start(engine, fresh()));
  for (const patch of [{ attemptId: '' }, { attemptId: 'different' }, { result: 'maybe' }, { source: 'magic' }, { at: '2024-02-30T12:00:00Z' }, { at: '2024-01-01T24:00:00Z' }, { at: 'not a date' }, { at: at(1, -1) }, { assisted: 'yes' }, { answer: null }]) assert.throws(() => submit(engine, db, patch));
  assert.equal(calls.length, 0);
  assert.equal(db.practice.attempts.length, 0);
  assert.equal(db.practice.pending.phase, 'answering');
});

test('dependency failures return no partial candidate and leave the caller database untouched', () => {
  const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: {
    normalizeWord(word) { return word; }, record() { throw new Error('Schedule write rejected'); },
  } });
  const db = freeze(start(engine, fresh()));
  const before = JSON.stringify(db);
  assert.throws(() => submit(engine, db), /Schedule write rejected/);
  assert.equal(JSON.stringify(db), before);
  assert.equal(db.words[0].recall, undefined);
});

test('unknown state versions and malformed histories fail closed without migration data loss', () => {
  const { engine } = setup();
  const good = submit(engine, start(engine, fresh()));
  const changes = [
    db => { db.practice.version = 999; },
    db => { db.practice.attempts.push(db.practice.attempts[0]); },
    db => { db.practice.attempts[0].answer = 'changed'; },
    db => { db.practice.pending.first_attempt_id = 'missing'; },
    db => { db.practice.pending.correction_ids = ['missing']; },
    db => { db.practice.attempts[0].recall_eligible = false; },
  ];
  for (const change of changes) {
    const db = JSON.parse(JSON.stringify(good));
    change(db);
    const before = JSON.stringify(db);
    assert.throws(() => engine.initialize(db));
    assert.equal(JSON.stringify(db), before);
  }
});

test('browser script works without module loading, storage, analytics or DOM globals', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../practice-engine.js'), 'utf8'), context);
  assert.equal(vm.runInContext('PracticeEngine.VERSION', context), 1);
  assert.equal(vm.runInContext('typeof PracticeEngine.create', context), 'function');
  assert.throws(() => Practice.create({ recallEvidence: Recall }), errorCode('MISSING_DEPENDENCY'));
});

test('real scheduler integration keeps review interval and three-day recall evidence distinct', () => {
  const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
  let db = fresh();
  assert.equal(Review.isDue(db.words[0], at(1)), false);
  for (let day = 1; day <= 3; day += 1) {
    const id = `real-${day}`;
    db = start(engine, db, id, day);
    db = submit(engine, db, { attemptId: id, at: at(day, 10) });
    db = engine.advance(db, { attemptId: id });
  }
  assert.equal(db.words[0].status, 'mastered');
  assert.equal(Recall.count(db.words[0]), 3);
  assert.equal(db.words[0].review.stage, 2);
  assert.equal(db.words[0].review.due_at, at(5, 10));
  assert.equal(Review.isDue(db.words[0], at(4, 10)), false);
  assert.equal(Review.isDue(db.words[0], at(5, 10)), true);
});

test('real scheduler sees assisted corrections once and preserves the original next-day deadline', () => {
  const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
  let db = submit(engine, start(engine, fresh()), { answer: 'wrong', result: 'wrong' });
  const originalDue = db.words[0].review.due_at;
  const correction = { attemptId: 'real-correction', at: at(1, 30) };
  db = submit(engine, db, correction);
  assert.equal(db.words[0].review.stage, 0);
  assert.equal(db.words[0].review.last_assisted, true);
  assert.equal(db.words[0].review.due_at, originalDue);
  assert.deepEqual(submit(engine, JSON.parse(JSON.stringify(db)), correction), db);
  assert.equal(Recall.count(db.words[0]), 0);
});

test('real scheduler rejects malformed future state without any partial recall or attempt mutation', () => {
  const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
  const original = fresh();
  original.words[0].review = { version: 999, future: 'preserve me' };
  const db = freeze(start(engine, original));
  const before = JSON.stringify(db);
  assert.throws(() => submit(engine, db), /review state/);
  assert.equal(JSON.stringify(db), before);
  assert.deepEqual(db.words[0].review, original.words[0].review);
});

test('future recall evidence cannot be downgraded by typed or recognition submissions', () => {
  for (const source of ['typed', 'recognition']) {
    const { engine, calls } = setup();
    const original = fresh();
    original.words[0].recall = { version: 999, future_evidence: { keep: 'valuable' } };
    const db = freeze(start(engine, original, 'a1', 1, source));
    const before = JSON.stringify(db);
    assert.throws(() => submit(engine, db, { source }), errorCode('UNSUPPORTED_RECALL_STATE'));
    assert.equal(JSON.stringify(db), before);
    assert.deepEqual(db.words[0].recall, original.words[0].recall);
    assert.equal(db.practice.attempts.length, 0);
    assert.equal(db.practice.pending.first_attempt_id, null);
    assert.equal(calls.length, 0);
  }
});

test('malformed or unknown recall content is preserved rather than normalized away', () => {
  const changes = [
    word => { word.recall = null; },
    word => { word.recall.correct = '1'; },
    word => { word.recall.attempts += 1; },
    word => { word.recall.successful_recalls[0].at = 'not a date'; },
    word => { word.recall.successful_recalls.push({ ...word.recall.successful_recalls[0] }); },
    word => { word.recall.future_metadata = { keep: 'do not drop' }; },
    word => { word.recall.successful_recalls[0].future_metadata = 'do not drop'; },
  ];
  for (const change of changes) {
    const { engine, calls } = setup();
    const original = fresh();
    Recall.record(original.words[0], { result: 'correct', at: at(1) });
    change(original.words[0]);
    const db = freeze(start(engine, original, 'a2', 2));
    const before = JSON.stringify(db);
    assert.throws(() => submit(engine, db, { attemptId: 'a2', at: at(2, 10) }), /recall|Recall/);
    assert.equal(JSON.stringify(db), before);
    assert.equal(calls.length, 0);
  }
});

test('assisted corrections cannot erase unsupported recall evidence or append partial history', () => {
  const { engine, calls } = setup();
  let db = submit(engine, start(engine, fresh()), { result: 'wrong', answer: '' });
  db.words[0].recall = { version: 999, future_evidence: ['preserve'] };
  freeze(db);
  const before = JSON.stringify(db);
  assert.throws(() => submit(engine, db, { attemptId: 'correction', at: at(1, 20) }), errorCode('UNSUPPORTED_RECALL_STATE'));
  assert.equal(JSON.stringify(db), before);
  assert.equal(db.practice.attempts.length, 1);
  assert.equal(db.practice.attempts[0].result, 'wrong');
  assert.equal(calls.length, 1);
});

test('valid recall with a different property order continues recording without a false repair error', () => {
  const { engine } = setup();
  const original = fresh();
  Recall.record(original.words[0], { result: 'correct', at: at(1) });
  original.words[0].recall = Object.fromEntries(Object.entries(original.words[0].recall).reverse());
  const result = submit(engine, start(engine, original, 'a2', 2), { attemptId: 'a2', at: at(2, 10) });
  assert.equal(Recall.count(result.words[0]), 2);
  assert.equal(result.words[0].recall.attempts, 2);
});

test('database accessors and toJSON hooks never execute while preparing a candidate', () => {
  let invoked = 0;
  const shapes = [
    () => Object.defineProperty({}, 'value', { enumerable: true, get() { invoked++; return 'laundered'; } }),
    () => Object.defineProperty({}, 'hidden', { get() { invoked++; return 'laundered'; } }),
    () => Object.defineProperty([], '0', { enumerable: true, get() { invoked++; return 'laundered'; } }),
    () => ({ toJSON() { invoked++; return 'laundered'; } }),
  ];
  for (const shape of shapes) {
    const db = fresh(); db.extra = shape();
    assert.throws(() => Practice.initialize(db), errorCode('INVALID_PRACTICE_STATE'));
  }
  assert.equal(invoked, 0);
});

test('lossy, sparse and prototype-changing values are rejected before an engine clone can sanitize them', () => {
  const extended = [1]; extended.note = 'would disappear';
  const customArray = [1]; Object.setPrototypeOf(customArray, null);
  const cycle = {}; cycle.self = cycle;
  const hidden = Object.defineProperty({}, 'notJson', { value: 'must not disappear' });
  const symbol = { [Symbol('notJson')]: 'must not disappear' };
  const invalid = [hidden, symbol, [1, , ], extended, customArray, Object.create({ custom: true }),
    new Date(), new Map(), new Set(), /re/, new (class Custom {})(), cycle,
    { value: undefined }, { value: 1n }, { value: Symbol('x') }, { value() {} },
    { value: NaN }, { value: Infinity }, { value: -0 }, { value: Number.MAX_SAFE_INTEGER + 1 },
    JSON.parse('{"nested":{"__proto__":{"polluted":true}}}'),
    JSON.parse('{"constructor":{"prototype":{"polluted":true}}}')];
  for (const value of invalid) {
    const db = fresh(); db.extra = value;
    assert.throws(() => Practice.initialize(db), errorCode('INVALID_PRACTICE_STATE'));
  }
  assert.equal({}.polluted, undefined);
});

test('request accessors are rejected without executing during every request-bearing transition', () => {
  const { engine, calls } = setup();
  const db = start(engine, fresh());
  let invoked = 0;
  const bad = () => Object.defineProperty({}, 'attemptId', { enumerable: true, get() { invoked++; return 'a1'; } });
  const actions = [
    () => engine.start(fresh(), bad()), () => engine.saveDraft(db, bad()),
    () => engine.markHint(db, bad()), () => engine.reveal(db, bad()),
    () => engine.advance(db, bad()), () => engine.submitAnswer(db, bad()),
  ];
  for (const action of actions) assert.throws(action, errorCode('INVALID_PRACTICE_STATE'));
  assert.equal(invoked, 0); assert.equal(calls.length, 0);
  assert.equal(db.practice.pending.first_attempt_id, null);
});

test('valid null-prototype records and shared JSON data remain detached and complete', () => {
  const db = fresh();
  const shared = { note: 'ä ö ü ß', score: 0.5, empty: [] };
  db.extra = Object.assign(Object.create(null), { a: shared, b: shared, values: [null, false, Number.MAX_SAFE_INTEGER] });
  const output = Practice.initialize(db);
  assert.deepEqual(output.extra, { a: shared, b: shared, values: [null, false, Number.MAX_SAFE_INTEGER] });
  output.extra.a.note = 'changed';
  assert.equal(db.extra.a.note, 'ä ö ü ß');
  assert.equal(output.extra.b.note, 'ä ö ü ß');
});

test('unsupported exposure cannot be replaced by recognition or assisted correction records', () => {
  const { engine, calls } = setup();
  const original = fresh();
  original.words[0].exposure = { version: 999, future_evidence: { keep: 'valuable' } };
  const db = freeze(start(engine, original, 'a1', 1, 'recognition'));
  const before = JSON.stringify(db);
  assert.throws(() => submit(engine, db, { source: 'recognition' }), errorCode('UNSUPPORTED_EXPOSURE_STATE'));
  assert.equal(JSON.stringify(db), before); assert.equal(calls.length, 0);

  let answered = submit(engine, start(engine, fresh()), { answer: '', result: 'wrong' });
  answered.words[0].exposure = { version: 999, future_evidence: ['keep'] };
  freeze(answered);
  const previous = JSON.stringify(answered);
  assert.throws(() => submit(engine, answered, { attemptId: 'c1', at: at(1, 20) }), errorCode('UNSUPPORTED_EXPOSURE_STATE'));
  assert.equal(JSON.stringify(answered), previous);
  assert.equal(answered.practice.attempts.length, 1); assert.equal(calls.length, 1);
});

test('malformed or unknown exposure fields fail closed before any evidence or scheduler mutation', () => {
  const changes = [
    word => { word.exposure = null; },
    word => { word.exposure.total = '1'; },
    word => { word.exposure.total += 1; },
    word => { word.exposure.sources.story.correct = 5; },
    word => { word.exposure.sources.story.attempts = -1; },
    word => { word.exposure.sources.story.last_at = 'not a date'; },
    word => { delete word.exposure.sources.story.half; },
    word => { word.exposure.future_metadata = { keep: 'valuable' }; },
    word => { word.exposure.sources.story.future_metadata = 'valuable'; },
    word => { word.exposure.sources.future = word.exposure.sources.story; word.exposure.total += 1; },
  ];
  for (const change of changes) {
    const { engine, calls } = setup(); const original = fresh();
    Recall.recordExposure(original.words[0], { source: 'story', at: at(1) });
    change(original.words[0]);
    const db = freeze(start(engine, original, 'a2', 2, 'recognition'));
    const before = JSON.stringify(db);
    assert.throws(() => submit(engine, db, { attemptId: 'a2', source: 'recognition', at: at(2, 10) }), /exposure/);
    assert.equal(JSON.stringify(db), before); assert.equal(calls.length, 0);
  }
});

test('valid ungraded exposure is retained while a new assisted result is added', () => {
  const { engine } = setup(); const original = fresh();
  Recall.recordExposure(original.words[0], { source: 'story', at: at(1) });
  const prior = JSON.parse(JSON.stringify(original.words[0].exposure.sources.story));
  const output = submit(engine, start(engine, original, 'a2', 2, 'recognition'), { attemptId: 'a2', source: 'recognition', at: at(2, 10) });
  assert.deepEqual(output.words[0].exposure.sources.story, prior);
  assert.equal(output.words[0].exposure.total, 2);
  assert.equal(output.words[0].exposure.sources.other.correct, 1);
  assert.equal(Recall.count(output.words[0]), 0);
});

test('typed recall preserves unrelated future exposure without trying to downgrade it', () => {
  const { engine } = setup(); const original = fresh();
  original.words[0].exposure = { version: 999, future_evidence: { keep: 'valuable' } };
  const output = submit(engine, start(engine, original));
  assert.deepEqual(output.words[0].exposure, original.words[0].exposure);
  assert.equal(Recall.count(output.words[0]), 1);
});
