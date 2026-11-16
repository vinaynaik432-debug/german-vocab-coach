/* Full, versioned learning backups. CSV remains a word-list exchange format. */
const BackupData = (() => {
  const FORMAT = 'german-vocab-coach-backup';
  const FORMAT_VERSION = 1;
  const MAX_TEXT_BYTES = 20 * 1024 * 1024;
  const LEVELS = new Set(['A1', 'A2', 'B1', 'B2']);
  const WORD_STATUSES = new Set(['new', 'learning', 'mastered']);
  const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

  function fail(message) { throw new Error(message); }
  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  function string(value, path, { nonempty = false } = {}) {
    if (typeof value !== 'string' || (nonempty && !value.trim())) fail(`${path} must be ${nonempty ? 'a non-empty' : 'a'} text value.`);
  }
  function number(value, path, { integer = false, min = 0, max = Infinity } = {}) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) {
      fail(`${path} contains an invalid number.`);
    }
  }
  function timestamp(value, path) {
    string(value, path, { nonempty: true });
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/);
    const monthDays = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate() : 0;
    if (!match || Number(match[2]) < 1 || Number(match[2]) > 12 || Number(match[3]) < 1 || Number(match[3]) > monthDays || !Number.isFinite(Date.parse(value))) {
      fail(`${path} must contain a valid date and time.`);
    }
  }
  function level(value, path) {
    if (!LEVELS.has(value)) fail(`${path} contains an unsupported learning level.`);
  }

  // Copy only JSON data. Reject reserved keys at every depth, unsupported values,
  // accessor properties and cycles instead of silently losing them in JSON.stringify.
  function copyJson(value, path = 'Backup', ancestors = new Set(), depth = 0) {
    if (depth > 64) fail('This backup is nested too deeply.');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail(`${path} contains a non-finite number.`);
      return value;
    }
    if (typeof value !== 'object') fail(`${path} contains unsupported data.`);
    if (ancestors.has(value)) fail('The learning data contains a circular reference.');
    if (Object.getOwnPropertySymbols(value).length) fail(`${path} contains unsupported symbol data.`);
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== null && Object.getPrototypeOf(prototype) !== null) fail(`${path} contains unsupported data.`);
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(value);
    const copy = Array.isArray(value) ? [] : {};
    const keys = Object.keys(value);
    if (Array.isArray(value) && (keys.length !== value.length || keys.some((key, index) => key !== String(index)))) {
      fail(`${path} contains an incomplete or unsupported list.`);
    }
    for (const key of keys) {
      if (RESERVED_KEYS.has(key)) fail(`${path} contains a reserved property name.`);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || descriptor.get || descriptor.set) fail(`${path} contains unsupported accessor data.`);
      copy[key] = copyJson(descriptor.value, `${path}.${key}`, nextAncestors, depth + 1);
    }
    if (Array.isArray(value) && copy.length !== value.length) fail(`${path} contains an incomplete list.`);
    return copy;
  }

  function validateDatabase(database, { maxDatabaseVersion = Infinity } = {}) {
    const db = copyJson(database, 'Learning data');
    if (!isRecord(db)) fail('The backup does not contain a learning database.');
    number(db.version, 'Database version', { integer: true, min: 1 });
    if (db.version > maxDatabaseVersion) fail('This backup was created by a newer app version. Update the app before restoring it.');
    timestamp(db.created_at, 'Database creation date');
    if (!Array.isArray(db.words)) fail('The backup word list is missing or invalid.');
    if (!Array.isArray(db.sessions)) fail('The backup session history is missing or invalid.');
    if (!isRecord(db.profile)) fail('The backup learner profile is missing or invalid.');
    if (!isRecord(db.preferences)) fail('The backup preferences are missing or invalid.');

    const ids = new Set();
    db.words.forEach((word, index) => {
      const path = `Word ${index + 1}`;
      if (!isRecord(word)) fail(`${path} is not a word record.`);
      for (const key of ['id', 'word_en', 'word_de']) string(word[key], `${path} ${key}`, { nonempty: true });
      if (ids.has(word.id)) fail('The backup contains duplicate word identifiers.');
      ids.add(word.id);
      if (!WORD_STATUSES.has(word.status)) fail(`${path} has an invalid learning status.`);
      for (const key of ['correct_streak', 'times_seen', 'wrong_count', 'half_count']) {
        number(word[key], `${path} ${key}`, { integer: true });
      }
      for (const key of ['part_of_speech', 'topic', 'notes']) {
        if (key in word) string(word[key], `${path} ${key}`);
      }
      if ('difficulty' in word) level(word.difficulty, `${path} difficulty`);
      if ('created_at' in word) timestamp(word.created_at, `${path} creation date`);
      if ('accepted_answers' in word && !(
        typeof word.accepted_answers === 'string' ||
        (Array.isArray(word.accepted_answers) && word.accepted_answers.every(answer => typeof answer === 'string'))
      )) fail(`${path} has invalid accepted answers.`);
    });

    db.sessions.forEach((session, index) => {
      const path = `Session ${index + 1}`;
      if (!isRecord(session)) fail(`${path} is not a session record.`);
      string(session.round_id, `${path} identifier`, { nonempty: true });
      timestamp(session.date, `${path} date`);
      for (const key of ['score_correct', 'score_total']) {
        if (key in session) number(session[key], `${path} ${key}`);
      }
      if ('score_correct' in session && 'score_total' in session && session.score_correct > session.score_total) {
        fail(`${path} has a score greater than its total.`);
      }
      if ('accuracy' in session) number(session.accuracy, `${path} accuracy`, { max: 100 });
      for (const key of ['count_new', 'count_learning', 'count_mastered_review']) {
        if (key in session) number(session[key], `${path} ${key}`, { integer: true });
      }
      for (const key of ['words_ids', 'missed_word_ids', 'wrong_word_ids', 'half_word_ids', 'drill_ids', 'sentence_ids', 'tense_ids']) {
        if (key in session && (!Array.isArray(session[key]) || !session[key].every(id => typeof id === 'string'))) {
          fail(`${path} has an invalid ${key} list.`);
        }
      }
      // Historical sessions may refer to words removed by a previous import.
      // Preserve those references rather than silently rewriting history.
      for (const key of ['retry_only', 'skipped']) {
        if (key in session && typeof session[key] !== 'boolean') fail(`${path} has an invalid ${key} value.`);
      }
      if ('mode' in session) string(session.mode, `${path} mode`);
      if ('level' in session) level(session.level, `${path} level`);
    });

    string(db.profile.name, 'Profile name');
    level(db.profile.level, 'Profile level');
    number(db.profile.weeklyGoal, 'Weekly goal', { integer: true, min: 5, max: 100 });
    for (const key of ['hasChosenName', 'hasChosenLevel']) {
      if (typeof db.profile[key] !== 'boolean') fail(`Profile ${key} must be true or false.`);
    }
    if (!isRecord(db.profile.modeLevels)) fail('The profile mode levels are missing or invalid.');
    for (const mode of ['vocab', 'story', 'context', 'sentence', 'tense']) level(db.profile.modeLevels[mode], `${mode} level`);
    if (!['marketing', 'everyday'].includes(db.preferences.learningFocus)) fail('The learning priority is missing or invalid.');
    return db;
  }

  function create(database, { exportedAt = new Date().toISOString(), maxDatabaseVersion = Infinity } = {}) {
    timestamp(exportedAt, 'Backup export date');
    return {
      format: FORMAT,
      format_version: FORMAT_VERSION,
      exported_at: exportedAt,
      database: validateDatabase(database, { maxDatabaseVersion }),
    };
  }

  function validateBackup(backup, options = {}) {
    const clean = copyJson(backup);
    if (!isRecord(clean) || clean.format !== FORMAT) fail('Choose a German Vocab Coach full backup (.json), not a CSV word list.');
    if (clean.format_version !== FORMAT_VERSION) fail('This backup format is not supported by this app version.');
    timestamp(clean.exported_at, 'Backup export date');
    clean.database = validateDatabase(clean.database, options);
    return clean;
  }

  function byteLength(text) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    // Browser fallback: count UTF-8 bytes without allocating an encoded buffer.
    let bytes = 0;
    for (const char of text) {
      const point = char.codePointAt(0);
      bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    }
    return bytes;
  }

  function checkSize(text) {
    if (text.length > MAX_TEXT_BYTES || byteLength(text) > MAX_TEXT_BYTES) fail('This backup exceeds the 20 MB limit.');
  }

  function stringify(database, options = {}) {
    const text = JSON.stringify(create(database, options), null, 2);
    checkSize(text);
    return text;
  }

  function parse(text, options = {}) {
    if (typeof text !== 'string') fail('The backup must be a JSON text file.');
    checkSize(text);
    let value;
    try { value = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch { fail('This file is not valid JSON. Your current data has not been changed.'); }
    return validateBackup(value, options);
  }

  function preview(backup, options = {}) {
    const clean = validateBackup(backup, options);
    const db = clean.database;
    const counts = { new: 0, learning: 0, mastered: 0 };
    db.words.forEach(word => { counts[word.status] += 1; });
    const dates = db.sessions.map(session => session.date).sort((a, b) => Date.parse(a) - Date.parse(b));
    return {
      exportedAt: clean.exported_at,
      databaseVersion: db.version,
      createdAt: db.created_at,
      wordCount: db.words.length,
      sessionCount: db.sessions.length,
      learnerName: db.profile.name,
      learningFocus: db.preferences.learningFocus,
      counts,
      firstSessionAt: dates[0] || null,
      lastSessionAt: dates.at(-1) || null,
    };
  }

  return Object.freeze({ FORMAT, FORMAT_VERSION, MAX_TEXT_BYTES, create, stringify, parse, preview, validateDatabase, validateBackup });
})();
if (typeof module !== 'undefined') module.exports = BackupData;
