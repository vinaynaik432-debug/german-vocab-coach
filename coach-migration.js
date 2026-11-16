/* Explicit, candidate-only legacy migration. The store retains the original bytes. */
const CoachMigration = (() => {
  const VERSION = 6;
  const levels = new Set(['A1', 'A2', 'B1', 'B2']);
  const statuses = new Set(['new', 'learning', 'mastered']);
  const own = (object, property) => Object.prototype.hasOwnProperty.call(object, property);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const fail = message => { throw new Error(message); };
  const normalized = text => text.normalize('NFC').trim().toLocaleLowerCase('de').replace(/\s+/g, ' ');
  const wordKey = word => JSON.stringify([normalized(word.word_en), normalized(word.word_de)]);

  // Preserve unknown history or reject it; JSON.stringify can silently erase it.
  function copyJson(value, ancestors = new Set(), depth = 0) {
    if (depth > 64) fail('The older database is nested too deeply.');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)
      && (!Number.isInteger(value) || Number.isSafeInteger(value))) return value;
    if (!value || typeof value !== 'object' || ancestors.has(value)) fail('The older database contains data that cannot be preserved as JSON.');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) fail('The older database contains an unsupported object.');
    const keys = Reflect.ownKeys(value);
    if (array && (keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9]\d*)$/.test(String(key))))) fail('The older database contains an incomplete or decorated list.');
    const result = array ? [] : {}, next = new Set(ancestors); next.add(value);
    for (const key of keys) {
      if (typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key)) fail('The older database contains an unsupported property.');
      if (array && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !own(descriptor, 'value') || !descriptor.enumerable) fail('The older database contains data that JSON would lose.');
      result[key] = copyJson(descriptor.value, next, depth + 1);
    }
    return result;
  }

  function timestamp(value) {
    const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
    if (!match) return false;
    const date = new Date(0); date.setUTCFullYear(+match[1], +match[2] - 1, +match[3]);
    return date.getUTCFullYear() === +match[1] && date.getUTCMonth() === +match[2] - 1 && date.getUTCDate() === +match[3]
      && +match[4] < 24 && +match[5] < 60 && +match[6] < 60 && (match[7] === 'Z' || (+match[8] < 24 && +match[9] < 60))
      && Number.isFinite(Date.parse(value));
  }
  function dateField(object, property, fallback) {
    if (!own(object, property) || object[property] === '') object[property] = fallback;
    else if (!timestamp(object[property])) fail('An older creation date needs recovery.');
  }
  function identifier(value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 256) fail('An older word identifier needs recovery.');
    return value;
  }
  function count(value) {
    // Earlier imports used decimal strings; never floor, clamp or coerce flags.
    const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
    if (!Number.isSafeInteger(number) || number < 0) fail('An older learning counter needs recovery.');
    return number;
  }
  function uniqueId(preferred, ids) {
    let candidate = preferred, suffix = 2;
    while (ids.has(candidate)) candidate = `${preferred.slice(0, 245)}-${suffix++}`;
    ids.add(candidate);
    return candidate;
  }
  function wordShape(word) {
    if (!record(word) || typeof word.word_en !== 'string' || typeof word.word_de !== 'string'
      || !word.word_en.trim() || !word.word_de.trim()) fail('An older word needs recovery.');
  }

  function upgrade(raw, { seed, recall, at = new Date().toISOString() } = {}) {
    const db = copyJson(raw), fresh = copyJson(seed);
    if (!record(db) || !Array.isArray(db.words) || (own(db, 'sessions') && !Array.isArray(db.sessions))) fail('The older database needs recovery.');
    if (!Number.isSafeInteger(db.version) || db.version < 1 || db.version > VERSION) fail('Unsupported database version.');
    if (!record(fresh) || fresh.version !== VERSION || !Array.isArray(fresh.words) || !record(fresh.profile) || !record(fresh.profile.modeLevels)) fail('A supported fresh vocabulary seed is required.');
    if (!recall || typeof recall.normalizeWord !== 'function') fail('Recall evidence support is required.');
    if (!timestamp(at)) fail('A valid migration timestamp is required.');

    // Reserve all saved IDs before filling missing ones. Never reassign history.
    const ids = new Set();
    for (const word of db.words) {
      wordShape(word);
      if (own(word, 'id')) {
        const id = identifier(word.id);
        if (ids.has(id)) fail('Duplicate word identifiers need recovery.');
        ids.add(id);
      }
    }
    db.words.forEach((word, index) => {
      if (!own(word, 'id')) word.id = uniqueId(`legacy-${index + 1}`, ids);
      if (!own(word, 'status')) word.status = 'new';
      if (!statuses.has(word.status)) fail('An older learning status needs recovery.');
      for (const property of ['correct_streak', 'times_seen', 'wrong_count', 'half_count']) word[property] = own(word, property) ? count(word[property]) : 0;
      if (!own(word, 'difficulty')) word.difficulty = 'B1';
      if (!levels.has(word.difficulty)) fail('An older word level needs recovery.');
      if (!own(word, 'notes')) word.notes = '';
      if (typeof word.notes !== 'string') fail('An older word note needs recovery.');
      dateField(word, 'created_at', at);
      if (own(word, 'recall')) {
        if (!record(word.recall) || word.recall.version !== 1) fail('Unsupported recall evidence cannot be replaced.');
        // Reconcile the label without normalizing away retained evidence or its
        // extension fields. Invalid evidence cannot become verified mastery.
        const probe = copyJson(word); recall.normalizeWord(probe);
        word.status = probe.status;
        if (!own(word, 'legacy_mastery') && own(probe, 'legacy_mastery')) word.legacy_mastery = probe.legacy_mastery;
      } else recall.normalizeWord(word);
    });
    if (!own(db, 'sessions')) db.sessions = [];
    dateField(db, 'created_at', at);

    const profile = own(db, 'profile') ? db.profile : {};
    if (!record(profile) || (own(profile, 'modeLevels') && !record(profile.modeLevels))) fail('The older learner profile needs recovery.');
    const level = own(profile, 'level') ? profile.level : 'B1';
    if (!levels.has(level)) fail('An older profile level needs recovery.');
    db.profile = { ...fresh.profile, ...profile, level, modeLevels: { ...fresh.profile.modeLevels, ...profile.modeLevels } };
    if (typeof db.profile.name !== 'string') fail('An older profile name needs recovery.');
    for (const property of ['hasChosenName', 'hasChosenLevel']) {
      if (!own(profile, property)) db.profile[property] = property === 'hasChosenName' ? Boolean(db.profile.name) : false;
      if (typeof db.profile[property] !== 'boolean') fail('An older profile choice needs recovery.');
    }
    db.profile.weeklyGoal = own(profile, 'weeklyGoal') ? count(profile.weeklyGoal) : fresh.profile.weeklyGoal;
    if (db.profile.weeklyGoal < 5 || db.profile.weeklyGoal > 100) fail('An older practice goal needs recovery.');
    for (const mode of Object.keys(fresh.profile.modeLevels)) {
      if (!profile.modeLevels || !own(profile.modeLevels, mode)) db.profile.modeLevels[mode] = level;
      if (!levels.has(db.profile.modeLevels[mode])) fail('An older practice level needs recovery.');
    }
    if (!own(db, 'preferences')) db.preferences = {};
    if (!record(db.preferences)) fail('The older preferences need recovery.');
    if (!own(db.preferences, 'learningFocus')) db.preferences.learningFocus = 'marketing';
    if (!['marketing', 'everyday'].includes(db.preferences.learningFocus)) fail('An unsupported learning priority cannot be replaced.');

    const existing = new Map(), seedIds = new Set();
    for (const word of db.words) if (!existing.has(wordKey(word))) existing.set(wordKey(word), word);
    for (const word of fresh.words) {
      wordShape(word); identifier(word.id);
      if (seedIds.has(word.id)) fail('The fresh vocabulary contains duplicate identifiers.');
      seedIds.add(word.id);
      const key = wordKey(word), found = existing.get(key);
      if (found) {
        if (word.curriculum_id && !own(found, 'curriculum_id')) found.curriculum_id = word.curriculum_id;
        continue;
      }
      word.id = uniqueId(ids.has(word.id) ? `imported-${word.id}`.slice(0, 256) : word.id, ids);
      db.words.push(word); existing.set(key, word);
    }
    db.version = VERSION;
    return db;
  }
  return { upgrade };
})();
if (typeof module !== 'undefined') module.exports = CoachMigration;
