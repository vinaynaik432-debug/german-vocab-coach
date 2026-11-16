const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const BackupData = require('../backup-data.js');
const PracticeEngine = require('../practice-engine.js');
const ReviewScheduler = require('../review-scheduler.js');
const RecallEvidence = require('../recall-evidence.js');
const PracticeData = require('../practice-data.js');
const dependencies = { backupData: BackupData, practiceEngine: PracticeEngine, reviewScheduler: ReviewScheduler };
const Data = PracticeData.create(dependencies);
const Engine = PracticeEngine.create({ recallEvidence: RecallEvidence, reviewScheduler: ReviewScheduler });
const exportedAt = '2026-11-16T18:00:00.000Z';
const at = seconds => new Date(Date.UTC(2026, 10, 15, 12, 0, seconds)).toISOString();
const clone = value => JSON.parse(JSON.stringify(value));

function database() {
  return {
    version: 6, created_at: '2026-05-29T09:00:00.000Z',
    words: ['w1', 'w2'].map(id => ({ id, word_de: 'die Freigabe', word_en: 'approval', status: 'new',
      times_seen: 0, correct_streak: 0, wrong_count: 0, half_count: 0, custom: { note: 'ä ö ü ß' } })),
    sessions: Array.from({ length: 230 }, (_, i) => ({ round_id: `legacy-${i}`, date: at(0),
      score_correct: 2.5, score_total: 3, words_ids: ['word-deleted-long-ago'], custom: { preserved: true } })),
    profile: { name: 'Example', level: 'B1', weeklyGoal: 45, hasChosenName: true, hasChosenLevel: true,
      modeLevels: { vocab: 'B1', story: 'A2', context: 'B1', sentence: 'A2', tense: 'B1' } },
    preferences: { learningFocus: 'marketing', futurePreference: { enabled: true } },
    custom: { preserved: [null, true, 'text', 4.5] },
  };
}

function practiced() {
  let db = Engine.start(database(), { wordId: 'w1', attemptId: 'first-1', at: at(0) });
  db = Engine.submitAnswer(db, { wordId: 'w1', attemptId: 'first-1', answer: 'der Freigabe', result: 'wrong', at: at(1) });
  db = Engine.markHint(db, { attemptId: 'first-1', at: at(2) });
  db = Engine.submitAnswer(db, { wordId: 'w1', attemptId: 'correction-1', answer: 'die Freigabe', result: 'correct', at: at(3) });
  db = Engine.submitAnswer(db, { wordId: 'w1', attemptId: 'correction-2', answer: 'die Freigabe', result: 'correct', at: at(4) });
  return Engine.pause(db);
}

test('requires compatible injected dependencies and refuses future dependency contracts', () => {
  assert.throws(() => PracticeData.create());
  for (const key of ['backupData', 'practiceEngine', 'reviewScheduler']) assert.throws(() => PracticeData.create({ ...dependencies, [key]: {} }));
  assert.throws(() => PracticeData.create({ ...dependencies, practiceEngine: { ...PracticeEngine, VERSION: 2 } }));
  assert.throws(() => PracticeData.create({ ...dependencies, reviewScheduler: { ...ReviewScheduler, VERSION: 2 } }));
});

test('legacy v1 backup opens unchanged without initializing practice or promoting evidence', () => {
  const db = database();
  db.version = 5;
  db.words[0].status = 'mastered';
  db.words[0].recall = { version: 777, historicalEvidence: ['leave intact'] };
  db.words[0].exposure = { version: 999, historicalEvidence: ['leave intact'] };
  const original = clone(db);
  const oldText = BackupData.stringify(db, { exportedAt, maxDatabaseVersion: 6 });
  const restored = Data.parse('\uFEFF' + oldText);
  assert.equal(restored.format_version, 1);
  assert.deepEqual(restored.database, original);
  assert.equal(Object.hasOwn(restored.database, 'practice'), false);
  assert.deepEqual(db, original);
});

test('explicit initialization adds empty practice exactly once and preserves every legacy field', () => {
  const db = database();
  db.version = 5;
  db.words[0].status = 'mastered';
  db.words[0].recall = { version: 0, correctDates: ['2020-01-01'] };
  const original = clone(db);
  const candidate = Data.initializeCandidate(db);
  assert.deepEqual(candidate.practice, { version: 1, attempts: [], pending: null, paused: false });
  const { practice, ...legacy } = candidate;
  assert.deepEqual(legacy, original);
  assert.deepEqual(Data.initializeCandidate(candidate), candidate);
  assert.deepEqual(db, original);
  assert.notEqual(candidate.words, db.words);
});

test('new v2 backup round trip preserves answers, correction history, pending state and all sessions', () => {
  const db = practiced(); const original = clone(db);
  const text = Data.stringify(db, { exportedAt });
  const restored = Data.parse(text);
  assert.equal(restored.format, BackupData.FORMAT);
  assert.equal(restored.format_version, 2);
  assert.equal(restored.exported_at, exportedAt);
  assert.deepEqual(restored.database, original);
  assert.equal(restored.database.sessions.length, 230);
  assert.equal(restored.database.practice.attempts[0].result, 'wrong');
  assert.equal(restored.database.practice.attempts[1].kind, 'correction');
  assert.equal(restored.database.practice.attempts[1].assisted, true);
  assert.equal(restored.database.practice.pending.phase, 'feedback');
  assert.equal(restored.database.practice.paused, true);
  assert.deepEqual(db, original);
  restored.database.practice.pending.draft = 'changed copy';
  assert.deepEqual(db, original);
});

test('older live backup parser rejects the new envelope instead of accepting unrecognized state', () => {
  const text = Data.stringify(practiced(), { exportedAt });
  assert.throws(() => BackupData.parse(text, { maxDatabaseVersion: 6 }), /format is not supported/);
});

test('unsubmitted drafts and assistance survive without invented answers', () => {
  let db = Engine.start(database(), { wordId: 'w1', attemptId: 'draft-only', at: at(0) });
  db = Engine.saveDraft(db, { attemptId: 'draft-only', answer: 'die Frei', at: at(1) });
  db = Engine.reveal(db, { attemptId: 'draft-only', at: at(2) });
  const restored = Data.parse(Data.stringify(db, { exportedAt })).database;
  assert.deepEqual(restored, db);
  assert.equal(restored.practice.attempts.length, 0);
  assert.equal(restored.words[0].recall, undefined);
  assert.equal(restored.words[0].review, undefined);
});

test('unknown fields in supported schemas are retained rather than silently stripped', () => {
  const db = practiced();
  db.practice.futureMetadata = { text: 'preserve opaque data' };
  db.practice.pending.futureMetadata = [1, 2, 3];
  db.practice.attempts[0].futureMetadata = { original: true };
  db.practice.attempts[0].request.futureMetadata = 'request metadata';
  db.words[0].review.futureMetadata = { version: 'opaque; not the schedule version' };
  const backup = Data.create(db, { exportedAt });
  backup.futureEnvelopeMetadata = { preserve: true };
  assert.deepEqual(Data.validateBackup(backup), backup);
  assert.deepEqual(Data.parse(JSON.stringify(backup)), backup);
});

test('future envelope, DB, practice and review versions are rejected with no override bypass', () => {
  const edits = [
    b => { b.format_version = 3; }, b => { b.database.version = 7; },
    b => { b.database.practice.version = 2; }, b => { b.database.words[0].review.version = 2; },
    b => { b.database.words[0].review.schedule_version = 'future-policy'; },
  ];
  for (const edit of edits) {
    const backup = Data.create(practiced(), { exportedAt }); edit(backup); const before = clone(backup);
    assert.throws(() => Data.validateBackup(backup)); assert.deepEqual(backup, before);
    assert.throws(() => Data.parse(JSON.stringify(backup)));
  }
  assert.throws(() => Data.create(database(), { exportedAt, maxDatabaseVersion: 999 }), /cannot be overridden/);
  assert.throws(() => Data.initializeCandidate({ ...database(), practice: { version: 2 } }));
});

test('malformed review schedules are rejected rather than normalized into missing or fake due data', () => {
  const edits = [
    r => { r.stage = 99; }, r => { r.stage = 1; }, r => { r.last_assisted = 'true'; },
    r => { r.due_at = '2026-02-30T12:00:00Z'; }, r => { r.due_at = '2026-11-16T24:00:00Z'; },
    r => { r.last_advanced_day = '2026-01-01'; }, r => { r.blocked_day = ''; },
    r => { delete r.blocked_until; }, r => { r.due_at = at(0); },
  ];
  for (const edit of edits) {
    const db = practiced(); edit(db.words[0].review); const before = clone(db);
    assert.throws(() => Data.create(db, { exportedAt })); assert.deepEqual(db, before);
  }
});

test('attempt identity, original request, assistance and chronology are checked', () => {
  const edits = [
    p => { p.attempts.push(clone(p.attempts[0])); },
    p => { p.attempts[0].request.answer = 'a different answer'; },
    p => { p.attempts[1].assisted = false; },
    p => { p.attempts[1].recall_eligible = true; },
    p => { p.attempts[1].first_attempt_id = 'missing-first'; },
    p => { p.attempts[1].source = p.attempts[1].request.source = 'recognition'; },
    p => { p.attempts[1].at = p.attempts[1].request.at = at(-1); },
    p => { p.attempts[1].at = p.attempts[1].request.at = '2026-11-15T12:00:70Z'; },
  ];
  for (const edit of edits) {
    const db = practiced(); edit(db.practice); const before = clone(db);
    assert.throws(() => Data.validateDatabase(db)); assert.deepEqual(db, before);
  }
});

test('pending references, correction lists, assistance and timing must match history', () => {
  const edits = [
    p => { p.pending.word_id = 'missing-word'; },
    p => { p.pending.attempt_id = 'wrong-attempt'; },
    p => { p.pending.phase = 'answering'; },
    p => { p.pending.started_at = at(2); },
    p => { p.pending.updated_at = at(3); },
    p => { p.pending.correction_ids.reverse(); },
    p => { p.pending.correction_ids.pop(); },
    p => { p.pending.hint_used = false; },
  ];
  for (const edit of edits) { const db = practiced(); edit(db.practice); assert.throws(() => Data.create(db, { exportedAt })); }
});

test('historical corrections cannot discard assistance after the prompt is closed', () => {
  const db = Engine.advance(practiced(), { attemptId: 'first-1' });
  db.practice.attempts[2].hint_used = false;
  assert.throws(() => Data.validateDatabase(db), /discarded earlier assistance/);
});

test('retained practiced words need consistent review outcomes but deleted historical words remain auditable', () => {
  const missing = practiced(); delete missing.words[0].review;
  assert.throws(() => Data.validateDatabase(missing), /missing its review state/);
  const stale = practiced(); stale.words[0].review.last_attempt_at = at(2);
  assert.throws(() => Data.validateDatabase(stale), /older than/);
  const wrong = practiced(); wrong.words[0].review.last_result = 'half';
  assert.throws(() => Data.validateDatabase(wrong), /disagrees/);
  let history = practiced(); history = Engine.advance(history, { attemptId: 'first-1' });
  history.words = history.words.filter(word => word.id !== 'w1');
  assert.deepEqual(Data.parse(Data.stringify(history, { exportedAt })).database, history);
});

test('validation refuses normalization loss even if a future engine initializer changes data', () => {
  const changingEngine = { ...PracticeEngine, initialize(db) { const next = clone(db); delete next.custom; return next; } };
  const adapter = PracticeData.create({ ...dependencies, practiceEngine: changingEngine });
  const db = practiced(); const before = clone(db);
  assert.throws(() => adapter.validateDatabase(db), /would change/);
  assert.deepEqual(db, before);
  assert.throws(() => adapter.initializeCandidate(database()), /initialization changed/);
});

test('invalid JSON, wrong formats and invalid export timestamps fail without restore effects', () => {
  for (const text of ['{broken', 'word_en,word_de', 'null', '[]', '{}']) assert.throws(() => Data.parse(text));
  assert.throws(() => Data.parse(null));
  assert.throws(() => Data.create(database(), { exportedAt: '2026-11-16T24:00:00Z' }));
  const backup = Data.create(database(), { exportedAt }); backup.format = 'different-app';
  assert.throws(() => Data.validateBackup(backup));
});

test('JSON values that would be lost or execute accessors are rejected before copying', () => {
  class CustomArray extends Array {}
  const customPrototype = Object.create(Object.create(null));
  for (const value of [undefined, NaN, Infinity, -0, Number.MAX_SAFE_INTEGER + 1, () => {}, Symbol('unsafe'), new Date(), [1, , 3], new CustomArray(1), customPrototype]) {
    const db = database(); db.custom.value = value; assert.throws(() => Data.create(db, { exportedAt }));
  }
  const circular = database(); circular.custom.self = circular; assert.throws(() => Data.create(circular));
  const accessor = database(); let invoked = false;
  Object.defineProperty(accessor.custom, 'getter', { enumerable: true, get() { invoked = true; return 'bad'; } });
  assert.throws(() => Data.create(accessor)); assert.equal(invoked, false);
  const hidden = database(); Object.defineProperty(hidden.custom, 'hidden', { value: 'must not disappear' });
  assert.throws(() => Data.create(hidden), /non-enumerable/);
  const malicious = JSON.stringify(Data.create(database(), { exportedAt })).replace('"custom":{', '"custom":{"__proto__":{"polluted":true},');
  assert.throws(() => Data.parse(malicious), /reserved/); assert.equal({}.polluted, undefined);
});

test('size, history-count, identifier, answer-byte and depth limits reject rather than truncate', () => {
  assert.throws(() => Data.parse(' '.repeat(PracticeData.LIMITS.textBytes + 1)), /20 MB/);
  const history = Data.initializeCandidate(database()); history.practice.attempts = Array.from({ length: PracticeData.LIMITS.attempts + 1 }, () => ({}));
  assert.throws(() => Data.create(history), /100000-attempt/);
  const id = database(); id.words[0].id = 'x'.repeat(PracticeData.LIMITS.identifierCharacters + 1);
  assert.throws(() => Data.create(id), /identifier limit/);
  const text = practiced(); text.practice.pending.draft = 'ä'.repeat(PracticeData.LIMITS.answerBytes / 2 + 1);
  assert.throws(() => Data.create(text), /64 KB/);
  const deep = database(); let branch = deep.custom;
  for (let i = 0; i < 70; i++) { branch.child = {}; branch = branch.child; }
  assert.throws(() => Data.create(deep), /nested too deeply/);
});

test('backup operations are detached and have no persistence dependency', () => {
  const db = practiced(); const original = clone(db);
  for (const operation of [() => Data.validateDatabase(db), () => Data.initializeCandidate(db),
    () => Data.create(db, { exportedAt }).database, () => Data.parse(Data.stringify(db, { exportedAt })).database]) {
    const candidate = operation(); candidate.profile.name = 'only in candidate';
    assert.deepEqual(db, original);
  }
});

test('browser script works without CommonJS or TextEncoder with injected dependencies', () => {
  const db = practiced();
  const context = vm.createContext({ databaseText: JSON.stringify(db), exportedAt });
  for (const file of ['backup-data.js', 'recall-evidence.js', 'review-scheduler.js', 'practice-engine.js', 'practice-data.js']) {
    vm.runInContext(fs.readFileSync(require.resolve(`../${file}`), 'utf8'), context);
  }
  const text = vm.runInContext('PracticeData.create({backupData:BackupData,practiceEngine:PracticeEngine,reviewScheduler:ReviewScheduler}).stringify(JSON.parse(databaseText),{exportedAt})', context);
  assert.deepEqual(Data.parse(text).database, db);
});
