const test = require('node:test');
const assert = require('node:assert/strict');
const Migration = require('../coach-migration.js');
const Content = require('../coach-content.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');
const Practice = require('../practice-engine.js');
const Data = require('../practice-data.js').create({ backupData: require('../backup-data.js'), practiceEngine: Practice, reviewScheduler: Review });
const at = '2026-11-16T12:00:00.000Z';
const copy = value => JSON.parse(JSON.stringify(value));
const seed = () => Content.createSeed(at);
const word = (id, extra = {}) => ({ id, word_en: `English ${id}`, word_de: `Deutsch ${id}`, ...extra });
const legacy = (words = [word('custom')]) => ({ version: 1, words });
const migrate = (raw, fresh = seed()) => Migration.upgrade(raw, { seed: fresh, recall: Recall, at });
function frozen(value) { if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); } return value; }

test('real fresh seed contains 1216 unique words and migration is stable on that complete database', () => {
  const original = seed();
  assert.equal(original.words.length, 1216);
  assert.equal(new Set(original.words.map(w => w.id)).size, 1216);
  assert.deepEqual(migrate(original), original);
  assert.deepEqual(Data.initializeCandidate(migrate(original)).words, original.words);
});

test('supported old versions receive only missing defaults and remain valid for the current store', () => {
  for (let version = 1; version <= 6; version++) {
    const raw = { version, words: [word('personal')], profile: { name: 'Learner', level: 'A2' } };
    const result = migrate(raw);
    assert.equal(result.version, 6);
    assert.equal(result.words.length, 1217);
    assert.equal(result.words[0].id, 'personal');
    assert.equal(result.words[0].times_seen, 0);
    assert.equal(result.words[0].status, 'new');
    assert.equal(result.words[0].recall.attempts, 0);
    assert.equal(result.preferences.learningFocus, 'marketing');
    assert.ok(Object.values(result.profile.modeLevels).every(level => level === 'A2'));
    assert.deepEqual(result.sessions, []);
    assert.equal(Data.initializeCandidate(result).practice.attempts.length, 0);
  }
});

test('retains unknown fields, all 230 sessions, removed-word references and profile choices', () => {
  const raw = seed(); raw.version = 4; raw.words = raw.words.slice(0, 1);
  raw.extra = { version: 98, nested: [null, false, 3.25, 'unchanged'] };
  raw.words[0].annotation = { source: 'mine', nested: ['retain'] };
  raw.sessions = Array.from({ length: 230 }, (_, i) => ({ round_id: `historic-${i}`, date: at, words_ids: ['removed-id'], custom: { index: i } }));
  raw.profile.name = 'Learner'; raw.profile.hasChosenName = false;
  raw.profile.custom = { version: 29, note: 'keep' }; raw.profile.modeLevels.extraMode = 'future-level';
  raw.preferences = { learningFocus: 'everyday', themes: { selected: 'custom' } };
  const before = copy(raw), result = migrate(frozen(raw));
  assert.deepEqual(raw, before);
  assert.deepEqual(result.extra, before.extra);
  assert.deepEqual(result.sessions, before.sessions);
  assert.deepEqual(result.profile, before.profile);
  assert.deepEqual(result.preferences, before.preferences);
  assert.deepEqual(result.words[0].annotation, before.words[0].annotation);
  result.sessions[0].custom.index = 99;
  result.extra.nested.push('new'); result.profile.custom.note = 'changed';
  assert.deepEqual(raw, before);
});

test('legacy scores never create recall successes or a review schedule', () => {
  const raw = legacy([word('old', { status: 'mastered', correct_streak: 99, times_seen: 120, last_seen: '2026-11-15' })]);
  raw.sessions = [{ round_id: 'perfect', date: at, accuracy: 100, score_correct: 20, score_total: 20 }];
  const result = migrate(raw), old = result.words[0];
  assert.equal(old.status, 'learning'); assert.equal(Recall.isMastered(old), false);
  assert.equal(old.correct_streak, 99); assert.equal(old.times_seen, 120);
  assert.equal(old.legacy_mastery.status, 'mastered');
  assert.deepEqual(old.recall.successful_recalls, []);
  assert.equal(Object.hasOwn(old, 'review'), false);
  assert.deepEqual(result.sessions, raw.sessions);
  assert.ok(result.words.slice(1).every(w => w.status === 'new' && w.recall.attempts === 0));
});

test('existing empty recall cannot leave an unsupported mastered label', () => {
  const raw = seed(); raw.words = raw.words.slice(0, 1);
  raw.words[0].status = 'mastered'; raw.words[0].correct_streak = 99;
  raw.words[0].recall.extension = { future: ['keep'] };
  const recall = copy(raw.words[0].recall), result = migrate(raw);
  assert.equal(result.words[0].status, 'learning');
  assert.deepEqual(result.words[0].recall, recall);
  assert.equal(result.words[0].legacy_mastery.correct_streak, 99);
});

test('verified recall, review schedule, exposure and unknown evidence are preserved exactly', () => {
  const raw = seed(); raw.words = raw.words.slice(0, 1); const w = raw.words[0];
  for (const day of ['11', '13', '15']) Recall.record(w, { result: 'correct', at: `2026-11-${day}T12:00:00.000Z` });
  Review.record(w, { result: 'correct', at: '2026-11-15T12:00:00.000Z' });
  w.recall.extra = { keep: true }; w.review.extra = ['keep'];
  w.exposure = { version: 50, opaque: ['future evidence is not normalized'] };
  const before = copy(w), result = migrate(raw);
  assert.equal(Recall.isMastered(result.words[0]), true);
  assert.deepEqual(result.words[0], before);
});

test('pending practice and raw answers are never graded or rewritten by migration', () => {
  const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
  let raw = seed(); raw.words = raw.words.slice(0, 1);
  raw = engine.start(raw, { wordId: raw.words[0].id, attemptId: 'pending-1', at });
  raw = engine.saveDraft(raw, { attemptId: 'pending-1', answer: 'unfinished  ä ', at });
  raw = engine.pause(raw);
  const before = copy(raw), result = migrate(raw);
  assert.deepEqual(result.practice, before.practice);
  assert.deepEqual(result.words[0], before.words[0]);
  assert.equal(result.practice.attempts.length, 0);
});

test('future database or recall versions are rejected without changing the source', () => {
  for (const raw of [{ ...legacy(), version: 7 }, legacy([word('future', { recall: { version: 2, successes: ['keep'] } })]), legacy([word('invalid', { recall: null })])]) {
    const before = copy(raw);
    assert.throws(() => migrate(raw), /Unsupported|unsupported/);
    assert.deepEqual(raw, before);
  }
});

test('unowned future review and practice data are retained for downstream recovery, never downgraded', () => {
  const raw = legacy([word('future', { review: { version: 7, next: { keep: true } } })]);
  raw.practice = { version: 40, records: ['keep'] };
  const result = migrate(raw);
  assert.deepEqual(result.words[0].review, raw.words[0].review);
  assert.deepEqual(result.practice, raw.practice);
  assert.throws(() => Data.initializeCandidate(result), /unsupported|Unsupported/);
});

test('normalized matching adds metadata without replacing custom text, IDs or progress', () => {
  const fresh = seed(), existing = copy(fresh.words[0]);
  existing.id = 'personal-responsibility'; existing.word_en = `  ${existing.word_en.toUpperCase()} `;
  existing.word_de = existing.word_de.toUpperCase(); existing.times_seen = 8; existing.status = 'learning';
  existing.notes = 'My own example'; delete existing.curriculum_id;
  const result = migrate(legacy([existing]), fresh);
  assert.equal(result.words.length, 1216);
  assert.equal(result.words[0].id, existing.id); assert.equal(result.words[0].word_en, existing.word_en);
  assert.equal(result.words[0].times_seen, 8); assert.equal(result.words[0].notes, 'My own example');
  assert.equal(result.words[0].curriculum_id, fresh.words[0].curriculum_id);
});

test('saved curriculum references and duplicate saved words are never reassigned or removed', () => {
  const fresh = seed(), a = { ...fresh.words[0], id: 'mine-a', curriculum_id: 'future-custom-id' };
  const b = { ...fresh.words[0], id: 'mine-b' };
  const raw = legacy([a, b]); raw.sessions = [{ round_id: 'saved', date: at, words_ids: ['mine-a', 'mine-b'] }];
  const result = migrate(raw, fresh);
  assert.equal(result.words.length, 1217);
  assert.equal(result.words[0].curriculum_id, 'future-custom-id');
  assert.deepEqual(result.words.slice(0, 2).map(w => w.id), ['mine-a', 'mine-b']);
  assert.deepEqual(result.sessions, raw.sessions);
});

test('missing IDs avoid all existing IDs including later rows', () => {
  const missing = word('unused'); delete missing.id;
  const result = migrate(legacy([missing, word('legacy-1'), word('legacy-1-2')]));
  assert.equal(result.words[0].id, 'legacy-1-3');
  assert.equal(result.words[1].id, 'legacy-1');
  assert.equal(new Set(result.words.map(w => w.id)).size, result.words.length);
});

test('seed collisions allocate stable safe IDs without changing saved IDs or history', () => {
  const raw = legacy([word('seed-001'), word('imported-seed-001'), word('imported-seed-001-2')]);
  raw.sessions = [{ round_id: 'history', date: at, words_ids: ['seed-001', 'imported-seed-001'] }];
  const result = migrate(raw);
  assert.equal(result.words.find(w => w.word_de === seed().words[0].word_de).id, 'imported-seed-001-3');
  assert.deepEqual(result.words.slice(0, 3).map(w => w.id), raw.words.map(w => w.id));
  assert.deepEqual(result.sessions, raw.sessions);
  assert.equal(new Set(result.words.map(w => w.id)).size, result.words.length);
  assert.deepEqual(migrate(result), result);
});

test('newly appended seed words participate in pair deduplication and never alias the seed', () => {
  const fresh = seed(); fresh.words = fresh.words.slice(0, 1);
  fresh.words.push({ ...copy(fresh.words[0]), id: 'different-seed-id' });
  const before = copy(fresh), result = migrate(legacy([]), frozen(fresh));
  assert.equal(result.words.length, 1);
  result.words[0].recall.successful_recalls.push({ at, day: '2026-11-16' });
  result.profile.modeLevels.vocab = 'A1';
  assert.deepEqual(fresh, before);
});

test('word-pair keys distinguish a literal separator in either language', () => {
  const fresh = seed(); fresh.words = [{ ...fresh.words[0], id: 'new-pair', word_en: 'a', word_de: 'b|c' }];
  const result = migrate(legacy([word('old-pair', { word_en: 'a|b', word_de: 'c' })]), fresh);
  assert.equal(result.words.length, 2);
});

test('duplicate saved IDs and invalid identifiers fail instead of rewriting references', () => {
  for (const words of [[word('same'), word('same')], [word('')], [word(12)], [word(null)]]) assert.throws(() => migrate(legacy(words)), /identif/);
  const fresh = seed(); fresh.words[1].id = fresh.words[0].id;
  assert.throws(() => migrate(legacy([]), fresh), /duplicate identifiers/);
});

test('legacy decimal counter strings migrate exactly, while invalid or future values are not clamped', () => {
  const raw = legacy([word('old', { times_seen: '42', wrong_count: '2' })]);
  assert.equal(migrate(raw).words[0].times_seen, 42);
  for (const value of [-1, 1.5, true, null, '', '1e2', Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => migrate(legacy([word('bad', { times_seen: value })])));
  }
  for (const change of [db => { db.words[0].status = 'future'; }, db => { db.words[0].difficulty = 'C2'; },
    db => { db.preferences = { learningFocus: 'future' }; }, db => { db.profile = { level: 'C2' }; },
    db => { db.profile = { weeklyGoal: 101 }; }, db => { db.sessions = null; }]) {
    const bad = legacy(); change(bad); const before = copy(bad);
    assert.throws(() => migrate(bad)); assert.deepEqual(bad, before);
  }
});

test('non-JSON extensions fail before a lossy clone or accessor invocation', () => {
  let getterReads = 0;
  const accessor = legacy(); Object.defineProperty(accessor, 'hidden', { enumerable: true, get() { getterReads++; return 1; } });
  const hidden = legacy(); Object.defineProperty(hidden, 'hidden', { value: 1 });
  const symbol = legacy(); symbol[Symbol('history')] = 'retain';
  const cycle = legacy(); cycle.extra = cycle;
  const reserved = JSON.parse('{"version":1,"words":[],"extra":{"__proto__":{"polluted":true}}}');
  for (const raw of [accessor, hidden, symbol, cycle, reserved, { ...legacy(), extra: undefined }, { ...legacy(), extra: -0 },
    { ...legacy(), extra: NaN }, { ...legacy(), extra: new Date() }, { ...legacy(), extra: [, 'hole'] }]) assert.throws(() => migrate(raw));
  assert.equal(getterReads, 0);
  assert.equal({}.polluted, undefined);
});

test('invalid timestamps are rejected while valid saved creation times remain unchanged', () => {
  const raw = legacy(); raw.created_at = '2020-01-01T15:00:00+02:00'; raw.words[0].created_at = raw.created_at;
  assert.equal(migrate(raw).created_at, raw.created_at);
  for (const invalid of ['2026-02-30T12:00:00.000Z', '2026-11-16T25:00:00.000Z', 'tomorrow', null]) {
    assert.throws(() => migrate({ ...raw, created_at: invalid }), /date/);
  }
  assert.throws(() => Migration.upgrade(raw, { seed: seed(), recall: Recall, at: 'today' }), /timestamp/);
});
