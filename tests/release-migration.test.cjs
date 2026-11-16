const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Migration = require('../coach-migration.js');
const Content = require('../coach-content.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');
const Practice = require('../practice-engine.js');
const Store = require('../coach-store.js');
const Persistence = require('../persistence.js');
const Session = require('../practice-session.js');
const Backup = require('../backup-data.js');
const Data = require('../practice-data.js').create({ backupData: Backup, practiceEngine: Practice, reviewScheduler: Review });
const Learning = require('../coach-learning.js').create({ learningPriorities: require('../learning-priorities.js'),
  recallEvidence: Recall, reviewScheduler: Review, practiceEngine: Practice, curriculum: require('../curriculum-data.js'), frequencyData: require('../frequency-data.js') });
const sourceRaw = fs.readFileSync(path.join(__dirname, 'fixtures/legacy-c787737.json'), 'utf8');
const provenance = require('./fixtures/legacy-c787737.provenance.json');
const fixture = () => JSON.parse(sourceRaw);
const at = '2026-11-16T12:00:00.000Z';
const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
const fresh = () => Content.createSeed(at);
const migrate = source => Migration.upgrade(source, { seed: fresh(), recall: Recall, at });
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }

function runtime({ raw = sourceRaw, canLock = true } = {}) {
  const values = new Map([[Store.LEGACY_KEY, raw]]), writes = [];
  let failMain = false, locked = false, migrations = 0;
  const storage = { getItem: key => values.get(key) ?? null, setItem(key, value) {
    assert.equal(locked, true, 'Every release write must hold the same exclusive lock');
    assert.notEqual(key, Store.LEGACY_KEY, 'The original legacy database must never be written');
    if (failMain && key === Store.STORAGE_KEY) throw new Error('Simulated storage quota');
    values.set(key, value); writes.push(key);
  } };
  const locks = canLock ? { request: async (name, options, callback) => {
    assert.equal(name, Store.LEGACY_KEY); assert.equal(options.mode, 'exclusive');
    locked = true; try { return await callback(); } finally { locked = false; }
  } } : undefined;
  const create = () => Store.create({ storage, locks, seed: fresh,
    migrateLegacy: source => { migrations++; return migrate(source); },
    practiceData: Data, persistence: Persistence, practiceSession: Session, engine, now: () => at });
  return { store: create(), create, values, writes, set failMain(value) { failMain = value; }, get migrations() { return migrations; } };
}

function assertPreserved(next, original = fixture()) {
  assert.deepEqual(next.sessions, original.sessions);
  assert.deepEqual(next.profile, original.profile);
  assert.deepEqual(next.fixture_extension, original.fixture_extension);
  for (const old of original.words) {
    const word = next.words.find(item => item.id === old.id);
    assert.ok(word, `Retained original word ${old.id}`);
    for (const [key, value] of Object.entries(old)) {
      if (key !== 'status') assert.deepEqual(word[key], value, `${old.id}.${key}`);
    }
    if (old.status !== 'mastered') assert.equal(word.status, old.status);
  }
  assert.equal(new Set(next.words.map(word => word.id)).size, next.words.length);
}

test('release fixture comes from the original version-4 seed/profile/results path with synthetic data', () => {
  const old = fixture();
  assert.equal(provenance.source_commit, 'c787737c2272fcd3cd3a8609f760ec31cdd2c3a5');
  assert.equal(provenance.original_starter_count, 1044); assert.equal(old.version, 4);
  assert.deepEqual(provenance.executed_functions, ['createSeedDb','createProfile','normalizeWordRecord','applyResults']);
  assert.equal(old.words.length, 4); assert.equal(old.words[0].status, 'mastered');
  assert.equal(old.words[0].correct_streak, 3); assert.equal(old.words[1].half_count, 3); assert.equal(old.words[2].wrong_count, 3);
  assert.deepEqual(old.sessions.map(session => session.score_correct), [1.5, 1.5, 1.5]);
  assert.equal(old.profile.weeklyGoal, 65); assert.equal(new Set(Object.values(old.profile.modeLevels)).size, 4);
  assert.equal(Object.hasOwn(old, 'preferences'), false); assert.equal(Object.hasOwn(old.words[0], 'recall'), false);
});

test('real legacy upgrade preserves custom vocabulary, counters, fractional history, mode preferences and extension data without mutation', () => {
  const original = freeze(fixture()), seed = freeze(fresh());
  const candidate = Data.initializeCandidate(Migration.upgrade(original, { seed, recall: Recall, at }));
  assertPreserved(candidate, original); assert.deepEqual(original, fixture());
  assert.equal(candidate.words.length, seed.words.length + 1);
  assert.equal(candidate.preferences.learningFocus, 'marketing');
  assert.equal(candidate.words.find(word => word.id === 'synthetic-custom-campaign').notes, original.words[3].notes);
  assert.deepEqual(candidate.practice, { version: 1, attempts: [], pending: null, paused: false });
  assert.deepEqual(migrate(candidate), candidate);
});

test('same-day mastery from the original scorer remains historical evidence, never verified recall or independent accuracy', () => {
  const next = Data.initializeCandidate(migrate(fixture()));
  const prior = next.words.find(word => word.id === 'seed-001');
  assert.equal(prior.status, 'learning'); assert.equal(prior.legacy_mastery.status, 'mastered');
  assert.equal(prior.legacy_mastery.correct_streak, 3);
  assert.equal(prior.recall.attempts, 0); assert.deepEqual(prior.recall.successful_recalls, []);
  assert.equal(Object.hasOwn(prior, 'review'), false);
  const progress = Learning.progress(next, { at, focus: 'all' });
  assert.equal(progress.verifiedCount, 0); assert.equal(progress.firstUnaided.total, 0);
  assert.equal(progress.firstUnaided.accuracyPercent, null); assert.equal(progress.legacySessionCount, 3);
});

test('same-origin runtime migration retains exact legacy bytes and a complete recoverable export across reopen', async () => {
  const h = runtime(), state = await h.store.load();
  assert.equal(state.status, 'success'); assert.equal(state.saved, true); assertPreserved(state.database);
  assert.equal(h.values.get(Store.LEGACY_KEY), sourceRaw);
  assert.equal(JSON.parse(h.values.get(`${Store.STORAGE_KEY}_legacy_source`)).raw, sourceRaw);
  assert.deepEqual(h.writes, [`${Store.STORAGE_KEY}_legacy_source`,`${Store.STORAGE_KEY}_metadata`,Store.STORAGE_KEY]);
  const exported = Data.parse(h.store.exportBackup()); assert.deepEqual(exported.database, state.database);
  const reopened = await h.create().load(); assert.deepEqual(reopened.database, state.database);
  assert.equal(h.migrations, 1); assert.equal(h.writes.length, 3);
});

test('quota failure during the original-to-modern upgrade keeps every record and retries only the retained candidate', async () => {
  const h = runtime(); h.failMain = true;
  const failed = await h.store.load(); assert.equal(failed.saved, false); assert.equal(failed.writable, false);
  assert.equal(h.values.has(Store.STORAGE_KEY), false); assert.equal(h.values.get(Store.LEGACY_KEY), sourceRaw);
  assertPreserved(failed.database); assertPreserved(failed.pending.database);
  const candidateRaw = failed.pending.raw;
  assert.deepEqual(Data.parse(h.store.exportBackup({ source: 'pending' })).database, failed.pending.database);
  let mutated = false; await h.store.update(() => { mutated = true; }); assert.equal(mutated, false);
  h.failMain = false; const saved = await h.store.retry();
  assert.equal(saved.saved, true); assert.equal(h.values.get(Store.STORAGE_KEY), candidateRaw);
  assert.equal(h.values.get(Store.LEGACY_KEY), sourceRaw); assertPreserved(saved.database);
});

test('a browser without safe locks can read/export the migrated legacy candidate but writes nothing', async () => {
  const h = runtime({ canLock: false }), state = await h.store.load();
  assert.equal(state.status, 'blocked'); assert.equal(state.writable, false); assert.equal(state.saved, false);
  assertPreserved(state.database); assertPreserved(Data.parse(h.store.exportBackup()).database);
  let mutated = false; await h.store.update(() => { mutated = true; }); await h.store.retry();
  assert.equal(mutated, false); assert.deepEqual(h.writes, []); assert.equal(h.values.size, 1);
  assert.equal(h.values.get(Store.LEGACY_KEY), sourceRaw);
});

test('a later original-app save is retained separately and blocks the new app from overwriting its own history', async () => {
  const h = runtime(); await h.store.load(); const modern = h.values.get(Store.STORAGE_KEY);
  const competing = fixture(); competing.profile.name = 'Synthetic newer legacy name';
  const competingRaw = JSON.stringify(competing); h.values.set(Store.LEGACY_KEY, competingRaw);
  const state = await h.store.update(db => { db.profile.name = 'Synthetic modern change'; });
  assert.equal(state.status, 'conflict'); assert.equal(state.saved, false);
  assert.equal(h.values.get(Store.STORAGE_KEY), modern); assert.equal(h.values.get(Store.LEGACY_KEY), competingRaw);
  const recovery = JSON.parse(h.store.exportRecovery());
  assert.equal(recovery.legacy.raw, competingRaw); assert.equal(JSON.parse(recovery.original_legacy.raw).raw, sourceRaw);
  assert.equal(recovery.pending.database.profile.name, 'Synthetic modern change');
});
