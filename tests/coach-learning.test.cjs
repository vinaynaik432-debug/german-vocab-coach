const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Coach = require('../coach-learning.js');
const Priorities = require('../learning-priorities.js');
const Review = require('../review-scheduler.js');
const Recall = require('../recall-evidence.js');
const Practice = require('../practice-engine.js');
const Data = require('../practice-data.js').create({ backupData: require('../backup-data.js'), practiceEngine: Practice, reviewScheduler: Review });
const Content = require('../coach-content.js');
const curriculum = require('../curriculum-data.js');
const frequency = require('../frequency-data.js');
const engine = Coach.create({ learningPriorities: Priorities, reviewScheduler: Review, recallEvidence: Recall, curriculum, frequencyData: frequency });
const at = day => new Date(2026, 10, day, 12).toISOString();
const word = (id, de, extra = {}) => ({ id, word_en: id, word_de: de, status: 'new', times_seen: 0, ...extra });
const marketing = (category = 'crm', n = 1) => {
  const row = curriculum.words.filter(item => item.domain === 'marketing' && item.category === category)[n - 1];
  return word(row.curriculum_id, row.word_de, { ...row, id: row.curriculum_id });
};
const db = words => ({ words, sessions: [], preferences: { learningFocus: 'marketing' }, practice: { attempts: [] } });
const ids = result => result.items.map(item => item.word.id);
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }

test('scope intersects exact selected IDs, focus and topic without filler', () => {
  const crm = marketing(), metrics = marketing('metrics'), ordinary = word('water', 'das Wasser', { topic: 'alltag' });
  const words = [crm, metrics, ordinary];
  assert.deepEqual(engine.scopeWords(words, { focus: 'marketing', topic: 'crm' }), [crm]);
  assert.deepEqual(engine.scopeWords(words, { focus: 'everyday' }), [ordinary]);
  assert.deepEqual(engine.scopeWords(words, { wordIds: [] }), []);
  assert.deepEqual(engine.scopeWords(words, { wordIds: ['missing'] }), []);
  assert.deepEqual(engine.scopeWords(words, { wordIds: [crm.id, ordinary.id], focus: 'marketing' }), [crm]);
  assert.deepEqual(ids(engine.queue(db(words), { at: at(16), wordIds: [crm.id], limit: 20 })), [crm.id]);
});

test('curated and explicitly tagged custom work words belong to marketing', () => {
  const custom = word('custom', 'der Funnel', { topic: 'marketing', category: 'crm' });
  assert.equal(engine.isMarketingWord(custom), true);
  assert.deepEqual(engine.scopeWords([custom], { focus: 'marketing', topic: 'crm' }), [custom]);
});

test('due reviews always precede new marketing words and oldest due date wins', () => {
  const recentDue = word('later-due', 'sagen'), olderDue = word('earlier-due', 'sein');
  Review.record(recentDue, { result: 'correct', at: at(14) });
  Review.record(olderDue, { result: 'correct', at: at(12) });
  const result = engine.queue(db([marketing(), recentDue, olderDue]), { at: at(16) });
  assert.deepEqual(ids(result).slice(0, 2), ['earlier-due', 'later-due']);
  assert.deepEqual(result.items.slice(0, 2).map(item => item.reason), ['due', 'due']);
  assert.equal(result.counts.due, 2);
});

test('new marketing follows editorial stage/order; everyday follows actual frequency', () => {
  const work = curriculum.words.filter(row => row.domain === 'marketing').map(row => word(row.curriculum_id, row.word_de, row));
  const result = engine.queue(db(work.reverse()), { at: at(16), focus: 'marketing', limit: 10 });
  assert.deepEqual(result.items.slice(0, 8).map(item => item.word.order), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.ok(result.items.every(item => item.word.priority === 1));
  const everyday = [word('rare', 'der Aufenthaltstitel'), word('phrase', 'auf jeden Fall'), word('common', 'sein')];
  assert.deepEqual(ids(engine.queue(db(everyday), { at: at(16), focus: 'everyday' })), ['common', 'rare', 'phrase']);
  assert.equal(engine.frequency(everyday[1]), null);
  assert.equal(engine.frequencyBand(everyday[1]), 'No single-word estimate');
});

test('all scope preserves the chosen marketing or everyday priority for new items', () => {
  const data = db([word('common', 'sein'), marketing()]);
  assert.equal(engine.queue(data, { at: at(16) }).items[0].word.id, marketing().id);
  data.preferences.learningFocus = 'everyday';
  assert.equal(engine.queue(data, { at: at(16) }).items[0].word.id, 'common');
});

test('unscheduled legacy learning and new material alternate fairly after due work', () => {
  const old = word('old', 'alt', { status: 'learning', last_seen: '2025-01-01', times_seen: 8 });
  const newer = word('newer', 'neu', { status: 'mastered', last_seen: '2026-01-01', times_seen: 4 });
  const result = engine.queue(db([marketing('crm', 1), newer, marketing('crm', 2), old]), { at: at(16) });
  assert.deepEqual(result.items.map(item => item.reason), ['unscheduled-review', 'new-marketing', 'unscheduled-review', 'new-marketing']);
  assert.equal(result.items[0].word.id, 'old');
  assert.equal(result.counts.unscheduled, 2);
  assert.equal(old.review, undefined);
});

test('recent words do not silently repeat; explicit voluntary review can include them', () => {
  const selected = marketing();
  const data = db([selected]);
  const finished = engine.queue(data, { at: at(16), recentIds: [selected.id] });
  assert.equal(finished.complete, true);
  assert.equal(finished.emptyReason, 'recently-practised');
  assert.equal(finished.counts.recentExcluded, 1);
  assert.deepEqual(ids(engine.queue(data, { at: at(16), recentIds: [selected.id], allowRepeat: true })), [selected.id]);
  data.practice.attempts = [{ word_id: selected.id }];
  assert.equal(engine.queue(data, { at: at(16) }).complete, true);
  assert.equal(engine.queue(data, { at: at(16), recentIds: [] }).complete, false);
});

test('future reviews are offered only through voluntary review and never mislabeled due', () => {
  const w = word('scheduled', 'lernen');
  Review.record(w, { result: 'correct', at: at(16) });
  const data = db([w]);
  const result = engine.queue(data, { at: at(16) });
  assert.equal(result.complete, true);
  assert.equal(result.emptyReason, 'nothing-due');
  assert.equal(result.nextDueAt, at(17));
  const voluntary = engine.queue(data, { at: at(16), allowRepeat: true });
  assert.equal(voluntary.items[0].reason, 'voluntary-review');
  assert.equal(voluntary.counts.due, 0);
});

test('invalid/future review versions and future attempt clocks stay out of every queue', () => {
  const unsupported = word('future-version', 'sein', { review: { version: 999 } });
  const broken = word('invalid', 'haben', { review: 'legacy' });
  const futureClock = word('future-clock', 'lernen');
  Review.record(futureClock, { result: 'correct', at: at(18) });
  const data = db([unsupported, broken, futureClock]);
  const before = JSON.stringify(data);
  for (const allowRepeat of [false, true]) {
    const result = engine.queue(data, { at: at(16), allowRepeat });
    assert.equal(result.items.length, 0);
    assert.equal(result.counts.blocked, 3);
    assert.equal(result.emptyReason, 'review-needs-recovery');
  }
  assert.equal(JSON.stringify(data), before);
});

test('read-only schedule predicate distinguishes supported future schedules without mutating evidence', () => {
  const scheduled = word('scheduled', 'sein');
  Review.record(scheduled, { result: 'correct', at: at(16) });
  const before = JSON.stringify(scheduled);
  assert.equal(Review.hasSchedule(freeze(scheduled)), true);
  assert.equal(Review.hasSchedule({ review: { ...scheduled.review, version: 999 } }), false);
  assert.equal(Review.hasSchedule({ review: null }), false);
  assert.equal(Review.hasSchedule({}), false);
  assert.equal(JSON.stringify(scheduled), before);
});

test('queue and progress never mutate input state, even when sorting or reading evidence', () => {
  const data = freeze(db([marketing('crm', 3), word('old', 'alt', { status: 'learning', times_seen: 3 }), marketing()]));
  const before = JSON.stringify(data);
  engine.queue(data, { at: at(16) });
  engine.progress(data, { at: at(16) });
  assert.equal(JSON.stringify(data), before);
});

test('queue validates options and reports zero requested words without widening the scope', () => {
  const data = db([marketing()]);
  assert.throws(() => engine.queue(data), /explicit time/);
  assert.throws(() => engine.queue(data, { at: at(16), focus: 'typo' }));
  assert.throws(() => engine.queue(data, { at: at(16), limit: -1 }));
  assert.throws(() => engine.queue(data, { at: at(16), recentIds: 'one' }));
  const empty = engine.queue(data, { at: at(16), wordIds: [] });
  assert.equal(empty.complete, true);
  assert.equal(empty.emptyReason, 'empty-scope');
  assert.equal(engine.queue(data, { at: at(16), limit: 0 }).complete, false);
});

test('grading retains accepted alternatives from curated metadata and imported JSON', () => {
  for (const [german, alternative] of [['die Conversion-Rate', 'die Konversionsrate'], ['das Werbemittel', 'das Creative'], ['die Besprechung', 'das Meeting']]) {
    const row = curriculum.words.find(item => item.word_de === german);
    assert.equal(engine.gradeAnswer(alternative, row).result, 'correct');
  }
  const w = word('approval', 'die Freigabe', { part_of_speech: 'noun', accepted_answers: '["die Genehmigung",22]' });
  assert.equal(engine.gradeAnswer('die Genehmigung', w).result, 'correct');
  assert.deepEqual(engine.getAcceptedAnswers(w), ['die Genehmigung']);
  assert.deepEqual(engine.getAcceptedAnswers({ ...w, accepted_answers: '{bad' }), []);
});

test('grading preserves blank, article, spelling, umlaut and ss behavior', () => {
  const noun = word('approval', 'die Freigabe', { part_of_speech: 'noun' });
  assert.deepEqual(engine.gradeAnswer('', noun), { result: 'wrong', comment: 'blank answer' });
  assert.deepEqual(engine.gradeAnswer('Freigabe', noun), { result: 'half', comment: 'article slip' });
  assert.deepEqual(engine.gradeAnswer('der Freigabe', noun), { result: 'half', comment: 'article slip' });
  assert.deepEqual(engine.gradeAnswer('die Freigabee', noun), { result: 'half', comment: 'spelling slip' });
  assert.deepEqual(engine.gradeAnswer('die Katze', noun), { result: 'wrong', comment: '' });
  assert.equal(engine.gradeAnswer('  DIE FREIGABE! ', noun).result, 'correct');
  assert.equal(engine.gradeAnswer('zuverlaessig', word('reliable', 'zuverlässig')).result, 'correct');
  assert.deepEqual(engine.gradeAnswer('die Strasse', word('street', 'die Straße')), { result: 'correct', comment: 'ss accepted for ß' });
  assert.equal(engine.gradeAnswer('lernenn', word('to learn', 'lernen')).result, 'half');
  assert.equal(engine.gradeAnswer('spielen', word('to learn', 'lernen')).result, 'wrong');
});

test('normalization and article splitting match legacy punctuation and article rules', () => {
  assert.equal(Coach.normalizeAnswer('  Grüße, schön!  '), 'gruesse schoen');
  assert.deepEqual(Coach.splitArticle('EINER Zielgruppe'), { article: 'einer', lemma: 'Zielgruppe' });
  assert.deepEqual(Coach.splitArticle('sich bewerben'), { article: '', lemma: 'sich bewerben' });
  assert.equal(Coach.levenshtein('kitten', 'sitting'), 3);
  assert.equal(Coach.levenshtein('', 'abc'), 3);
  assert.equal(Coach.guessPartOfSpeech('to apply', 'sich bewerben'), 'verb');
});

function attempt(id, wordId, result, extras = {}) {
  return { id, first_attempt_id: id, word_id: wordId, at: at(15), kind: 'first', source: 'typed', assisted: false, hint_used: false, revealed: false, recall_eligible: true, result, ...extras };
}

test('progress keeps independent first responses, assistance and corrections separate', () => {
  const w = marketing(), data = db([w]);
  data.sessions = [{ score_correct: 100, score_total: 100 }];
  data.practice.attempts = [
    attempt('c', w.id, 'correct'), attempt('h', w.id, 'half'), attempt('w', w.id, 'wrong'),
    attempt('assist', w.id, 'correct', { assisted: true, recall_eligible: false, hint_used: true }),
    attempt('correction', w.id, 'correct', { kind: 'correction', first_attempt_id: 'w', assisted: true, recall_eligible: false }),
  ];
  const result = engine.progress(data, { at: at(16) });
  assert.deepEqual(result.firstUnaided, { total: 3, correct: 1, half: 1, wrong: 1, accuracyPercent: 33, wordCount: 1 });
  assert.equal(result.assisted.total, 1);
  assert.equal(result.corrections.total, 1);
  assert.equal(result.legacySessionCount, 1);
  assert.equal(result.verifiedCount, 0);
});

test('progress scopes attempts and dates and refuses misleading duplicate/unknown independence', () => {
  const w = marketing(), other = word('other', 'sein'), data = db([w, other]);
  data.practice.attempts = [
    attempt('good', w.id, 'correct'), attempt('good', w.id, 'correct'),
    attempt('old', w.id, 'wrong', { at: at(10) }), attempt('future', w.id, 'correct', { at: at(18) }),
    attempt('bad-date', w.id, 'correct', { at: '2026-02-30T12:00:00Z' }),
    attempt('revealed', w.id, 'correct', { revealed: true }),
    attempt('other', other.id, 'wrong'),
  ];
  const result = engine.progress(data, { at: at(16), since: at(14), focus: 'marketing' });
  assert.equal(result.firstUnaided.total, 1);
  assert.equal(result.excludedAttempts, 3);
  assert.throws(() => engine.progress(data, { at: at(16), since: at(18) }));
});

test('progress counts verified evidence and due reviews independently of legacy labels', () => {
  const verified = marketing(), legacy = word('legacy', 'alt', { status: 'mastered', times_seen: 20 });
  for (let day = 10; day <= 12; day++) Recall.record(verified, { result: 'correct', at: at(day) });
  Review.record(verified, { result: 'correct', at: at(12) });
  const result = engine.progress(db([verified, legacy]), { at: at(16) });
  assert.equal(result.verifiedCount, 1);
  assert.equal(result.verifiedPercent, 50);
  assert.equal(result.dueCount, 1);
  assert.equal(result.unscheduledCount, 1);
  assert.equal(result.firstUnaided.total, 0);
  assert.equal(result.firstUnaided.accuracyPercent, null);
});

test('plain browser script provides helpers without CommonJS, DOM or storage', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../coach-learning.js'), 'utf8'), context);
  assert.equal(vm.runInContext("CoachLearning.normalizeAnswer('Grüße')", context), 'gruesse');
});

test('future recall and exposure survive full backup round trips but never enter a practice queue', () => {
  const original = Data.initializeCandidate(Content.createSeed(at(1)));
  original.words = [original.words[0], original.words[1], original.words[2]];
  original.words[0].recall = { version: 999, future: { preserve: ['valuable evidence'] } };
  original.words[1].exposure = { version: 999, future: ['valuable exposure'] };
  const restored = Data.parse(Data.stringify(original, { exportedAt: at(16) })).database;
  const before = JSON.stringify(restored); freeze(restored);
  for (const allowRepeat of [false, true]) {
    const result = engine.queue(restored, { at: at(16), focus: 'all', allowRepeat });
    assert.deepEqual(ids(result), [restored.words[2].id]); assert.equal(result.counts.blocked, 2);
  }
  assert.equal(engine.progress(restored, { at: at(16) }).blockedEvidenceCount, 2);
  assert.equal(JSON.stringify(restored), before);
  assert.deepEqual(Data.parse(Data.stringify(restored, { exportedAt: at(16) })).database, original);
});

test('malformed and unknown v1 evidence cannot be normalized into verified recall or enter any queue', () => {
  const qualified = word('qualified', 'die Freigabe');
  for (let day = 10; day <= 12; day++) Recall.record(qualified, { result: 'correct', at: at(day) });
  const modifications = [
    w => { w.recall = null; },
    w => { w.recall.attempts += 1; },
    w => { w.recall.correct = '3'; },
    w => { w.recall.additionalEvidence = { keep: true }; },
    w => { w.recall.successful_recalls[0].future = 'keep'; },
    w => { w.recall.successful_recalls[0].at = 'bad date'; },
    w => { w.exposure = null; },
    w => { w.exposure = { version: 1, total: 1, sources: {} }; },
    w => { w.exposure = { version: 1, total: 0, sources: {}, future: 'keep' }; },
    w => { w.exposure = { version: 1, total: 1, sources: { story: { attempts: 1, correct: 2, half: 0, wrong: 0, last_at: at(12) } } }; },
    w => { w.exposure = { version: 1, total: 1, sources: { story: { attempts: 1, correct: 0, half: 0, wrong: 0, last_at: 'bad date' } } }; },
  ];
  for (const modify of modifications) {
    const candidate = JSON.parse(JSON.stringify(qualified)); modify(candidate); freeze(candidate);
    const before = JSON.stringify(candidate), data = db([candidate]);
    assert.equal(engine.queue(data, { at: at(16), allowRepeat: true }).items.length, 0);
    assert.equal(engine.queue(data, { at: at(16) }).counts.blocked, 1);
    assert.equal(engine.progress(data, { at: at(16) }).verifiedCount, 0);
    assert.equal(engine.isVerified(candidate, { at: at(16) }), false);
    assert.equal(JSON.stringify(candidate), before);
  }
  assert.equal(engine.isVerified(qualified, { at: at(16) }), true);
});

test('future recall, exposure and legacy last-seen times are blocked even without a review schedule', () => {
  const futureRecall = word('future-recall', 'sagen');
  for (let day = 15; day <= 17; day++) Recall.record(futureRecall, { result: 'correct', at: at(day) });
  futureRecall.last_seen = ''; // Check the evidence timestamp independently of the legacy day.
  const futureExposure = word('future-exposure', 'lernen');
  Recall.recordExposure(futureExposure, { source: 'story', at: at(17) }); futureExposure.last_seen = '';
  const futureLegacy = word('future-legacy', 'spielen', { status: 'learning', last_seen: '2026-11-17' });
  const futureLegacyInstant = word('future-legacy-instant', 'arbeiten', { last_seen: at(17) });
  const data = freeze(db([futureRecall, futureExposure, futureLegacy, futureLegacyInstant]));
  const before = JSON.stringify(data), result = engine.queue(data, { at: at(16), allowRepeat: true });
  assert.equal(result.counts.blocked, 4); assert.equal(result.items.length, 0);
  assert.equal(engine.progress(data, { at: at(16) }).verifiedCount, 0);
  assert.equal(JSON.stringify(data), before);
});

test('valid ungraded exposure and later due dates remain usable; safe counter limits are blocked', () => {
  const safe = word('safe', 'die Freigabe');
  for (let day = 10; day <= 12; day++) Recall.record(safe, { result: 'correct', at: at(day) });
  Recall.recordExposure(safe, { source: 'story', at: at(13) });
  Review.record(safe, { result: 'correct', at: at(16) });
  const saturated = word('saturated', 'lernen', { times_seen: Number.MAX_SAFE_INTEGER });
  const data = freeze(db([safe, saturated])), before = JSON.stringify(data);
  assert.equal(engine.queue(data, { at: at(16) }).counts.scheduledLater, 1);
  assert.deepEqual(ids(engine.queue(data, { at: at(16), allowRepeat: true })), ['safe']);
  const progress = engine.progress(data, { at: at(16) });
  assert.equal(progress.verifiedCount, 1); assert.equal(progress.blockedEvidenceCount, 1);
  assert.equal(JSON.stringify(data), before);
});

test('readonly engine inspection refuses accessors without executing them', () => {
  const inspector = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
  let called = 0;
  const candidate = { id: 'getter', word_de: 'sein', word_en: 'to be' };
  Object.defineProperty(candidate, 'recall', { enumerable: true, get() { called++; return null; } });
  assert.equal(inspector.inspectEvidence(candidate, { at: at(16) }).supported, false);
  assert.equal(called, 0);
});
