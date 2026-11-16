/* Direct recall evidence is separate from exposure, recognition, and legacy scores. */
const RecallEvidence = (() => {
  const VERSION = 1;
  const REQUIRED_DAYS = 3;
  const MIN_GAP_MS = 24 * 60 * 60 * 1000;
  const SOURCES = new Set(['choice', 'recognition', 'story', 'sentence', 'tense', 'context', 'other']);
  const integer = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

  function localDay(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function validTimestamp(value) {
    return typeof value === 'string'
      && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      && validDay(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
  }

  function dateFor(at) {
    if (typeof at === 'string' && !validTimestamp(at)) throw new TypeError('A valid recall timestamp is required.');
    const date = at === undefined ? new Date() : new Date(at);
    if (!Number.isFinite(date.getTime())) throw new TypeError('A valid recall date is required.');
    return date;
  }

  function emptyRecall() {
    return {
      version: VERSION, attempts: 0, correct: 0, half: 0, wrong: 0,
      successful_recalls: [], last_attempt_at: '', last_attempt_day: '',
      last_result: '', blocked_day: '', mastered_at: '',
    };
  }

  function normalizeRecall(raw) {
    if (!isObject(raw) || raw.version !== VERSION) return emptyRecall();
    const recall = {
      ...emptyRecall(),
      attempts: integer(raw.attempts), correct: integer(raw.correct),
      half: integer(raw.half), wrong: integer(raw.wrong),
      last_attempt_at: validTimestamp(raw.last_attempt_at) ? raw.last_attempt_at : '',
      last_attempt_day: validDay(raw.last_attempt_day) ? raw.last_attempt_day : '',
      last_result: ['correct', 'half', 'wrong'].includes(raw.last_result) ? raw.last_result : '',
      blocked_day: validDay(raw.blocked_day) ? raw.blocked_day : '',
    };
    const candidates = raw.successful_recalls;
    let valid = Array.isArray(candidates);
    const days = new Set();
    let previous = -Infinity;
    if (valid) {
      for (const entry of candidates) {
        if (!isObject(entry) || !validTimestamp(entry.at) || !validDay(entry.day)) { valid = false; break; }
        const time = Date.parse(entry.at);
        if (days.has(entry.day) || time - previous < MIN_GAP_MS) { valid = false; break; }
        days.add(entry.day);
        previous = time;
      }
      if (recall.correct < candidates.length || recall.attempts < recall.correct + recall.half + recall.wrong) valid = false;
      if (candidates.length && (!recall.last_attempt_at || previous > Date.parse(recall.last_attempt_at))) valid = false;
      if (candidates.length && ['half', 'wrong'].includes(recall.last_result)) valid = false;
      if (candidates.some(entry => entry?.day === recall.blocked_day)) valid = false;
    }
    if (valid) recall.successful_recalls = candidates.slice(-REQUIRED_DAYS).map(({ at, day }) => ({ at, day }));
    if (recall.successful_recalls.length === REQUIRED_DAYS) {
      const latest = recall.successful_recalls.at(-1).at;
      recall.mastered_at = validTimestamp(raw.mastered_at) && Date.parse(raw.mastered_at) <= Date.parse(latest)
        ? raw.mastered_at : latest;
    }
    return recall;
  }

  function normalizeWord(word) {
    if (!isObject(word)) throw new TypeError('A word record is required.');
    const oldStatus = word.status;
    word.recall = normalizeRecall(word.recall);
    if (word.recall.successful_recalls.length >= REQUIRED_DAYS) {
      word.status = 'mastered';
    } else {
      if (oldStatus === 'mastered' && !word.legacy_mastery) {
        word.legacy_mastery = {
          status: 'mastered', correct_streak: integer(word.correct_streak),
          last_seen: typeof word.last_seen === 'string' ? word.last_seen : '',
          reason: 'Earlier mastery did not include verified spaced typed recall.',
        };
      }
      word.status = oldStatus === 'learning' || oldStatus === 'mastered' || integer(word.times_seen) > 0 || word.recall.attempts > 0
        ? 'learning' : 'new';
    }
    return word;
  }

  function record(word, { result, at } = {}) {
    if (!['correct', 'half', 'wrong'].includes(result)) throw new TypeError('Recall result must be correct, half, or wrong.');
    const date = dateFor(at);
    normalizeWord(word);
    const recall = word.recall;
    const stamp = date.toISOString();
    const day = localDay(date);
    const time = date.getTime();
    const previousAttempt = recall.last_attempt_at ? Date.parse(recall.last_attempt_at) : -Infinity;
    const latestSuccess = recall.successful_recalls.at(-1);

    word.times_seen = integer(word.times_seen) + 1;
    word.last_seen = day;
    word.last_result = result;
    recall.attempts += 1;
    recall[result] += 1;
    if (result === 'correct') {
      word.correct_streak = integer(word.correct_streak) + 1;
      const gap = latestSuccess ? time - Date.parse(latestSuccess.at) : Infinity;
      if (time >= previousAttempt && day !== recall.blocked_day && !recall.successful_recalls.some(item => item.day === day) && gap >= MIN_GAP_MS) {
        recall.successful_recalls.push({ at: stamp, day });
        recall.successful_recalls = recall.successful_recalls.slice(-REQUIRED_DAYS);
      }
    } else {
      word.correct_streak = 0;
      const countKey = result === 'half' ? 'half_count' : 'wrong_count';
      word[countKey] = integer(word[countKey]) + 1;
      recall.successful_recalls = [];
      recall.mastered_at = '';
      recall.blocked_day = day;
    }
    // A clock moving backwards must not unlock another qualifying success.
    if (time >= previousAttempt) {
      recall.last_attempt_at = stamp;
      recall.last_attempt_day = day;
      recall.last_result = result;
    }
    word.status = recall.successful_recalls.length >= REQUIRED_DAYS ? 'mastered' : 'learning';
    if (word.status === 'mastered' && !recall.mastered_at) recall.mastered_at = stamp;
    return word;
  }

  function recordExposure(word, { source = 'other', at, result } = {}) {
    const date = dateFor(at);
    normalizeWord(word);
    const safeSource = SOURCES.has(source) ? source : 'other';
    const previous = isObject(word.exposure) ? word.exposure : {};
    const sources = {};
    for (const key of SOURCES) {
      const item = isObject(previous.sources?.[key]) ? previous.sources[key] : {};
      if (previous.sources?.[key]) sources[key] = {
        attempts: integer(item.attempts), correct: integer(item.correct), half: integer(item.half), wrong: integer(item.wrong),
        last_at: validTimestamp(item.last_at) ? item.last_at : '',
      };
    }
    const current = sources[safeSource] || { attempts: 0, correct: 0, half: 0, wrong: 0, last_at: '' };
    current.attempts += 1;
    if (['correct', 'half', 'wrong'].includes(result)) current[result] += 1;
    current.last_at = date.toISOString();
    sources[safeSource] = current;
    word.exposure = { version: VERSION, total: integer(previous.total) + 1, sources };
    word.times_seen = integer(word.times_seen) + 1;
    word.last_seen = localDay(date);
    if (word.status === 'new') word.status = 'learning';
    return word;
  }

  function reset(word) {
    normalizeWord(word);
    word.recall.successful_recalls = [];
    word.recall.mastered_at = '';
    word.status = 'learning';
    return word;
  }

  function count(word) { return normalizeRecall(word?.recall).successful_recalls.length; }
  function isMastered(word) { return count(word) >= REQUIRED_DAYS; }
  function explain(word) {
    const progress = count(word);
    return `${progress}/${REQUIRED_DAYS} verified recall days. Fully correct typed answers must be on different days, at least 24 hours apart.`;
  }
  return { normalizeWord, record, recordExposure, reset, count, isMastered, explain };
})();
if (typeof module !== 'undefined') module.exports = RecallEvidence;
