/* Candidate-only practice state. The caller must persist a candidate before displaying it as saved. */
const PracticeEngine = (() => {
  const VERSION = 1;
  const RESULTS = new Set(['correct', 'half', 'wrong']);
  const SOURCES = new Set(['typed', 'recognition', 'other']);
  const EXPOSURE_SOURCES = new Set(['choice', 'recognition', 'story', 'sentence', 'tense', 'context', 'other']);
  const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

  function fail(message, code = 'INVALID_PRACTICE_STATE') {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function cloneJson(value) {
    const ancestors = new Set();
    let nodes = 0;
    function copy(item, depth) {
      if (++nodes > 1000000 || depth > 64) fail('Practice data exceeds the structural limit.');
      if (item === null || typeof item === 'string' || typeof item === 'boolean') return item;
      if (typeof item === 'number') {
        if (!Number.isFinite(item) || Object.is(item, -0) || (Number.isInteger(item) && !Number.isSafeInteger(item))) {
          fail('Practice data contains a number that cannot be safely preserved.');
        }
        return item;
      }
      if (typeof item !== 'object' || ancestors.has(item)) fail('Practice data must contain acyclic JSON values.');
      const array = Array.isArray(item);
      const prototype = Object.getPrototypeOf(item);
      if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
        fail('Practice data contains an unsupported object prototype.');
      }
      const keys = Reflect.ownKeys(item);
      if (keys.some(key => typeof key !== 'string')) fail('Practice data contains symbol properties.');
      if (array && (keys.length !== item.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9]\d*)$/.test(key)))) {
        fail('Practice data contains a sparse or extended array.');
      }
      const result = array ? [] : {};
      ancestors.add(item);
      try {
        for (const key of keys) {
          if (array && key === 'length') continue;
          if (RESERVED_KEYS.has(key)) fail('Practice data contains a reserved property name.');
          const descriptor = Object.getOwnPropertyDescriptor(item, key);
          if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value') || !descriptor.enumerable) {
            fail('Practice data contains an accessor or non-enumerable property.');
          }
          if (array && (Number(key) >= item.length || !Number.isSafeInteger(Number(key)))) fail('Practice data contains an invalid array property.');
          result[key] = copy(descriptor.value, depth + 1);
        }
      } finally { ancestors.delete(item); }
      return result;
    }
    return copy(value, 0);
  }

  function requestOptions(value) {
    const options = cloneJson(value);
    if (!isRecord(options)) fail('Request details must be a plain object.', 'INVALID_REQUEST');
    return options;
  }

  function identifier(value, label) {
    if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a nonempty string.`, 'INVALID_REQUEST');
    return value;
  }

  function timestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
      fail('An explicit ISO timestamp is required.', 'INVALID_REQUEST');
    }
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    const check = new Date(0);
    check.setUTCFullYear(year, month - 1, day);
    const [hour, minute, second] = value.slice(11, 19).split(':').map(Number);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59 || !Number.isFinite(Date.parse(value))) {
      fail('The practice timestamp is invalid.', 'INVALID_REQUEST');
    }
    return new Date(value).toISOString();
  }

  function sourceName(source) {
    if (!SOURCES.has(source)) fail('Unknown practice source.', 'INVALID_REQUEST');
    return source;
  }

  function submissionRequest(options) {
    const { attemptId, wordId, answer, result, at, source = 'typed', assisted = false } = requestOptions(options);
    if (typeof answer !== 'string' || !RESULTS.has(result) || typeof assisted !== 'boolean') {
      fail('A raw answer, valid supplied grade and boolean assistance flag are required.', 'INVALID_REQUEST');
    }
    return {
      id: identifier(attemptId, 'Attempt ID'), word_id: identifier(wordId, 'Word ID'),
      answer, result, at: timestamp(at), source: sourceName(source), requested_assisted: assisted,
    };
  }

  function sameRequest(a, b) {
    return ['id', 'word_id', 'answer', 'result', 'at', 'source', 'requested_assisted'].every(key => a[key] === b[key]);
  }

  function sameJson(a, b) {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length
      && keys.every(key => Object.prototype.hasOwnProperty.call(b, key) && sameJson(a[key], b[key]));
  }

  function initialize(database) {
    const db = cloneJson(database);
    if (!isRecord(db) || !Array.isArray(db.words) || !Array.isArray(db.sessions)) fail('A database with words and sessions is required.');
    const wordIds = new Set();
    for (const word of db.words) {
      if (!isRecord(word)) fail('Invalid word record.');
      identifier(word.id, 'Word ID');
      if (wordIds.has(word.id)) fail('Word IDs must be unique.');
      wordIds.add(word.id);
    }
    if (db.practice === undefined) {
      db.practice = { version: VERSION, attempts: [], pending: null, paused: false };
      return db;
    }
    const practice = db.practice;
    if (!isRecord(practice) || practice.version !== VERSION) fail('Unsupported practice-state version.');
    if (!Array.isArray(practice.attempts) || typeof practice.paused !== 'boolean') fail('Invalid practice history.');
    const attempts = new Map();
    for (const attempt of practice.attempts) {
      if (!isRecord(attempt) || !isRecord(attempt.request)) fail('An attempt is missing its original submission.');
      const request = submissionRequest({
        attemptId: attempt.request.id, wordId: attempt.request.word_id, answer: attempt.request.answer,
        result: attempt.request.result, at: attempt.request.at, source: attempt.request.source,
        assisted: attempt.request.requested_assisted,
      });
      if (!sameRequest(request, attempt.request) || attempts.has(attempt.id)) fail('Invalid or duplicate attempt ID.');
      if (!['id', 'word_id', 'answer', 'result', 'at', 'source'].every(key => attempt[key] === request[key])) fail('Attempt and original submission disagree.');
      if (typeof attempt.assisted !== 'boolean' || typeof attempt.hint_used !== 'boolean' || typeof attempt.revealed !== 'boolean') fail('Invalid assistance evidence.');
      if (attempt.kind === 'first') {
        if (attempt.first_attempt_id !== attempt.id) fail('Invalid first-attempt reference.');
      } else if (attempt.kind === 'correction') {
        const first = attempts.get(attempt.first_attempt_id);
        if (!first || first.kind !== 'first' || first.word_id !== attempt.word_id || !attempt.assisted) fail('Invalid correction reference.');
      } else fail('Invalid attempt kind.');
      if ((attempt.hint_used || attempt.revealed || request.requested_assisted || attempt.source !== 'typed') && !attempt.assisted) fail('Assistance cannot be removed.');
      if (attempt.recall_eligible !== (!attempt.assisted && attempt.source === 'typed' && attempt.kind === 'first')) fail('Invalid recall eligibility.');
      attempts.set(attempt.id, attempt);
    }
    if (practice.pending !== null) {
      const pending = practice.pending;
      if (!isRecord(pending) || !wordIds.has(pending.word_id)) fail('The pending word is unavailable.');
      identifier(pending.attempt_id, 'Pending attempt ID');
      sourceName(pending.source);
      timestamp(pending.started_at);
      timestamp(pending.updated_at);
      if (typeof pending.draft !== 'string' || typeof pending.hint_used !== 'boolean' || typeof pending.revealed !== 'boolean' || !Array.isArray(pending.correction_ids)) fail('Invalid pending draft.');
      if (pending.first_attempt_id !== null) {
        const first = attempts.get(pending.first_attempt_id);
        if (!first || first.kind !== 'first' || first.id !== pending.attempt_id || first.word_id !== pending.word_id || first.source !== pending.source) fail('Invalid pending first attempt.');
      } else if (attempts.has(pending.attempt_id) || pending.correction_ids.length) fail('Pending draft conflicts with history.');
      if (!pending.correction_ids.every(id => attempts.get(id)?.kind === 'correction' && attempts.get(id).first_attempt_id === pending.first_attempt_id) || new Set(pending.correction_ids).size !== pending.correction_ids.length) fail('Invalid pending corrections.');
      if (pending.phase !== (pending.first_attempt_id ? 'feedback' : 'answering')) fail('Invalid pending phase.');
      if (Date.parse(pending.updated_at) < Date.parse(pending.started_at)) fail('Pending timestamps are out of order.');
    }
    return db;
  }

  function pendingItem(db, attemptId, at) {
    const pending = db.practice.pending;
    if (!pending || pending.attempt_id !== identifier(attemptId, 'Pending attempt ID')) fail('This is not the current practice item.', 'PENDING_ITEM_CONFLICT');
    if (db.practice.paused) fail('Resume practice before editing this item.', 'PRACTICE_PAUSED');
    if (at !== undefined && Date.parse(at) < Date.parse(pending.updated_at)) fail('This update is older than the pending item.', 'STALE_UPDATE');
    return pending;
  }

  function start(database, options = {}) {
    const db = initialize(database);
    const { wordId, attemptId, at, source = 'typed' } = requestOptions(options);
    const id = identifier(attemptId, 'Attempt ID');
    identifier(wordId, 'Word ID');
    const stamp = timestamp(at);
    sourceName(source);
    if (!db.words.some(word => word.id === wordId)) fail('The selected word does not exist.', 'INVALID_REQUEST');
    if (db.practice.pending) {
      const pending = db.practice.pending;
      if (pending.attempt_id === id && pending.word_id === wordId && pending.source === source && pending.started_at === stamp) return db;
      fail('Advance or explicitly discard the current item before starting another.', 'PENDING_ITEM_CONFLICT');
    }
    if (db.practice.attempts.some(attempt => attempt.id === id)) fail('This attempt ID has already been used.', 'ATTEMPT_CONFLICT');
    if (db.practice.paused) fail('Resume practice before starting another item.', 'PRACTICE_PAUSED');
    db.practice.pending = {
      attempt_id: id, word_id: wordId, source, started_at: stamp, updated_at: stamp,
      draft: '', hint_used: false, revealed: false, first_attempt_id: null, correction_ids: [], phase: 'answering',
    };
    return db;
  }

  function saveDraft(database, options = {}) {
    const db = initialize(database);
    const { attemptId, answer, at } = requestOptions(options);
    if (typeof answer !== 'string') fail('The draft must be a string.', 'INVALID_REQUEST');
    const stamp = timestamp(at);
    const pending = pendingItem(db, attemptId, stamp);
    pending.draft = answer;
    pending.updated_at = stamp;
    return db;
  }

  function markAssistance(database, options = {}, kind) {
    const db = initialize(database);
    const { attemptId, at } = requestOptions(options);
    const stamp = timestamp(at);
    const pending = pendingItem(db, attemptId, stamp);
    pending[kind] = true;
    pending.updated_at = stamp;
    return db;
  }

  function advance(database, options = {}) {
    const db = initialize(database);
    const { attemptId, discard = false } = requestOptions(options);
    const pending = db.practice.pending;
    if (typeof discard !== 'boolean') fail('Discard must be a boolean.', 'INVALID_REQUEST');
    if (!pending || pending.attempt_id !== identifier(attemptId, 'Pending attempt ID')) fail('This is not the current item.', 'PENDING_ITEM_CONFLICT');
    if (!pending.first_attempt_id && !discard) fail('This item has an unsubmitted draft. Discard must be explicit.', 'UNFINISHED_ITEM');
    db.practice.pending = null;
    return db;
  }

  function setPaused(database, paused) {
    const db = initialize(database);
    db.practice.paused = paused;
    return db;
  }

  function create({ recallEvidence, reviewScheduler } = {}) {
    if (!recallEvidence || typeof recallEvidence.record !== 'function' || typeof recallEvidence.recordExposure !== 'function' || typeof recallEvidence.normalizeWord !== 'function') fail('RecallEvidence with non-destructive validation support must be injected.', 'MISSING_DEPENDENCY');
    if (!reviewScheduler || typeof reviewScheduler.record !== 'function' || typeof reviewScheduler.normalizeWord !== 'function') fail('ReviewScheduler must be injected.', 'MISSING_DEPENDENCY');

    function assertRecallReady(word) {
      // No recall field is the legacy/new-word case. Existing evidence must not
      // be silently repaired or downgraded by the legacy normalizer on submit.
      if (word.recall === undefined) return;
      const raw = word.recall;
      if (!isRecord(raw) || raw.version !== 1) {
        fail('Unsupported recall state; preserve it for recovery before recording.', 'UNSUPPORTED_RECALL_STATE');
      }
      const counters = ['attempts', 'correct', 'half', 'wrong'];
      if (counters.some(key => !Number.isSafeInteger(raw[key]) || raw[key] < 0)
        || raw.attempts !== raw.correct + raw.half + raw.wrong) {
        fail('Invalid recall counters; preserve the evidence for recovery.', 'INVALID_RECALL_STATE');
      }
      const probe = cloneJson(word);
      recallEvidence.normalizeWord(probe);
      if (!sameJson(raw, probe.recall)) {
        fail('Recall normalization would change existing evidence; preserve it for recovery.', 'INVALID_RECALL_STATE');
      }
    }

    function assertExposureReady(word) {
      if (word.exposure === undefined) return;
      const raw = word.exposure;
      if (!isRecord(raw) || raw.version !== 1) {
        fail('Unsupported exposure state; preserve it for recovery before recording.', 'UNSUPPORTED_EXPOSURE_STATE');
      }
      const invalid = () => fail('Invalid or unsupported exposure evidence; preserve it for recovery.', 'INVALID_EXPOSURE_STATE');
      if (!Number.isSafeInteger(raw.total) || raw.total < 0 || !isRecord(raw.sources)
        || Object.keys(raw).some(key => !['version', 'total', 'sources'].includes(key))) invalid();
      let total = 0;
      for (const [source, evidence] of Object.entries(raw.sources)) {
        if (!EXPOSURE_SOURCES.has(source) || !isRecord(evidence)
          || Object.keys(evidence).some(key => !['attempts', 'correct', 'half', 'wrong', 'last_at'].includes(key))) invalid();
        if (['attempts', 'correct', 'half', 'wrong'].some(key => !Number.isSafeInteger(evidence[key]) || evidence[key] < 0)
          || evidence.correct + evidence.half + evidence.wrong > evidence.attempts) invalid();
        // Exposure can be ungraded, so the outcome counters need not sum to all
        // attempts. The timestamp still has to be preserved rather than reset.
        if (evidence.last_at === '' && evidence.attempts === 0) {
          // An empty, pre-initialized source is safe to retain.
        } else {
          try { timestamp(evidence.last_at); } catch { invalid(); }
        }
        total += evidence.attempts;
      }
      if (!Number.isSafeInteger(total) || total !== raw.total) invalid();
    }

    function inspectEvidence(word, { at } = {}) {
      const stamp = timestamp(at), time = Date.parse(stamp);
      try {
        const candidate = cloneJson(word);
        if (!isRecord(candidate)) fail('Invalid word evidence.');
        assertRecallReady(candidate);
        // A new prompt can subsequently use a hint or reveal. Exclude evidence
        // that is unsafe for either path, even if unaided recall alone would
        // leave an unsupported exposure object unchanged.
        assertExposureReady(candidate);
        if (candidate.times_seen === Number.MAX_SAFE_INTEGER || candidate.recall?.attempts === Number.MAX_SAFE_INTEGER
          || candidate.exposure?.total === Number.MAX_SAFE_INTEGER) {
          fail('Evidence counters cannot safely accept another attempt.', 'EVIDENCE_COUNTER_LIMIT');
        }
        const recorded = [candidate.recall?.last_attempt_at, candidate.recall?.mastered_at,
          ...(candidate.recall?.successful_recalls || []).map(item => item.at),
          ...Object.values(candidate.exposure?.sources || {}).map(item => item.last_at)];
        if (recorded.some(value => value && Date.parse(value) > time)) {
          fail('Evidence is dated after the current time.', 'FUTURE_EVIDENCE');
        }
        if (candidate.last_seen && /^\d{4}-\d{2}-\d{2}$/.test(candidate.last_seen)) {
          const date = new Date(stamp);
          const today = `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          if (candidate.last_seen > today) fail('Legacy practice is dated after today.', 'FUTURE_EVIDENCE');
        } else if (candidate.last_seen && Date.parse(candidate.last_seen) > time) {
          fail('Legacy practice is dated after the current time.', 'FUTURE_EVIDENCE');
        }
        return { supported: true, reason: null };
      } catch (error) { return { supported: false, reason: error.code || 'INVALID_WORD_EVIDENCE' }; }
    }

    function submitAnswer(database, options) {
      const db = initialize(database);
      const request = submissionRequest(options);
      const existing = db.practice.attempts.find(attempt => attempt.id === request.id);
      if (existing) {
        if (!sameRequest(existing.request, request)) fail('This attempt ID was submitted with different details.', 'ATTEMPT_CONFLICT');
        return db;
      }
      const pending = db.practice.pending;
      if (!pending) fail('There is no active item to submit.', 'PENDING_ITEM_CONFLICT');
      pendingItem(db, pending.attempt_id, request.at);
      if (pending.word_id !== request.word_id || pending.source !== request.source) fail('Submission does not match the current word and source.', 'PENDING_ITEM_CONFLICT');
      const correction = pending.first_attempt_id !== null;
      if (!correction && request.id !== pending.attempt_id) fail('The first response must use the persisted pending attempt ID.', 'ATTEMPT_CONFLICT');
      const assisted = request.requested_assisted || pending.hint_used || pending.revealed || correction || request.source !== 'typed';
      const attempt = {
        id: request.id, word_id: request.word_id, at: request.at, result: request.result, answer: request.answer,
        assisted, source: request.source, kind: correction ? 'correction' : 'first',
        first_attempt_id: pending.first_attempt_id || request.id,
        hint_used: pending.hint_used, revealed: pending.revealed,
        recall_eligible: !assisted, request,
      };
      const word = db.words.find(item => item.id === request.word_id);
      assertRecallReady(word);
      if (attempt.recall_eligible) recallEvidence.record(word, { result: request.result, at: request.at });
      else {
        assertExposureReady(word);
        recallEvidence.recordExposure(word, { source: 'other', result: request.result, at: request.at });
      }
      reviewScheduler.record(word, { result: request.result, at: request.at, assisted });
      db.practice.attempts.push(attempt);
      if (correction) pending.correction_ids.push(request.id);
      else pending.first_attempt_id = request.id;
      pending.draft = request.answer;
      pending.updated_at = request.at;
      pending.phase = 'feedback';
      return db;
    }

    return Object.freeze({
      initialize, start, saveDraft, submitAnswer, advance, inspectEvidence,
      markHint: (db, options) => markAssistance(db, options, 'hint_used'),
      reveal: (db, options) => markAssistance(db, options, 'revealed'),
      pause: db => setPaused(db, true), resume: db => setPaused(db, false),
    });
  }

  return Object.freeze({ VERSION, create, initialize });
})();
if (typeof module !== 'undefined') module.exports = PracticeEngine;
