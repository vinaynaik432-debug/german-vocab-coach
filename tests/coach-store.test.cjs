const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Store = require('../coach-store.js');
const Persistence = require('../persistence.js');
const Session = require('../practice-session.js');
const Practice = require('../practice-engine.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');
const Backup = require('../backup-data.js');
const Data = require('../practice-data.js').create({ backupData: Backup, practiceEngine: Practice, reviewScheduler: Review });
const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
const at = seconds => new Date(Date.UTC(2026, 10, 16, 12, 0, seconds)).toISOString();
const clone = value => JSON.parse(JSON.stringify(value));
const MAIN = Store.STORAGE_KEY, LEGACY = Store.LEGACY_KEY;

function fixture() {
  return { version: 6, created_at: at(0),
    words: [{ id: 'approval', word_en: 'approval', word_de: 'die Freigabe', status: 'new',
      correct_streak: 0, times_seen: 0, wrong_count: 0, half_count: 0 }],
    sessions: [{ round_id: 'old', date: at(0), score_correct: 1, score_total: 2 }],
    profile: { name: '', level: 'B1', weeklyGoal: 30, hasChosenName: false, hasChosenLevel: true,
      modeLevels: { vocab: 'B1', story: 'B1', context: 'B1', sentence: 'B1', tense: 'B1' } },
    preferences: { learningFocus: 'marketing' }, extra: { keep: ['unchanged', 1] } };
}
function browser(initial = {}) {
  const values = new Map(Object.entries(initial)); let fail = null, active = 0;
  const writes = [], requests = []; let tail = Promise.resolve();
  const storage = { getItem: key => values.has(key) ? values.get(key) : null,
    setItem(key, value) { if (!active) throw new Error('A write escaped its lock'); if (fail?.(key, value)) throw new Error('Full storage'); values.set(key, value); writes.push({ key, value }); } };
  const locks = { request(name, options, callback) {
    requests.push({ name, options });
    const run = tail.then(async () => { active++; try { return await callback({ name }); } finally { active--; } });
    tail = run.catch(() => {}); return run;
  } };
  return { storage, locks, values, writes, requests, fail: fn => { fail = fn; } };
}
function store(env, options = {}) {
  return Store.create({ storage: env.storage, locks: env.locks, seed: fixture, practiceData: Data,
    persistence: Persistence, practiceSession: Session, engine, now: () => at(59), ...options });
}
const begin = runtime => runtime.start({ wordId: 'approval', attemptId: 'a1', at: at(1) });
const answer = (runtime, result = 'wrong', text = 'die Aufgabe') => runtime.submitAnswer({ wordId: 'approval', attemptId: 'a1', answer: text, result, at: at(2) });

test('migration retains exact legacy bytes and all fields before the new snapshot; all writes hold the shared exclusive lock', async () => {
  const raw = JSON.stringify(fixture(), null, 2), env = browser({ [LEGACY]: raw });
  const runtime = store(env); const state = await runtime.load();
  assert.equal(state.status, 'success'); assert.equal(state.saved, true);
  assert.equal(env.storage.getItem(LEGACY), raw);
  assert.deepEqual(state.database.extra, fixture().extra);
  const { practice, ...legacyFields } = state.database; assert.deepEqual(legacyFields, fixture());
  assert.deepEqual(practice, { version: 1, attempts: [], pending: null, paused: false });
  assert.equal(JSON.parse(env.storage.getItem(`${MAIN}_legacy_source`)).raw, raw);
  assert.deepEqual(env.writes.map(write => write.key), [`${MAIN}_legacy_source`, `${MAIN}_metadata`, MAIN]);
  assert.ok(env.requests.every(request => request.name === LEGACY && request.options.mode === 'exclusive'));
  state.database.extra.keep.push('mutated returned state');
  assert.deepEqual(runtime.getState().database.extra, fixture().extra);
  const reopened = store(env); assert.equal((await reopened.load()).status, 'success');
  assert.equal(env.writes.length, 3);
});

test('empty storage initializes from an object or seed function without creating a legacy database', async () => {
  for (const seed of [fixture(), fixture]) {
    const env = browser(), runtime = store(env, { seed });
    assert.equal((await runtime.load()).status, 'success');
    assert.equal(env.storage.getItem(LEGACY), null);
    assert.equal(runtime.getState().database.words.length, 1);
  }
});

test('without Web Locks reads and exports work but no mutation, initialization, or restore writes occur', async () => {
  const raw = JSON.stringify(fixture()), env = browser({ [LEGACY]: raw }), runtime = store(env, { locks: undefined });
  const loaded = await runtime.load();
  assert.equal(loaded.status, 'blocked'); assert.equal(loaded.reason, 'web-locks-unavailable'); assert.equal(loaded.readOnly, true);
  assert.equal(Data.parse(runtime.exportBackup()).database.words.length, 1);
  assert.equal((await begin(runtime)).reason, 'web-locks-unavailable');
  assert.equal((await runtime.update(db => { db.profile.name = 'Unsafe'; })).reason, 'web-locks-unavailable');
  assert.equal((await runtime.retry()).reason, 'web-locks-unavailable');
  assert.equal((await runtime.restore('anything')).reason, 'web-locks-unavailable');
  assert.equal(env.writes.length, 0); assert.equal(env.storage.getItem(LEGACY), raw);
});

test('corrupt, future, and unsafe legacy data never seed over saved data or invoke migration', async () => {
  const future = fixture(); future.version = 7;
  const poisoned = fixture(); poisoned.extra = JSON.parse('{"__proto__":{"polluted":true}}');
  for (const raw of ['{broken', JSON.stringify(future), JSON.stringify(poisoned)]) {
    let migrated = false; const env = browser({ [LEGACY]: raw });
    const runtime = store(env, { migrateLegacy(db) { migrated = true; return db; } });
    assert.equal((await runtime.load()).status, 'invalid'); assert.equal(migrated, false);
    assert.equal(env.writes.length, 0); assert.equal(env.storage.getItem(LEGACY), raw);
    assert.equal(JSON.parse(runtime.exportRecovery()).legacy.raw, raw);
  }
});

test('optional legacy migration is detached, explicitly validated, and never overwrites its source', async () => {
  const older = fixture(); older.version = 5; delete older.profile;
  const raw = JSON.stringify(older), env = browser({ [LEGACY]: raw });
  const runtime = store(env, { migrateLegacy(db) { db.profile = fixture().profile; return db; } });
  assert.equal((await runtime.load()).status, 'success'); assert.equal(env.storage.getItem(LEGACY), raw);
  assert.equal(runtime.getState().database.version, 5);
  const badEnv = browser({ [LEGACY]: raw });
  assert.equal((await store(badEnv, { migrateLegacy: () => ({}) }).load()).status, 'invalid');
  assert.equal(badEnv.writes.length, 0);
});

test('failed migration keeps original data and exact candidate; retry finishes only that candidate', async () => {
  const raw = JSON.stringify(fixture()), env = browser({ [LEGACY]: raw }), runtime = store(env);
  env.fail(key => key === MAIN);
  assert.equal((await runtime.load()).status, 'unavailable');
  const pending = runtime.getState().pending.raw;
  assert.equal(env.storage.getItem(MAIN), null); assert.equal(env.storage.getItem(LEGACY), raw);
  assert.equal((await runtime.update(db => { db.profile.name = 'changed'; })).reason, 'pending-write');
  env.fail(null); assert.equal((await runtime.retry()).status, 'success');
  assert.equal(env.storage.getItem(MAIN), pending);
});

test('failed first response blocks replacement and is saved exactly once by retry', async () => {
  const env = browser(), runtime = store(env); await runtime.load(); await begin(runtime);
  const baseline = env.storage.getItem(MAIN); env.fail(key => key === MAIN);
  assert.equal((await answer(runtime)).status, 'unavailable');
  assert.equal(env.storage.getItem(MAIN), baseline);
  assert.equal(runtime.getState().database.practice.attempts.length, 0);
  assert.equal(runtime.getState().pending.database.practice.attempts[0].result, 'wrong');
  assert.equal((await answer(runtime, 'correct', 'die Freigabe')).reason, 'pending-write');
  assert.equal((await runtime.update(db => { db.profile.name = 'No'; })).reason, 'pending-write');
  assert.equal((await runtime.load()).reason, 'pending-write');
  assert.equal(Data.parse(runtime.exportBackup({ source: 'pending' })).database.practice.attempts[0].result, 'wrong');
  env.fail(null); assert.equal((await runtime.retry()).status, 'success');
  assert.equal(runtime.getState().database.practice.attempts[0].result, 'wrong');
  assert.equal((await answer(runtime)).status, 'success');
  assert.equal(runtime.getState().database.practice.attempts.length, 1);
});

test('two tabs cannot silently overwrite: exact stale candidate is retained with competing snapshots', async () => {
  const env = browser(), first = store(env); await first.load(); await begin(first);
  const second = store(env); await second.load();
  assert.equal((await answer(first)).status, 'success');
  assert.equal((await answer(second, 'correct', 'die Freigabe')).status, 'conflict');
  const recovery = JSON.parse(second.exportRecovery());
  assert.equal(JSON.parse(recovery.stored.raw).practice.attempts[0].result, 'wrong');
  assert.equal(recovery.pending.database.practice.attempts[0].result, 'correct');
  assert.equal(recovery.committed.database.practice.attempts.length, 0);
  assert.equal((await second.retry()).status, 'conflict');
});

test('simultaneous tab updates share one lock and the queued stale writer cannot replace the winner', async () => {
  const env = browser(), first = store(env); await first.load();
  const second = store(env); await second.load();
  const outcomes = await Promise.all([
    first.update(db => { db.profile.name = 'First'; }),
    second.update(db => { db.profile.name = 'Second'; }),
  ]);
  assert.deepEqual(outcomes.map(outcome => outcome.status), ['success', 'conflict']);
  assert.equal(JSON.parse(env.storage.getItem(MAIN)).profile.name, 'First');
  assert.equal(second.getState().pending.database.profile.name, 'Second');
});

test('read or lock failures do not fall back to unsafe writes and preserve pending first responses', async () => {
  const unreadable = browser(); unreadable.storage.getItem = () => { throw new Error('Denied'); };
  assert.equal((await store(unreadable).load()).status, 'unavailable');
  assert.equal(unreadable.writes.length, 0);
  const env = browser(), runtime = store(env); await runtime.load(); await begin(runtime);
  env.fail(key => key === MAIN); await answer(runtime); env.fail(null);
  const before = env.storage.getItem(MAIN), pending = runtime.getState().pending.raw;
  env.locks.request = async () => { throw new Error('Lock denied'); };
  assert.equal((await runtime.retry()).status, 'unavailable');
  assert.equal(runtime.getState().pending.raw, pending); assert.equal(env.storage.getItem(MAIN), before);
});

test('corrupt or future modern data is never overwritten and raw recovery remains available', async () => {
  const env = browser(), original = store(env); await original.load();
  const valid = env.storage.getItem(MAIN);
  for (const raw of ['{bad modern', JSON.stringify({ ...JSON.parse(valid), version: 7 })]) {
    env.values.set(MAIN, raw); const writes = env.writes.length, reopened = store(env);
    assert.equal((await reopened.load()).status, 'invalid');
    assert.equal(env.writes.length, writes); assert.equal(JSON.parse(reopened.exportRecovery()).stored.raw, raw);
  }
});

test('retry reports a legacy conflict if an old tab changes its key during the acknowledged main write', async () => {
  const env = browser(), runtime = store(env); await runtime.load(); await begin(runtime);
  env.fail(key => key === MAIN); await answer(runtime); env.fail(null);
  const originalSet = env.storage.setItem;
  env.storage.setItem = (key, value) => { originalSet(key, value); if (key === MAIN) env.values.set(LEGACY, JSON.stringify(fixture())); };
  const state = await runtime.retry();
  assert.equal(state.status, 'conflict'); assert.equal(state.reason, 'legacy-data-changed');
  assert.equal(state.saved, false); assert.equal(state.legacyChanged, true);
  assert.equal(JSON.parse(runtime.exportRecovery()).committed.database.practice.attempts[0].result, 'wrong');
});

test('a late legacy-tab write blocks modern changes without replacing either saved history', async () => {
  const raw = JSON.stringify(fixture()), env = browser({ [LEGACY]: raw }), runtime = store(env);
  await runtime.load(); await begin(runtime); const modern = env.storage.getItem(MAIN);
  const changed = fixture(); changed.profile.name = 'Changed in old tab'; env.values.set(LEGACY, JSON.stringify(changed));
  assert.equal((await answer(runtime)).reason, 'legacy-data-changed');
  assert.equal(env.storage.getItem(MAIN), modern);
  const recovery = JSON.parse(runtime.exportRecovery());
  assert.equal(JSON.parse(recovery.legacy.raw).profile.name, changed.profile.name);
  assert.equal(JSON.parse(recovery.original_legacy.raw).raw, raw);
  assert.equal(recovery.pending.database.practice.attempts[0].result, 'wrong');
});

test('validated settings updates persist under lock and invalid updates cannot poison the database', async () => {
  const env = browser(), runtime = store(env); await runtime.load();
  assert.equal((await runtime.update(db => { db.preferences.theme = 'studio'; })).status, 'success');
  const saved = env.storage.getItem(MAIN);
  assert.equal((await runtime.update(db => { db.profile.level = 'C9'; })).status, 'invalid');
  assert.equal(env.storage.getItem(MAIN), saved); assert.equal(runtime.getState().pending, null);
  assert.equal((await runtime.update(async db => db)).status, 'invalid');
  assert.equal((await runtime.update(db => { delete db.practice; })).status, 'invalid');
  assert.equal(env.storage.getItem(MAIN), saved);
});

test('full restore preview is detached, stale-checked and backed by a verified pre-restore v2 copy', async () => {
  const env = browser(), runtime = store(env); await runtime.load(); await begin(runtime); await answer(runtime);
  const before = clone(runtime.getState().database), replacement = fixture(); replacement.profile.name = 'Restored';
  const preview = await runtime.previewRestore(Data.stringify(replacement, { exportedAt: at(50) }));
  assert.equal(preview.summary.attempts, 0); assert.equal(preview.summary.replacesAttempts, 1);
  assert.equal(runtime.getState().database.practice.attempts.length, 1);
  assert.equal((await runtime.restore(preview.previewId)).status, 'success');
  assert.equal(runtime.getState().database.profile.name, 'Restored');
  assert.deepEqual(Data.parse(runtime.exportSafetyCopy()).database, before);
  assert.equal(Data.parse(runtime.exportBackup()).format_version, 2);
});

test('failed safety copy prevents any main replacement and retry preserves the original safety snapshot', async () => {
  const env = browser(), runtime = store(env); await runtime.load();
  const before = env.storage.getItem(MAIN), replacement = fixture(); replacement.profile.name = 'Restored';
  const preview = await runtime.previewRestore(Data.stringify(replacement));
  env.fail(key => key === `${MAIN}_before_restore`);
  assert.equal((await runtime.restore(preview.previewId)).status, 'unavailable');
  assert.equal(env.storage.getItem(MAIN), before); assert.equal(runtime.getState().pending.kind, 'restore');
  env.fail(null); assert.equal((await runtime.retry()).status, 'success');
  assert.deepEqual(Data.parse(runtime.exportSafetyCopy()).database, JSON.parse(before));
});

test('restoring requires a current preview and never silently acknowledges a changed legacy source', async () => {
  const env = browser({ [LEGACY]: JSON.stringify(fixture()) }), runtime = store(env); await runtime.load();
  const text = runtime.exportBackup(), preview = await runtime.previewRestore(text);
  await runtime.update(db => { db.profile.name = 'Newer'; });
  assert.equal((await runtime.restore(preview.previewId)).status, 'invalid');
  const again = await runtime.previewRestore(text);
  env.values.set(MAIN, JSON.stringify({ ...runtime.getState().database, added: true }));
  assert.equal((await runtime.restore(again.previewId)).reason, 'restore-preview-stale');
  await runtime.load();
  const legacy = fixture(); legacy.profile.name = 'Legacy new'; env.values.set(LEGACY, JSON.stringify(legacy));
  const reconcile = await runtime.previewRestore(text);
  assert.equal((await runtime.restore(reconcile.previewId)).reason, 'legacy-change-needs-confirmation');
  assert.equal((await runtime.restore(reconcile.previewId, { acknowledgeLegacyChange: true })).status, 'success');
  assert.equal((await runtime.update(db => { db.profile.name = 'Allowed'; })).status, 'success');
  assert.equal(JSON.parse(env.storage.getItem(`${MAIN}_legacy_source`)).raw, JSON.stringify(fixture()));
  assert.equal(JSON.parse(env.storage.getItem(`${MAIN}_restore_context`)).legacy_raw, JSON.stringify(legacy));
});

test('a reset derived from an older tab cannot bless a newer snapshot as its restore baseline', async () => {
  const env = browser(), first = store(env); await first.load();
  const baseline = first.getState().committed, resetCandidate = clone(baseline.database);
  resetCandidate.sessions = []; resetCandidate.practice = { version: 1, attempts: [], pending: null, paused: false };
  const second = store(env); await second.load();
  await second.update(db => { db.profile.name = 'Newer name'; db.words.push({ ...db.words[0], id: 'newly-added', word_en: 'newly added' }); });
  const writes = env.writes.length, current = env.storage.getItem(MAIN);
  const rejected = await first.previewRestore(Data.stringify(resetCandidate), { expectedRaw: baseline.raw });
  assert.equal(rejected.status, 'conflict'); assert.equal(rejected.reason, 'restore-source-stale');
  assert.equal(env.writes.length, writes); assert.equal(env.storage.getItem(MAIN), current);
  assert.equal(JSON.parse(current).words.length, 2); assert.equal(JSON.parse(current).profile.name, 'Newer name');
  await first.load();
  const fresh = first.getState().committed;
  const accepted = await first.previewRestore(Data.stringify(fresh.database), { expectedRaw: fresh.raw });
  assert.equal(accepted.status, 'success');
});

test('acknowledged reconciliation retains a replaced first candidate and metadata failure is recoverable', async () => {
  const env = browser({ [LEGACY]: JSON.stringify(fixture()) }), runtime = store(env); await runtime.load(); await begin(runtime);
  env.fail(key => key === MAIN); await answer(runtime); env.fail(null);
  const replacement = fixture(); replacement.profile.name = 'Chosen recovery';
  const legacy = fixture(); legacy.profile.name = 'Old-tab change'; env.values.set(LEGACY, JSON.stringify(legacy));
  const preview = await runtime.previewRestore(Data.stringify(replacement));
  assert.equal((await runtime.restore(preview.previewId, { acknowledgeLegacyChange: true })).reason, 'pending-write');
  env.fail(key => key === `${MAIN}_metadata`);
  assert.equal((await runtime.restore(preview.previewId, { acknowledgeLegacyChange: true, discardPending: true })).status, 'unavailable');
  const context = JSON.parse(env.storage.getItem(`${MAIN}_restore_context`));
  assert.equal(context.replaced_pending.database.practice.attempts[0].result, 'wrong');
  assert.equal(runtime.getState().pending.kind, 'restore');
  env.fail(null); assert.equal((await runtime.retry()).status, 'success');
  assert.equal(runtime.getState().database.profile.name, 'Chosen recovery');
});

test('explicit repair preserves exact corrupt or future canonical bytes before replacing with a validated backup', async () => {
  for (const raw of ['{broken canonical', JSON.stringify({ ...fixture(), version: 999 })]) {
    const env = browser(), original = store(env); await original.load(); env.values.set(MAIN, raw);
    const runtime = store(env); assert.equal((await runtime.load()).status, 'invalid');
    const backup = Data.stringify(fixture()), preview = await runtime.previewRestore(backup);
    assert.equal(preview.status, 'success'); assert.equal(preview.summary.invalidCurrent, true);
    assert.equal(preview.summary.safetyFormat, 'raw-recovery');
    const writes = env.writes.length;
    assert.equal((await runtime.restore(preview.previewId)).reason, 'invalid-replacement-needs-confirmation');
    assert.equal(env.writes.length, writes); assert.equal(env.storage.getItem(MAIN), raw);
    assert.equal((await runtime.restore(preview.previewId, { replaceInvalid: true })).status, 'success');
    const safety = JSON.parse(runtime.exportSafetyCopy());
    assert.equal(safety.format, 'german-vocab-coach-raw-recovery'); assert.equal(safety.raw, raw);
    assert.equal(JSON.parse(JSON.parse(runtime.exportRecovery()).before_restore.raw).raw, raw);
    assert.equal(runtime.getState().database.version, 6);
  }
});

test('repair remains exact-stale-checked and failed raw safety writes cannot replace corrupt main data', async () => {
  const env = browser(), original = store(env); await original.load(); env.values.set(MAIN, '{first corrupt');
  const runtime = store(env); await runtime.load();
  const first = await runtime.previewRestore(Data.stringify(fixture()));
  env.values.set(MAIN, '{second corrupt');
  assert.equal((await runtime.restore(first.previewId, { replaceInvalid: true })).reason, 'restore-preview-stale');
  const preview = await runtime.previewRestore(Data.stringify(fixture()));
  env.fail(key => key === `${MAIN}_before_restore`);
  assert.equal((await runtime.restore(preview.previewId, { replaceInvalid: true })).status, 'unavailable');
  assert.equal(env.storage.getItem(MAIN), '{second corrupt');
  env.fail(null); assert.equal((await runtime.retry()).status, 'success');
  assert.equal(JSON.parse(runtime.exportSafetyCopy()).raw, '{second corrupt');
});

test('explicit repair can initialize modern storage from a valid backup while preserving a corrupt legacy source untouched', async () => {
  const raw = '{legacy broken', env = browser({ [LEGACY]: raw }), runtime = store(env);
  assert.equal((await runtime.load()).status, 'invalid');
  const preview = await runtime.previewRestore(Data.stringify(fixture()));
  assert.equal(preview.summary.invalidCurrent, true);
  assert.equal((await runtime.restore(preview.previewId, { replaceInvalid: true })).status, 'success');
  assert.equal(env.storage.getItem(LEGACY), raw);
  assert.equal(JSON.parse(env.storage.getItem(`${MAIN}_legacy_source`)).raw, raw);
  assert.equal(JSON.parse(runtime.exportSafetyCopy()).legacy_raw, raw);
  assert.equal((await store(env).load()).status, 'success');
});

test('a pending correction and paused draft survive full export/reopen without first-response promotion', async () => {
  const env = browser(), runtime = store(env); await runtime.load(); await begin(runtime); await answer(runtime);
  await runtime.saveDraft({ attemptId: 'a1', answer: 'die Frei', at: at(3) }); await runtime.pause();
  const backup = Data.parse(runtime.exportBackup());
  assert.equal(backup.database.practice.attempts[0].result, 'wrong');
  const reopened = store(env); await reopened.load();
  assert.equal(reopened.getState().database.practice.pending.draft, 'die Frei');
  assert.equal(reopened.getState().database.practice.paused, true);
});

test('plain browser script defines the API without accessing storage, DOM or starting writes', () => {
  const context = vm.createContext({}); vm.runInContext(fs.readFileSync(require.resolve('../coach-store.js'), 'utf8'), context);
  assert.equal(vm.runInContext('typeof CoachStore.create', context), 'function');
});
