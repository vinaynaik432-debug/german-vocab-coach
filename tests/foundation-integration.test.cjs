const test = require('node:test');
const assert = require('node:assert/strict');
const Persistence = require('../persistence.js');
const Practice = require('../practice-engine.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');
const Backup = require('../backup-data.js');
const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
const startAt = '2026-11-16T12:00:00.000Z';
const answerAt = '2026-11-16T12:00:15.000Z';
const request = { attemptId: 'answer-1', wordId: 'approval', answer: 'die Freigabe', result: 'correct', at: answerAt };

function fixture() {
  return { version: 6, created_at: startAt,
    words: [{ id: 'approval', word_en: 'approval', word_de: 'die Freigabe', status: 'new',
      correct_streak: 0, times_seen: 0, wrong_count: 0, half_count: 0 }],
    sessions: [{ round_id: 'legacy-round', date: startAt, score_correct: 2, score_total: 3 }],
    profile: { name: '', level: 'B1', weeklyGoal: 30, hasChosenName: false, hasChosenLevel: true,
      modeLevels: { vocab: 'B1', story: 'B1', context: 'B1', sentence: 'B1', tense: 'B1' } },
    preferences: { learningFocus: 'marketing' } };
}
function storageFor(database) {
  let raw = JSON.stringify(database), failing = false;
  return { get: () => raw, set: (_, next) => { if (failing) throw new Error('Storage full'); raw = next; },
    fail: value => { failing = value; } };
}
function started() { return engine.start(fixture(), { wordId: 'approval', attemptId: 'answer-1', at: startAt }); }

test('failed answer save leaves committed recall and schedule unchanged; retry commits the same attempt once', () => {
  const initial = started(), storage = storageFor(initial);
  const repository = Persistence.create({ storage, key: 'coach' });
  const candidate = engine.submitAnswer(initial, request);
  storage.fail(true);
  assert.equal(repository.commit(candidate).status, 'unavailable');
  assert.deepEqual(repository.getState().committed.database, initial);
  assert.deepEqual(JSON.parse(storage.get()), initial);
  assert.equal(candidate.words[0].recall.attempts, 1);
  assert.equal(Recall.count(candidate.words[0]), 1);
  assert.equal(repository.getState().pending.database.practice.attempts.length, 1);
  storage.fail(false);
  assert.equal(repository.retry().status, 'success');
  const reopened = Persistence.create({ storage, key: 'coach' }).read().database;
  const replay = engine.submitAnswer(reopened, request);
  assert.deepEqual(replay, reopened);
  assert.equal(replay.practice.attempts.length, 1);
  assert.equal(replay.words[0].recall.attempts, 1);
  assert.equal(Review.isDue(replay.words[0], answerAt), false);
});

test('sequential stale writer cannot overwrite a newer saved answer; pending draft remains recoverable', () => {
  const initial = started(), storage = storageFor(initial);
  const first = Persistence.create({ storage, key: 'coach' });
  const second = Persistence.create({ storage, key: 'coach' });
  const answered = engine.submitAnswer(initial, request);
  const staleDraft = engine.saveDraft(initial, { attemptId: 'answer-1', answer: 'die Frei', at: answerAt });
  assert.equal(first.commit(answered).status, 'success');
  assert.equal(second.commit(staleDraft).status, 'conflict');
  assert.deepEqual(JSON.parse(storage.get()), answered);
  assert.equal(second.getState().pending.database.practice.pending.draft, 'die Frei');
  second.read();
  assert.equal(second.retry().status, 'conflict');
});

test('full backup transport preserves answer history, review metadata and an ungraded paused draft', () => {
  let db = engine.submitAnswer(started(), request);
  db = engine.advance(db, { attemptId: 'answer-1' });
  db = engine.start(db, { wordId: 'approval', attemptId: 'answer-2', at: '2026-11-17T12:00:00.000Z' });
  db = engine.saveDraft(db, { attemptId: 'answer-2', answer: 'die Frei', at: '2026-11-17T12:00:01.000Z' });
  db = engine.pause(db);
  const text = Backup.stringify(db, { exportedAt: '2026-11-17T12:01:00.000Z', maxDatabaseVersion: 6 });
  const restored = Backup.parse(text, { maxDatabaseVersion: 6 }).database;
  assert.deepEqual(restored, db);
  const resumed = engine.resume(engine.initialize(restored));
  assert.equal(resumed.practice.pending.draft, 'die Frei');
  assert.equal(resumed.practice.attempts.length, 1);
  assert.deepEqual(resumed.words, db.words);
  assert.deepEqual(resumed.sessions, fixture().sessions);
  // This proves transport preservation only. New-state semantic validation and
  // live migrations still belong to F4 before the UI can activate these fields.
});

test('hinted correct answer survives save/reopen without becoming unaided recall', () => {
  let db = engine.markHint(started(), { attemptId: 'answer-1', at: '2026-11-16T12:00:05.000Z' });
  const storage = storageFor(db), repository = Persistence.create({ storage, key: 'coach' });
  const candidate = engine.submitAnswer(db, request);
  assert.equal(repository.commit(candidate).status, 'success');
  db = engine.initialize(Persistence.create({ storage, key: 'coach' }).read().database);
  assert.equal(db.practice.attempts[0].assisted, true);
  assert.equal(db.practice.attempts[0].recall_eligible, false);
  assert.equal(Recall.count(db.words[0]), 0);
  assert.notEqual(db.words[0].status, 'mastered');
});
