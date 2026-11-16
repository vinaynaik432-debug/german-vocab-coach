/* Inactive candidate policy. This module schedules reviews; it never awards mastery. */
const ReviewScheduler = (() => {
  const VERSION = 1;
  const SCHEDULE_VERSION = 'fixed-days-1-3-7-14-30-v1';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const INTERVAL_DAYS = Object.freeze([1, 3, 7, 14, 30]);
  const RESULTS = new Set(['correct', 'half', 'wrong']);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function validTimestamp(value) {
    if (typeof value !== 'string') return false;
    const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
    return Boolean(parts && validDay(parts[1]) && +parts[2] < 24 && +parts[3] < 60 && +parts[4] < 60
      && (parts[5] === 'Z' || (+parts[6] < 24 && +parts[7] < 60)) && Number.isFinite(Date.parse(value)));
  }

  function dateFor(at) {
    if (at !== undefined && !(at instanceof Date) && typeof at !== 'number' && typeof at !== 'string') {
      throw new TypeError('A valid review timestamp is required.');
    }
    if (typeof at === 'string' && !validTimestamp(at)) throw new TypeError('A valid review timestamp is required.');
    const date = at === undefined ? new Date() : new Date(at);
    if (!Number.isFinite(date.getTime()) || !validTimestamp(date.toISOString())) {
      throw new TypeError('A valid review timestamp is required.');
    }
    return date;
  }

  function localDay(date) {
    return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function readReview(raw) {
    if (!isObject(raw) || raw.version !== VERSION || raw.schedule_version !== SCHEDULE_VERSION) return null;
    if (!Number.isInteger(raw.stage) || raw.stage < 0 || raw.stage > INTERVAL_DAYS.length) return null;
    if (!validTimestamp(raw.due_at) || !validTimestamp(raw.last_attempt_at)
      || !RESULTS.has(raw.last_result) || typeof raw.last_assisted !== 'boolean') return null;
    if (raw.last_advanced_at !== '' && !validTimestamp(raw.last_advanced_at)) return null;
    if (raw.last_advanced_day !== '' && !validDay(raw.last_advanced_day)) return null;
    if (Boolean(raw.last_advanced_at) !== Boolean(raw.last_advanced_day)) return null;
    if (raw.stage > 0 && !raw.last_advanced_at) return null;
    if (raw.blocked_day !== '' && !validDay(raw.blocked_day)) return null;
    if (raw.blocked_until !== '' && !validTimestamp(raw.blocked_until)) return null;
    if (Boolean(raw.blocked_day) !== Boolean(raw.blocked_until)) return null;
    if (['half', 'wrong'].includes(raw.last_result) && raw.stage !== 0) return null;
    if (raw.last_advanced_at && (Date.parse(raw.last_advanced_at) > Date.parse(raw.last_attempt_at)
      || Date.parse(raw.due_at) < Date.parse(raw.last_advanced_at) + DAY_MS)) return null;
    if (raw.blocked_until && Date.parse(raw.due_at) < Date.parse(raw.blocked_until)) return null;
    const review = { ...raw };
    for (const key of ['due_at', 'last_attempt_at', 'last_advanced_at', 'blocked_until']) {
      if (review[key]) review[key] = new Date(review[key]).toISOString();
    }
    return review;
  }

  function normalizeWord(word) {
    if (!isObject(word)) throw new TypeError('A word record is required.');
    const review = readReview(word.review);
    // Preserve absent, malformed and future-version imports for explicit migration/recovery.
    if (review) word.review = review;
    return word;
  }

  function record(word, { result, at, assisted = false } = {}) {
    if (!isObject(word)) throw new TypeError('A word record is required.');
    if (!RESULTS.has(result)) throw new TypeError('Review result must be correct, half, or wrong.');
    if (typeof assisted !== 'boolean') throw new TypeError('Review assistance must be a boolean.');
    const date = dateFor(at);
    const time = date.getTime();
    const stamp = date.toISOString();
    const day = localDay(date);
    const previous = readReview(word.review);
    if (word.review != null && !previous) throw new TypeError('Unsupported or invalid review state; preserve it for recovery.');
    if (previous && time < Date.parse(previous.last_attempt_at)) {
      throw new RangeError('Review time precedes the latest attempt; check the clock before recording.');
    }
    if (previous && stamp === previous.last_attempt_at && result === previous.last_result && assisted === previous.last_assisted) {
      return word;
    }
    const nextDay = new Date(time + DAY_MS).toISOString();
    if (!validTimestamp(nextDay)) throw new RangeError('Review date is outside the supported range.');
    const review = previous || {
      version: VERSION, schedule_version: SCHEDULE_VERSION, stage: 0,
      due_at: stamp, last_attempt_at: stamp, last_result: result, last_assisted: assisted,
      last_advanced_at: '', last_advanced_day: '', blocked_day: '', blocked_until: '',
    };

    if (result !== 'correct' || assisted) {
      if (result !== 'correct') review.stage = 0;
      // Corrections within this local day keep the original short-review deadline.
      const sameBlockedDay = review.blocked_day === day;
      if (!sameBlockedDay) {
        review.blocked_day = day;
        review.blocked_until = nextDay;
        review.due_at = nextDay;
      }
    } else {
      const due = !previous || time >= Date.parse(review.due_at);
      const gap = !review.last_advanced_at || time - Date.parse(review.last_advanced_at) >= DAY_MS;
      const unblocked = day !== review.blocked_day && (!review.blocked_until || time >= Date.parse(review.blocked_until));
      if (due && gap && unblocked && day !== review.last_advanced_day) {
        review.stage = Math.min(INTERVAL_DAYS.length, review.stage + 1);
        const dueAt = new Date(time + INTERVAL_DAYS[review.stage - 1] * DAY_MS).toISOString();
        if (!validTimestamp(dueAt)) throw new RangeError('Review date is outside the supported range.');
        review.due_at = dueAt;
        review.last_advanced_at = stamp;
        review.last_advanced_day = day;
        review.blocked_day = '';
        review.blocked_until = '';
      }
    }
    review.last_attempt_at = stamp;
    review.last_result = result;
    review.last_assisted = assisted;
    word.review = review;
    return word;
  }

  function isDueAt(word, time) {
    const review = readReview(word?.review);
    return Boolean(review && time >= Date.parse(review.last_attempt_at)
      && time >= Date.parse(review.due_at) && (!review.blocked_until || time >= Date.parse(review.blocked_until)));
  }

  function isDue(word, at) { return isDueAt(word, dateFor(at).getTime()); }
  function hasSchedule(word) { return Boolean(readReview(word?.review)); }

  function dueWords(words, at) {
    if (!Array.isArray(words)) throw new TypeError('A list of words is required.');
    const time = dateFor(at).getTime();
    return words.map((word, index) => ({ word, index }))
      .filter(({ word }) => isDueAt(word, time))
      .sort((a, b) => Date.parse(a.word.review.due_at) - Date.parse(b.word.review.due_at) || a.index - b.index)
      .map(({ word }) => word);
  }

  return Object.freeze({ VERSION, SCHEDULE_VERSION, DAY_MS, INTERVAL_DAYS, normalizeWord, record, hasSchedule, isDue, dueWords });
})();
if (typeof module !== 'undefined') module.exports = ReviewScheduler;
