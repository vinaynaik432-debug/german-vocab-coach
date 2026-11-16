/* Inactive candidate backup adapter. No persistence, restore, or automatic migration. */
const PracticeData = (() => {
  const FORMAT_VERSION = 2;
  const MAX_DATABASE_VERSION = 6;
  const LIMITS = Object.freeze({ textBytes: 20 * 1024 * 1024, attempts: 100000, words: 50000,
    sessions: 100000, answerBytes: 64 * 1024, identifierCharacters: 256, depth: 64 });
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const fail = message => { throw new Error(message); };

  function copyJson(value, ancestors = new Set(), depth = 0) {
    if (depth > LIMITS.depth) fail('Practice data is nested too deeply.');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0) && (!Number.isInteger(value) || Number.isSafeInteger(value))) return value;
    if (!value || typeof value !== 'object' || ancestors.has(value)) fail('Practice data must be finite, acyclic JSON data.');
    const prototype = Object.getPrototypeOf(value);
    const array = Array.isArray(value);
    if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) fail('Practice data must use plain JSON objects and arrays.');
    const keys = Reflect.ownKeys(value);
    const enumerable = [];
    for (const key of keys) {
      if (typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key)) fail('Practice data contains a reserved or unsupported property.');
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || descriptor.get || descriptor.set) fail('Practice data cannot contain accessor properties.');
      if (array && key === 'length') continue;
      if (!descriptor.enumerable) fail('Practice data contains non-enumerable data that JSON would lose.');
      enumerable.push(key);
    }
    if (array && (enumerable.length !== value.length || enumerable.some((key, index) => key !== String(index)))) fail('Practice data contains an incomplete or decorated list.');
    const nextAncestors = new Set(ancestors); nextAncestors.add(value);
    const copy = array ? [] : {};
    for (const key of enumerable) copy[key] = copyJson(Object.getOwnPropertyDescriptor(value, key).value, nextAncestors, depth + 1);
    return copy;
  }

  function equalJson(left, right) {
    if (left === right) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(left) !== Array.isArray(right)) return false;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(key => own(right, key) && equalJson(left[key], right[key]));
  }

  function bytes(text) {
    let size = 0;
    for (const char of text) {
      const point = char.codePointAt(0);
      size += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    }
    return size;
  }
  function checkSize(text) {
    if (text.length > LIMITS.textBytes || bytes(text) > LIMITS.textBytes) fail('Practice backup exceeds the 20 MB limit.');
  }
  function identifier(value, label) {
    if (typeof value !== 'string' || !value.trim() || value.length > LIMITS.identifierCharacters) fail(`${label} is invalid or exceeds the identifier limit.`);
  }
  function answer(value, label) {
    if (typeof value !== 'string' || value.length > LIMITS.answerBytes || bytes(value) > LIMITS.answerBytes) fail(`${label} is invalid or exceeds the 64 KB limit.`);
  }
  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0); date.setUTCFullYear(year, month - 1, day);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  function timestamp(value, label) {
    const match = typeof value === 'string' && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
    if (!match || !validDay(match[1]) || +match[2] > 23 || +match[3] > 59 || +match[4] > 59
      || (match[5] !== 'Z' && (+match[6] > 23 || +match[7] > 59)) || !Number.isFinite(Date.parse(value))) fail(`${label} is not a valid ISO timestamp.`);
    return Date.parse(value);
  }

  function create({ backupData, practiceEngine, reviewScheduler } = {}) {
    if (!backupData || !['validateDatabase', 'create', 'validateBackup'].every(key => typeof backupData[key] === 'function')
      || backupData.FORMAT_VERSION !== 1) fail('Supported BackupData version 1 must be injected.');
    if (!practiceEngine || practiceEngine.VERSION !== 1 || typeof practiceEngine.initialize !== 'function') fail('Supported PracticeEngine version 1 must be injected.');
    if (!reviewScheduler || reviewScheduler.VERSION !== 1 || reviewScheduler.SCHEDULE_VERSION !== 'fixed-days-1-3-7-14-30-v1'
      || typeof reviewScheduler.isDue !== 'function') fail('Supported ReviewScheduler version 1 must be injected.');

    function validateReview(review, label) {
      if (review === null) return;
      if (!isRecord(review) || review.version !== reviewScheduler.VERSION || review.schedule_version !== reviewScheduler.SCHEDULE_VERSION) fail(`${label} uses invalid or unsupported review data.`);
      if (!Number.isSafeInteger(review.stage) || review.stage < 0 || review.stage > 5) fail(`${label} has an invalid review stage.`);
      const due = timestamp(review.due_at, `${label} due date`);
      const attempted = timestamp(review.last_attempt_at, `${label} attempt date`);
      if (!['correct', 'half', 'wrong'].includes(review.last_result) || typeof review.last_assisted !== 'boolean') fail(`${label} has invalid review outcome evidence.`);
      if (review.last_advanced_at !== '' && typeof review.last_advanced_at !== 'string') fail(`${label} has invalid advancement evidence.`);
      if (review.last_advanced_day !== '' && !validDay(review.last_advanced_day)) fail(`${label} has an invalid advancement day.`);
      if (Boolean(review.last_advanced_at) !== Boolean(review.last_advanced_day) || (review.stage > 0 && !review.last_advanced_at)) fail(`${label} is missing advancement evidence.`);
      if (review.last_advanced_at) {
        const advanced = timestamp(review.last_advanced_at, `${label} advancement date`);
        if (advanced > attempted || due < advanced + reviewScheduler.DAY_MS) fail(`${label} has inconsistent advancement times.`);
      }
      if (review.blocked_day !== '' && !validDay(review.blocked_day)) fail(`${label} has an invalid correction day.`);
      if (review.blocked_until !== '' && typeof review.blocked_until !== 'string') fail(`${label} has invalid correction timing.`);
      if (Boolean(review.blocked_day) !== Boolean(review.blocked_until)) fail(`${label} has incomplete correction evidence.`);
      if (review.blocked_until && due < timestamp(review.blocked_until, `${label} correction deadline`)) fail(`${label} is due before its correction block ends.`);
      if (review.last_result !== 'correct' && review.stage !== 0) fail(`${label} has a failure without an interval reset.`);
      // The injected scheduler must also recognize this candidate as a supported schedule.
      if (!reviewScheduler.isDue({ review: copyJson(review) }, new Date(Math.max(due, attempted)).toISOString())) fail(`${label} is not recognized by the review scheduler.`);
    }

    function validatePractice(db) {
      if (!own(db, 'practice')) return;
      const practice = db.practice;
      if (!isRecord(practice) || practice.version !== practiceEngine.VERSION) fail('Unsupported or invalid practice version.');
      if (!Array.isArray(practice.attempts) || practice.attempts.length > LIMITS.attempts) fail('Practice attempts are invalid or exceed the 100000-attempt limit.');
      const map = new Map();
      const latestByWord = new Map();
      const latestByFirst = new Map();
      for (const attempt of practice.attempts) {
        if (!isRecord(attempt)) fail('Invalid practice attempt.');
        identifier(attempt.id, 'Attempt ID'); identifier(attempt.word_id, 'Attempt word ID');
        identifier(attempt.first_attempt_id, 'First attempt ID'); answer(attempt.answer, 'Attempt answer');
        const at = timestamp(attempt.at, 'Attempt timestamp');
        const previous = latestByWord.get(attempt.word_id);
        if (previous && at < Date.parse(previous.at)) fail('Attempt times for a word run backwards.');
        if (attempt.kind === 'correction') {
          const first = map.get(attempt.first_attempt_id);
          if (!first || first.kind !== 'first' || first.word_id !== attempt.word_id || first.source !== attempt.source || at < Date.parse(first.at)) fail('Correction does not match an earlier first attempt.');
          const previousInPrompt = latestByFirst.get(attempt.first_attempt_id) || first;
          if ((previousInPrompt.hint_used && !attempt.hint_used) || (previousInPrompt.revealed && !attempt.revealed)) fail('Correction discarded earlier assistance evidence.');
        }
        map.set(attempt.id, attempt); latestByWord.set(attempt.word_id, attempt);
        latestByFirst.set(attempt.first_attempt_id, attempt);
      }
      const pending = practice.pending;
      if (pending !== null) {
        if (!isRecord(pending)) fail('Invalid pending practice item.');
        identifier(pending.attempt_id, 'Pending attempt ID'); identifier(pending.word_id, 'Pending word ID');
        answer(pending.draft, 'Pending draft');
        const started = timestamp(pending.started_at, 'Pending start');
        const updated = timestamp(pending.updated_at, 'Pending update');
        if (updated < started) fail('Pending update precedes its start.');
        if (!Array.isArray(pending.correction_ids)) fail('Invalid pending correction list.');
        for (const id of pending.correction_ids) identifier(id, 'Correction ID');
        const associated = practice.attempts.filter(attempt => attempt.first_attempt_id === pending.attempt_id);
        if (associated.some(attempt => Date.parse(attempt.at) < started || Date.parse(attempt.at) > updated)) fail('Pending timestamps do not contain their recorded answers.');
        const correctionIds = associated.filter(attempt => attempt.kind === 'correction').map(attempt => attempt.id);
        if (!equalJson(correctionIds, pending.correction_ids)) fail('Pending corrections are missing or out of order.');
        if (associated.some(attempt => (attempt.hint_used && !pending.hint_used) || (attempt.revealed && !pending.revealed))) fail('Pending item discarded recorded assistance evidence.');
      }
      // Validate the owning engine's full schema without adopting any normalization.
      const checked = practiceEngine.initialize(copyJson(db));
      if (!equalJson(checked, db)) fail('Practice validation would change saved data; explicit migration is required.');
      for (const word of db.words) {
        const latest = latestByWord.get(word.id);
        if (!latest) continue;
        if (!isRecord(word.review)) fail('A retained practiced word is missing its review state.');
        const at = Date.parse(word.review.last_attempt_at);
        if (at < Date.parse(latest.at)) fail('Review state is older than its latest saved attempt.');
        if (at === Date.parse(latest.at) && (word.review.last_result !== latest.result || word.review.last_assisted !== latest.assisted)) fail('Review outcome disagrees with the latest saved attempt.');
      }
    }

    function validateDatabase(database) {
      const copied = copyJson(database);
      checkSize(JSON.stringify(copied));
      const db = backupData.validateDatabase(copied, { maxDatabaseVersion: MAX_DATABASE_VERSION });
      if (db.words.length > LIMITS.words || db.sessions.length > LIMITS.sessions) fail('Practice data exceeds the word or session count limit.');
      for (const word of db.words) {
        identifier(word.id, 'Word ID');
        if (own(word, 'review')) validateReview(word.review, `Word ${word.id}`);
      }
      validatePractice(db);
      if (!equalJson(db, copied)) fail('Backup validation would change saved data; explicit migration is required.');
      return db;
    }

    function initializeCandidate(database) {
      const db = validateDatabase(database);
      if (own(db, 'practice')) return db;
      const candidate = practiceEngine.initialize(copyJson(db));
      const expected = { ...db, practice: { version: practiceEngine.VERSION, attempts: [], pending: null, paused: false } };
      if (!equalJson(candidate, expected)) fail('Practice initialization changed existing data.');
      return validateDatabase(candidate);
    }

    function createBackup(database, options = {}) {
      if (!isRecord(options)) fail('Backup options must be an object.');
      if (own(options, 'maxDatabaseVersion') && options.maxDatabaseVersion !== MAX_DATABASE_VERSION) fail('The supported database version cannot be overridden.');
      const db = validateDatabase(database);
      const backup = backupData.create(db, { exportedAt: options.exportedAt, maxDatabaseVersion: MAX_DATABASE_VERSION });
      timestamp(backup.exported_at, 'Backup export timestamp');
      backup.format_version = FORMAT_VERSION;
      checkSize(JSON.stringify(backup, null, 2));
      return backup;
    }

    function validateBackup(backup) {
      const copied = copyJson(backup);
      checkSize(JSON.stringify(copied));
      if (!isRecord(copied) || copied.format !== backupData.FORMAT || ![1, FORMAT_VERSION].includes(copied.format_version)) fail('Unsupported practice backup format; use a supported full JSON backup.');
      timestamp(copied.exported_at, 'Backup export timestamp');
      const checked = backupData.validateBackup({ ...copied, format_version: 1 }, { maxDatabaseVersion: MAX_DATABASE_VERSION });
      checked.format_version = copied.format_version;
      checked.database = validateDatabase(checked.database);
      if (!equalJson(checked, copied)) fail('Backup validation would discard or change data.');
      return checked;
    }

    function stringify(database, options) { return JSON.stringify(createBackup(database, options), null, 2); }
    function parse(text) {
      if (typeof text !== 'string') fail('The practice backup must be JSON text.');
      checkSize(text);
      let value;
      try { value = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { fail('The practice backup is not valid JSON.'); }
      return validateBackup(value);
    }

    return Object.freeze({ FORMAT: backupData.FORMAT, FORMAT_VERSION, MAX_DATABASE_VERSION, LIMITS,
      initializeCandidate, validateDatabase, create: createBackup, stringify, parse, validateBackup });
  }

  return Object.freeze({ FORMAT_VERSION, MAX_DATABASE_VERSION, LIMITS, create });
})();
if (typeof module !== 'undefined') module.exports = PracticeData;
