/* Browser runtime. Every write uses the same exclusive Web Lock. The original
 * legacy key is never written: old tabs cannot overwrite the modern database. */
const CoachStore = (() => {
  const LEGACY_KEY = 'vinay_german_vocab_coach_v1';
  const STORAGE_KEY = `${LEGACY_KEY}_continuous_v1`;
  const METHODS = ['initialize', 'start', 'saveDraft', 'markHint', 'reveal', 'submitAnswer', 'advance', 'pause', 'resume'];
  const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));

  function create({ storage, locks, seed, migrateLegacy, practiceData, persistence, practiceSession, engine,
    legacyKey = LEGACY_KEY, key = STORAGE_KEY, now = () => new Date().toISOString() } = {}) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') throw new TypeError('Browser storage is required.');
    if (!practiceData || !['validateDatabase', 'initializeCandidate', 'stringify', 'parse'].every(name => typeof practiceData[name] === 'function')) throw new TypeError('PracticeData is required.');
    if (!persistence?.create || !practiceSession?.create || !engine || !METHODS.every(name => typeof engine[name] === 'function')) throw new TypeError('Persistence, PracticeSession and PracticeEngine are required.');
    if (typeof key !== 'string' || !key || typeof legacyKey !== 'string' || !legacyKey || key === legacyKey) throw new TypeError('Distinct modern and legacy storage keys are required.');
    const metadataKey = `${key}_metadata`, sourceKey = `${key}_legacy_source`, safetyKey = `${key}_before_restore`, contextKey = `${key}_restore_context`;
    const canLock = Boolean(locks && typeof locks.request === 'function');
    let repository = null, session = null, direct = null, readable = null, busy = false, loaded = false;
    let metadataRaw = null, sourceRaw = null, legacyRaw = null, previews = new Map(), nextPreview = 1;
    let last = { status: 'unread', operation: 'create', reason: null };

    function readRaw(name) {
      const raw = storage.getItem(name);
      if (raw !== null && typeof raw !== 'string') throw new TypeError('Storage returned an invalid value.');
      return raw;
    }
    function rawObservation(name) {
      try { return { status: 'success', raw: readRaw(name) }; }
      catch { return { status: 'unavailable' }; }
    }
    function parseDatabase(raw) {
      if (typeof raw !== 'string') throw new TypeError('Saved database is missing.');
      if (raw.length > practiceData.LIMITS.textBytes) throw new Error('Saved database exceeds the size limit.');
      return practiceData.validateDatabase(JSON.parse(raw));
    }
    function parseMetadata(raw) {
      const value = JSON.parse(raw);
      if (!value || value.version !== 1 || Object.keys(value).sort().join(',') !== 'legacy_raw,version'
        || (value.legacy_raw !== null && typeof value.legacy_raw !== 'string')) throw new Error('Unsupported storage metadata.');
      return value;
    }
    function parseSource(raw) {
      const value = JSON.parse(raw);
      if (!value || value.format !== 'german-vocab-coach-legacy-source' || value.version !== 1
        || (value.raw !== null && typeof value.raw !== 'string')) throw new Error('Invalid original-data safety copy.');
      return value;
    }
    function pendingState() { return direct || session?.getState().pending || repository?.getState().pending || null; }
    function getState() {
      const committed = repository?.getState().committed || null;
      const pending = pendingState();
      const database = committed?.database || readable;
      return { ...last, loaded, readOnly: !canLock || !loaded || last.status === 'invalid' || last.status === 'unavailable' || last.status === 'conflict',
        writable: canLock && loaded && !pending && last.status === 'success', saved: last.status === 'success' && !pending,
        recoveryRequired: Boolean(pending), database: copy(database), committed: copy(committed), pending: copy(pending),
        keys: { main: key, legacy: legacyKey, metadata: metadataKey, original: sourceKey, safety: safetyKey },
        legacyChanged: last.reason === 'legacy-data-changed' };
    }
    function report(status, operation, reason = null, details = {}) { last = { status, operation, reason, ...details }; return getState(); }
    function guard() {
      try {
        if (readRaw(metadataKey) !== metadataRaw || readRaw(sourceKey) !== sourceRaw) return { status: 'conflict', reason: 'storage-metadata-changed' };
        if (readRaw(legacyKey) !== legacyRaw) return { status: 'conflict', reason: 'legacy-data-changed' };
      } catch { return { status: 'unavailable', reason: 'storage-read-failed' }; }
      return null;
    }
    function attach(raw) {
      repository = persistence.create({ storage: { get: readRaw, set: (name, value) => storage.setItem(name, value) }, key, initialRaw: raw });
      const protectedRepository = {
        getState: () => repository.getState(), read: () => repository.read(),
        commit(candidate, options) { return guard() || repository.commit(candidate, options); },
        retry() { return guard() || repository.retry(); },
      };
      const checkedEngine = {};
      for (const method of METHODS) checkedEngine[method] = (...args) => practiceData.validateDatabase(engine[method](...args));
      session = practiceSession.create({ persistence: protectedRepository, engine: checkedEngine });
    }
    async function exclusive(operation, callback, allowReadOnly = false) {
      if (busy) return { ...getState(), status: 'blocked', operation, reason: 'operation-in-progress', saved: false };
      if (!canLock && !allowReadOnly) return report('blocked', operation, 'web-locks-unavailable');
      busy = true;
      try {
        if (!canLock) return await callback(false);
        return await locks.request(legacyKey, { mode: 'exclusive' }, () => callback(true));
      } catch (error) {
        return report('unavailable', operation, 'storage-or-lock-unavailable', { message: error.message || 'Storage is unavailable.' });
      } finally { busy = false; }
    }
    function setVerified(name, text) {
      storage.setItem(name, text);
      if (readRaw(name) !== text) throw new Error('Storage did not retain the complete safety copy.');
    }
    function ensureSource(intent) {
      const existing = readRaw(sourceKey);
      if (existing !== null && existing !== intent.sourceRaw) return { status: 'conflict', reason: 'original-safety-copy-changed' };
      if (existing === null) setVerified(sourceKey, intent.sourceRaw);
      sourceRaw = intent.sourceRaw;
      const metadata = readRaw(metadataKey);
      if (metadata !== null && metadata !== intent.metadataRaw) return { status: 'conflict', reason: 'storage-metadata-changed' };
      if (metadata === null) setVerified(metadataKey, intent.metadataRaw);
      metadataRaw = intent.metadataRaw;
      return null;
    }
    function finishDirect(operation) {
      const intent = direct;
      if (!intent) return report('invalid', operation, 'no-pending-write');
      try {
        if (readRaw(legacyKey) !== intent.expectedLegacyRaw) return report('conflict', operation, 'legacy-data-changed');
        if (intent.kind === 'initialize' || intent.prepareSource) {
          const issue = ensureSource(intent);
          if (issue) return report(issue.status, operation, issue.reason);
        } else {
          const observedMeta = readRaw(metadataKey);
          if (readRaw(sourceKey) !== sourceRaw || (observedMeta !== intent.expectedMetadataRaw && observedMeta !== intent.targetMetadataRaw)) return report('conflict', operation, 'storage-metadata-changed');
        }
        const current = readRaw(key);
        if (current !== intent.expectedRaw && current !== intent.raw) return report('conflict', operation, 'storage-changed');
        if (intent.kind === 'restore') {
          // These copies are written and verified before replacing the main key.
          // Retrying a partially acknowledged restore writes the same safety data.
          if (readRaw(safetyKey) !== intent.safetyText) setVerified(safetyKey, intent.safetyText);
          if (readRaw(contextKey) !== intent.contextText) setVerified(contextKey, intent.contextText);
          if (readRaw(key) !== current || readRaw(legacyKey) !== intent.expectedLegacyRaw) return report('conflict', operation, 'storage-changed-during-safety-copy');
        }
        // Ordinary Persistence deliberately refuses corrupt JSON. Explicit repair
        // is the sole bypass, after exact preview checks and verified raw safety.
        let result;
        if (intent.replaceInvalid) {
          if (current !== intent.raw) storage.setItem(key, intent.raw);
          result = readRaw(key) === intent.raw ? { status: 'success' }
            : { status: 'conflict', reason: 'changed-during-write' };
        } else result = repository.commit(intent.database, { expectedRaw: intent.expectedRaw });
        if (result.status !== 'success') return report(result.status, operation, result.reason);
        if (readRaw(legacyKey) !== intent.expectedLegacyRaw) return report('conflict', operation, 'legacy-data-changed');
        if (intent.kind === 'restore' && intent.targetMetadataRaw !== intent.expectedMetadataRaw) setVerified(metadataKey, intent.targetMetadataRaw);
        metadataRaw = intent.targetMetadataRaw || intent.metadataRaw || metadataRaw;
        legacyRaw = intent.expectedLegacyRaw;
        const raw = intent.raw;
        direct = null; readable = null; loaded = true; attach(raw); previews.clear();
        return report('success', operation);
      } catch (error) { return report('unavailable', operation, 'write-or-safety-copy-failed', { message: error.message }); }
    }

    async function load() {
      return exclusive('load', locked => {
        if (pendingState()) return report('blocked', 'load', 'pending-write');
        let main, legacy, metadata, original;
        try { main = readRaw(key); legacy = readRaw(legacyKey); metadata = readRaw(metadataKey); original = readRaw(sourceKey); }
        catch { return report('unavailable', 'load', 'storage-read-failed'); }
        try {
          if (main !== null) {
            const db = parseDatabase(main);
            if (!Object.prototype.hasOwnProperty.call(db, 'practice')) throw new Error('Modern storage is missing its practice state.');
            const meta = parseMetadata(metadata); parseSource(original);
            metadataRaw = metadata; sourceRaw = original; legacyRaw = meta.legacy_raw;
            readable = db; attach(main); loaded = true;
            if (legacy !== legacyRaw) return report('conflict', 'load', 'legacy-data-changed');
            return report(locked ? 'success' : 'blocked', 'load', locked ? null : 'web-locks-unavailable');
          }
          let source;
          if (legacy === null) source = typeof seed === 'function' ? seed() : seed;
          else {
            // Validate JSON structure before a legacy migration callback sees it;
            // older schemas may be incomplete, but unsafe keys/numbers are not repaired.
            const inspected = persistence.create({ storage: { get: () => legacy, set() { throw new Error('Read-only inspection.'); } }, key, initialRaw: legacy }).getState();
            if (inspected.status !== 'success') throw new Error('Legacy data contains unsupported JSON values.');
            source = inspected.committed.database;
            if (!source || !Number.isSafeInteger(source.version) || source.version > practiceData.MAX_DATABASE_VERSION || source.version < 1) throw new Error('Unsupported legacy database version.');
            if (migrateLegacy) source = migrateLegacy(source);
          }
          const candidate = practiceData.initializeCandidate(source);
          readable = candidate; loaded = true;
          if (!locked) return report('blocked', 'load', 'web-locks-unavailable');
          if (original !== null && parseSource(original).raw !== legacy) throw new Error('An earlier migration preserved different legacy data; recover both copies first.');
          if (metadata !== null && parseMetadata(metadata).legacy_raw !== legacy) throw new Error('An earlier migration has a different source baseline.');
          sourceRaw = original; metadataRaw = metadata; legacyRaw = legacy; attach(null);
          const originalText = original || JSON.stringify({ format: 'german-vocab-coach-legacy-source', version: 1, saved_at: now(), raw: legacy });
          const metaText = metadata || JSON.stringify({ version: 1, legacy_raw: legacy });
          direct = { kind: 'initialize', database: candidate, raw: JSON.stringify(candidate), expectedRaw: null,
            expectedLegacyRaw: legacy, expectedMetadataRaw: metadata, sourceRaw: originalText, metadataRaw: metaText };
          return finishDirect('load');
        } catch (error) { return report('invalid', 'load', 'invalid-saved-data', { message: error.message }); }
      }, true);
    }
    async function transition(method, ...args) {
      return exclusive(method, () => {
        if (!loaded || !session) return report('blocked', method, 'database-not-loaded');
        if (direct) return report('blocked', method, 'pending-write');
        const result = session.transition(method, ...args);
        if (result.status === 'success') {
          const issue = guard();
          if (issue) return report(issue.status, method, issue.reason);
        }
        return report(result.status, method, result.reason, result.errorCode ? { errorCode: result.errorCode } : {});
      });
    }
    async function update(mutator) {
      return exclusive('update', () => {
        if (pendingState()) return report('blocked', 'update', 'pending-write');
        const committed = repository?.getState().committed;
        if (!loaded || !committed?.database) return report('blocked', 'update', 'database-not-loaded');
        let candidate;
        try {
          if (typeof mutator !== 'function') throw new TypeError('A synchronous update function is required.');
          const draft = practiceData.validateDatabase(committed.database);
          const returned = mutator(draft);
          candidate = practiceData.validateDatabase(returned === undefined ? draft : returned);
          if (!Object.prototype.hasOwnProperty.call(candidate, 'practice')) throw new Error('A modern update cannot remove practice history; initialize an explicit reset candidate first.');
        } catch (error) { return report('invalid', 'update', 'invalid-candidate', { message: error.message }); }
        direct = { kind: 'update', database: candidate, raw: JSON.stringify(candidate), expectedRaw: committed.raw,
          expectedLegacyRaw: legacyRaw, expectedMetadataRaw: metadataRaw, targetMetadataRaw: metadataRaw };
        return finishDirect('update');
      });
    }
    async function retry() {
      return exclusive('retry', () => {
        if (direct) return finishDirect('retry');
        if (!session) return report('invalid', 'retry', 'no-pending-write');
        const result = session.retry();
        if (result.status === 'success') {
          const issue = guard();
          if (issue) return report(issue.status, 'retry', issue.reason);
        }
        return report(result.status, 'retry', result.reason);
      });
    }
    async function previewRestore(text, options = {}) {
      return exclusive('previewRestore', () => {
        try {
          if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Invalid restore preview options.');
          const expected = Object.getOwnPropertyDescriptor(options, 'expectedRaw');
          if (expected && (!Object.prototype.hasOwnProperty.call(expected, 'value') || (expected.value !== null && typeof expected.value !== 'string'))) throw new Error('Invalid source snapshot for this restore preview.');
          const backup = practiceData.parse(text);
          const candidate = practiceData.initializeCandidate(backup.database);
          const expectedRaw = readRaw(key), observedLegacyRaw = readRaw(legacyKey), observedMetadataRaw = readRaw(metadataKey);
          if (expected && expected.value !== expectedRaw) {
            previews.clear();
            return { status: 'conflict', reason: 'restore-source-stale', message: 'Saved data changed in another tab. Reload before preparing this change.' };
          }
          let current = null, invalidCurrent = false;
          try { current = parseDatabase(expectedRaw); } catch { invalidCurrent = true; }
          const observedSourceRaw = readRaw(sourceKey);
          // Missing metadata is allowed only for a new canonical key or explicit
          // recovery initialization; an existing unsupported metadata record is preserved.
          const meta = observedMetadataRaw === null ? { legacy_raw: observedLegacyRaw } : parseMetadata(observedMetadataRaw);
          if (observedSourceRaw !== null) parseSource(observedSourceRaw);
          if (!invalidCurrent && (observedMetadataRaw === null || observedSourceRaw === null)) throw new Error('Saved storage metadata is missing.');
          const id = `restore-${nextPreview++}`;
          const summary = { words: candidate.words.length, sessions: candidate.sessions.length, attempts: candidate.practice.attempts.length,
            exportedAt: backup.exported_at, formatVersion: backup.format_version, learnerName: candidate.profile.name,
            replacesWords: current?.words.length ?? null, replacesAttempts: current?.practice?.attempts.length ?? null,
            invalidCurrent, safetyFormat: invalidCurrent ? 'raw-recovery' : 'full-backup',
            legacyChanged: observedLegacyRaw !== meta.legacy_raw, pendingWrite: Boolean(pendingState()) };
          previews.clear(); previews.set(id, { database: candidate, expectedRaw, observedLegacyRaw, observedMetadataRaw, sourceRaw: observedSourceRaw, summary });
          return { status: 'success', previewId: id, summary: copy(summary) };
        } catch (error) { previews.clear(); return { status: 'invalid', reason: 'invalid-restore-preview', message: error.message }; }
      }, true);
    }
    async function restore(previewId, { acknowledgeLegacyChange = false, discardPending = false, replaceInvalid = false } = {}) {
      return exclusive('restore', () => {
        const preview = previews.get(previewId);
        if (!preview) return report('invalid', 'restore', 'restore-preview-expired');
        if (pendingState() && discardPending !== true) return report('blocked', 'restore', 'pending-write');
        try {
          if (readRaw(key) !== preview.expectedRaw || readRaw(legacyKey) !== preview.observedLegacyRaw
            || readRaw(metadataKey) !== preview.observedMetadataRaw || readRaw(sourceKey) !== preview.sourceRaw) return report('conflict', 'restore', 'restore-preview-stale');
          if (preview.summary.legacyChanged && acknowledgeLegacyChange !== true) return report('blocked', 'restore', 'legacy-change-needs-confirmation');
          if (preview.summary.invalidCurrent && replaceInvalid !== true) return report('blocked', 'restore', 'invalid-replacement-needs-confirmation');
          const previous = preview.summary.invalidCurrent ? null : parseDatabase(preview.expectedRaw);
          const candidate = practiceData.validateDatabase(preview.database);
          const targetMetadataRaw = JSON.stringify({ version: 1, legacy_raw: preview.observedLegacyRaw });
          const discarded = copy(pendingState());
          const prepareSource = preview.sourceRaw === null || preview.observedMetadataRaw === null;
          const newSourceRaw = preview.sourceRaw || JSON.stringify({ format: 'german-vocab-coach-legacy-source', version: 1, saved_at: now(), raw: preview.observedLegacyRaw });
          sourceRaw = preview.sourceRaw; metadataRaw = preview.observedMetadataRaw;
          direct = { kind: 'restore', database: candidate, raw: JSON.stringify(candidate), expectedRaw: preview.expectedRaw,
            expectedLegacyRaw: preview.observedLegacyRaw, expectedMetadataRaw: preview.observedMetadataRaw, targetMetadataRaw,
            replaceInvalid: preview.summary.invalidCurrent, prepareSource, sourceRaw: newSourceRaw,
            metadataRaw: preview.observedMetadataRaw || targetMetadataRaw,
            safetyText: previous ? practiceData.stringify(previous, { exportedAt: now() }) : JSON.stringify({
              format: 'german-vocab-coach-raw-recovery', format_version: 1, exported_at: now(),
              storage_key: key, raw: preview.expectedRaw, legacy_raw: preview.observedLegacyRaw,
              metadata_raw: preview.observedMetadataRaw, original_legacy_raw: preview.sourceRaw }, null, 2),
            contextText: JSON.stringify({ format: 'german-vocab-coach-restore-context', version: 1, saved_at: now(),
              previous_raw: preview.expectedRaw, legacy_raw: preview.observedLegacyRaw, metadata_raw: preview.observedMetadataRaw, replaced_pending: discarded }) };
          return finishDirect('restore');
        } catch (error) { return report('unavailable', 'restore', 'restore-preparation-failed', { message: error.message }); }
      });
    }
    function exportBackup({ source = 'committed' } = {}) {
      const db = source === 'pending' ? pendingState()?.database : source === 'committed' ? getState().database : null;
      if (!db) throw new Error('No validated database is available for this backup.');
      return practiceData.stringify(db, { exportedAt: now() });
    }
    function exportRecovery() {
      return JSON.stringify({ format: 'german-vocab-coach-recovery', format_version: 1, exported_at: now(),
        status: copy(last), committed: repository?.getState().committed || null, readable: copy(readable), pending: copy(pendingState()),
        stored: rawObservation(key), legacy: rawObservation(legacyKey), original_legacy: rawObservation(sourceKey),
        metadata: rawObservation(metadataKey), before_restore: rawObservation(safetyKey), restore_context: rawObservation(contextKey) }, null, 2);
    }
    function exportSafetyCopy() {
      const text = readRaw(safetyKey);
      if (!text) throw new Error('No pre-restore backup is available.');
      const parsed = JSON.parse(text);
      if (parsed?.format === 'german-vocab-coach-raw-recovery' && parsed.format_version === 1
        && (parsed.raw === null || typeof parsed.raw === 'string') && (parsed.legacy_raw === null || typeof parsed.legacy_raw === 'string')) return text;
      practiceData.parse(text); return text;
    }
    function cancelRestorePreview() { previews.clear(); }
    const api = { load, getState, transition, update, retry, previewRestore, restore, cancelRestorePreview, exportBackup, exportRecovery, exportSafetyCopy };
    for (const method of METHODS) api[method] = (...args) => transition(method, ...args);
    return Object.freeze(api);
  }
  async function open(options) { const store = create(options); await store.load(); return store; }
  return Object.freeze({ LEGACY_KEY, STORAGE_KEY, create, open });
})();
if (typeof module !== 'undefined') module.exports = CoachStore;
