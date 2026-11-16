/* Read-only queue, grading and progress helpers. No persistence, random selection or UI. */
const CoachLearning = (() => {
  const RESULTS = new Set(['correct', 'half', 'wrong']);
  const FOCUSES = new Set(['marketing', 'everyday', 'all']);

  function normalizeAnswer(value) {
    return String(value ?? '').toLowerCase().normalize('NFKD')
      .replace(/\u0308/g, 'e').replace(/\u0301|\u0300|\u0302/g, '').replace(/ß/g, 'ss')
      .replace(/[.,!?;:()[\]{}"']/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function splitArticle(value) {
    const trimmed = String(value ?? '').trim();
    const match = trimmed.match(/^(der|die|das|den|dem|des|eine|ein|einen|einem|einer)\s+(.+)$/i);
    return match ? { article: match[1].toLowerCase(), lemma: match[2] } : { article: '', lemma: trimmed };
  }
  function guessPartOfSpeech(en, de) {
    const lowerEn = String(en ?? '').toLowerCase(), lowerDe = String(de ?? '').toLowerCase();
    if (/^(der|die|das)\s+/.test(lowerDe)) return 'noun';
    if (lowerEn.startsWith('to ') || lowerDe.includes('sich ') || lowerDe.endsWith('en')) return 'verb';
    if (lowerEn.includes(' ') || lowerDe.includes(' ')) return 'phrase';
    return 'adjective';
  }
  function levenshtein(a, b) {
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      const next = [i];
      for (let j = 1; j <= b.length; j += 1) next[j] = Math.min(previous[j] + 1, next[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = next;
    }
    return previous[b.length];
  }
  function gradeSingleAnswer(answer, word) {
    const expected = word.word_de.trim();
    const normalizedAnswer = normalizeAnswer(answer), normalizedExpected = normalizeAnswer(expected);
    if (!normalizedAnswer) return { result: 'wrong', comment: 'blank answer' };
    if (normalizedAnswer === normalizedExpected) return { result: 'correct', comment: answer.includes('ss') && expected.includes('ß') ? 'ss accepted for ß' : '' };
    const expectedParts = splitArticle(expected), answerParts = splitArticle(answer);
    const isNoun = word.part_of_speech === 'noun' || guessPartOfSpeech(word.word_en, word.word_de) === 'noun' || expectedParts.article;
    if (isNoun) {
      if (expectedParts.lemma && normalizeAnswer(answerParts.lemma) === normalizeAnswer(expectedParts.lemma)) return { result: 'half', comment: 'article slip' };
      if (levenshtein(normalizeAnswer(answerParts.lemma || answer), normalizeAnswer(expectedParts.lemma)) <= 2) return { result: 'half', comment: 'spelling slip' };
    }
    if (levenshtein(normalizedAnswer, normalizedExpected) <= Math.max(1, Math.floor(normalizedExpected.length * 0.16))) return { result: 'half', comment: 'spelling slip' };
    return { result: 'wrong', comment: '' };
  }

  function create({ learningPriorities, reviewScheduler, recallEvidence, practiceEngine, curriculum = { words: [] }, frequencyData } = {}) {
    if (!learningPriorities || typeof learningPriorities.compareNew !== 'function') throw new TypeError('LearningPriorities is required.');
    if (!reviewScheduler || typeof reviewScheduler.isDue !== 'function' || typeof reviewScheduler.hasSchedule !== 'function') throw new TypeError('ReviewScheduler with hasSchedule is required.');
    if (!recallEvidence || typeof recallEvidence.isMastered !== 'function') throw new TypeError('RecallEvidence is required.');
    // Share the owning engine's non-destructive checks rather than independently
    // normalizing imported evidence into a different shape. The browser entry
    // loads PracticeEngine first; CommonJS uses the same local module.
    const engineModule = practiceEngine || (typeof PracticeEngine !== 'undefined' ? PracticeEngine
      : typeof module !== 'undefined' && module.exports && typeof require === 'function' ? require('./practice-engine.js') : null);
    if (!engineModule || typeof engineModule.create !== 'function') throw new TypeError('PracticeEngine evidence validation is required.');
    const inspector = engineModule.create({ recallEvidence, reviewScheduler });
    if (typeof inspector.inspectEvidence !== 'function') throw new TypeError('PracticeEngine must support readonly evidence inspection.');
    const metadata = new Map((curriculum.words || []).map(word => [word.curriculum_id, word]));
    const entryFor = word => metadata.get(word.curriculum_id);
    const isMarketingWord = word => entryFor(word)?.domain === 'marketing'
      || (!entryFor(word) && (word.domain === 'marketing' || word.topic === 'marketing'));

    function getAcceptedAnswers(word) {
      let imported = word.accepted_answers;
      if (typeof imported === 'string') { try { imported = JSON.parse(imported); } catch { imported = []; } }
      return [...new Set([...(Array.isArray(imported) ? imported.filter(value => typeof value === 'string') : []), ...(entryFor(word)?.accepted_answers || [])])];
    }
    function gradeAnswer(answer, word) {
      if (typeof answer !== 'string' || !word || typeof word.word_de !== 'string' || !word.word_de.trim()) throw new TypeError('A raw answer and a word with German text are required.');
      const grades = [word.word_de, ...getAcceptedAnswers(word)].map(expected => gradeSingleAnswer(answer, { ...word, word_de: expected }));
      return grades.find(grade => grade.result === 'correct') || grades.find(grade => grade.result === 'half') || grades[0];
    }
    function scopeWords(words, { focus = 'all', topic = 'all', wordIds = null } = {}) {
      if (!Array.isArray(words) || !FOCUSES.has(focus)) throw new TypeError('A word list and a supported focus are required.');
      if (typeof topic !== 'string' || !topic) throw new TypeError('Topic must be a nonempty string.');
      if (wordIds !== null && (!Array.isArray(wordIds) || wordIds.some(id => typeof id !== 'string'))) throw new TypeError('Selected word IDs must be an array or null.');
      const selected = wordIds === null ? null : new Set(wordIds);
      return words.filter(word => {
        if (selected && !selected.has(word.id)) return false;
        const marketing = isMarketingWord(word);
        if (focus === 'marketing' && !marketing) return false;
        if (focus === 'everyday' && marketing) return false;
        const entry = entryFor(word);
        return topic === 'all' || word.topic === topic || entry?.topic === topic || entry?.category === topic || (!entry && word.category === topic);
      });
    }
    function instant(at) {
      if (at === undefined) throw new TypeError('An explicit time is required.');
      reviewScheduler.isDue({}, at); // Reuse scheduler timestamp validation without modifying data.
      return new Date(at).getTime();
    }
    function previouslyPractised(word) {
      return ['learning', 'mastered'].includes(word.status) || Number(word.times_seen || 0) > 0
        || Number(word.recall?.attempts || 0) > 0 || Number(word.exposure?.total || 0) > 0
        || Number(word.wrong_count || 0) > 0 || Number(word.half_count || 0) > 0;
    }
    function reviewKind(word, at) {
      if (!inspector.inspectEvidence(word, { at: new Date(at).toISOString() }).supported) return 'blocked';
      if (word.review == null) return previouslyPractised(word) ? 'unscheduled' : 'new';
      if (!reviewScheduler.hasSchedule(word)) return 'blocked';
      if (Date.parse(word.review.last_attempt_at) > new Date(at).getTime()) return 'blocked';
      return reviewScheduler.isDue(word, at) ? 'due' : 'later';
    }
    function scopeState(db, options) {
      if (!db || !Array.isArray(db.words)) throw new TypeError('A database with words is required.');
      const now = instant(options.at);
      const words = scopeWords(db.words, options);
      const groups = { due: [], unscheduled: [], new: [], later: [], blocked: [] };
      for (const word of words) groups[reviewKind(word, options.at)].push(word);
      return { now, words, groups };
    }
    function isVerified(word, { at } = {}) {
      instant(at);
      return reviewKind(word, at) !== 'blocked' && recallEvidence.isMastered(word);
    }
    function lastPractised(word) {
      const times = [word.last_seen, word.recall?.last_attempt_at, ...Object.values(word.exposure?.sources || {}).map(source => source.last_at)]
        .map(value => Date.parse(value)).filter(Number.isFinite);
      return times.length ? Math.max(...times) : -Infinity;
    }
    function queue(db, options = {}) {
      const { focus = 'all', limit = 20, allowRepeat = false } = options;
      if (!Number.isInteger(limit) || limit < 0 || typeof allowRepeat !== 'boolean') throw new TypeError('Queue limit and repeat option are invalid.');
      const { words, groups } = scopeState(db, { ...options, focus });
      const recentIds = options.recentIds === undefined ? (db.practice?.attempts || []).slice(-5).map(attempt => attempt.word_id) : options.recentIds;
      if (!Array.isArray(recentIds) || recentIds.some(id => typeof id !== 'string')) throw new TypeError('Recent IDs must be an array.');
      const recent = new Set(recentIds);
      const priorityFocus = focus === 'everyday' || (focus === 'all' && db.preferences?.learningFocus === 'everyday') ? 'everyday' : 'marketing';
      const compareNew = (a, b) => learningPriorities.compareNew(a, b, { focus: priorityFocus, data: frequencyData, metadata });
      const eligible = list => list.filter(word => allowRepeat || !recent.has(word.id));
      const due = eligible(groups.due).sort((a, b) => Date.parse(a.review.due_at) - Date.parse(b.review.due_at) || compareNew(a, b));
      const legacy = eligible(groups.unscheduled).sort((a, b) => lastPractised(a) - lastPractised(b) || compareNew(a, b));
      const unseen = eligible(groups.new).sort(compareNew);
      const items = due.map(word => ({ word, reason: 'due', dueAt: word.review.due_at }));
      // Alternate after due reviews: neither unverified old learning nor new work
      // vocabulary can indefinitely crowd the other out.
      for (let i = 0; i < Math.max(legacy.length, unseen.length); i += 1) {
        if (legacy[i]) items.push({ word: legacy[i], reason: 'unscheduled-review', dueAt: null });
        if (unseen[i]) items.push({ word: unseen[i], reason: isMarketingWord(unseen[i]) ? 'new-marketing' : 'new-frequency', dueAt: null });
      }
      if (allowRepeat) {
        for (const word of [...groups.later].sort((a, b) => Date.parse(a.review.due_at) - Date.parse(b.review.due_at) || compareNew(a, b))) {
          items.push({ word, reason: 'voluntary-review', dueAt: word.review.due_at });
        }
      }
      const recentExcluded = allowRepeat ? 0 : [...groups.due, ...groups.unscheduled, ...groups.new].filter(word => recent.has(word.id)).length;
      const future = groups.later.map(word => word.review.due_at).sort((a, b) => Date.parse(a) - Date.parse(b));
      const counts = { total: words.length, due: groups.due.length, unscheduled: groups.unscheduled.length, new: groups.new.length, scheduledLater: groups.later.length, blocked: groups.blocked.length, recentExcluded, available: items.length };
      return {
        items: items.slice(0, limit), counts, nextDueAt: future[0] || null, complete: items.length === 0,
        emptyReason: items.length ? null : !words.length ? 'empty-scope' : recentExcluded ? 'recently-practised' : groups.later.length ? 'nothing-due' : groups.blocked.length ? 'review-needs-recovery' : 'no-eligible-words',
      };
    }
    function progress(db, options = {}) {
      const { now, words, groups } = scopeState(db, options);
      const since = options.since === undefined ? -Infinity : instant(options.since);
      if (since > now) throw new TypeError('Progress start time is later than its end time.');
      const ids = new Set(words.map(word => word.id));
      const makeStats = () => ({ total: 0, correct: 0, half: 0, wrong: 0, accuracyPercent: null, wordCount: 0 });
      const stats = { firstUnaided: makeStats(), assisted: makeStats(), corrections: makeStats() };
      const wordSets = { firstUnaided: new Set(), assisted: new Set(), corrections: new Set() };
      const seenAttempts = new Set();
      let excludedAttempts = 0;
      for (const attempt of db.practice?.attempts || []) {
        if (!ids.has(attempt.word_id)) continue;
        let time;
        try { time = instant(attempt.at); } catch { time = NaN; }
        if (Number.isFinite(time) && (time < since || time > now)) continue;
        if (!Number.isFinite(time) || !attempt.id || seenAttempts.has(attempt.id) || !RESULTS.has(attempt.result)) { excludedAttempts += 1; continue; }
        seenAttempts.add(attempt.id);
        const group = attempt.kind === 'correction' && attempt.assisted === true ? 'corrections'
          : attempt.kind === 'first' && attempt.assisted === true ? 'assisted'
          : attempt.kind === 'first' && attempt.first_attempt_id === attempt.id && attempt.source === 'typed'
            && attempt.assisted === false && attempt.hint_used === false && attempt.revealed === false && attempt.recall_eligible === true ? 'firstUnaided' : null;
        if (!group) { excludedAttempts += 1; continue; }
        stats[group].total += 1;
        stats[group][attempt.result] += 1;
        wordSets[group].add(attempt.word_id);
      }
      for (const [group, summary] of Object.entries(stats)) {
        summary.wordCount = wordSets[group].size;
        summary.accuracyPercent = summary.total ? Math.round(summary.correct / summary.total * 100) : null;
      }
      const blocked = new Set(groups.blocked);
      const verified = words.filter(word => !blocked.has(word) && recallEvidence.isMastered(word)).length;
      return {
        ...stats, excludedAttempts, wordCount: words.length, verifiedCount: verified,
        verifiedPercent: words.length ? Math.round(verified / words.length * 100) : 0,
        practisedCount: words.filter(previouslyPractised).length,
        dueCount: groups.due.length, newCount: groups.new.length, unscheduledCount: groups.unscheduled.length,
        scheduledLaterCount: groups.later.length, blockedReviewCount: groups.blocked.length, blockedEvidenceCount: groups.blocked.length,
        legacySessionCount: (db.sessions || []).filter(session => !session.skipped).length,
      };
    }
    return Object.freeze({ scopeWords, queue, progress, isVerified, gradeAnswer, getAcceptedAnswers, isMarketingWord, entryFor,
      frequency: word => learningPriorities.frequency(word, frequencyData), frequencyBand: word => learningPriorities.band(word, frequencyData),
      normalizeAnswer, splitArticle, guessPartOfSpeech, levenshtein });
  }
  return Object.freeze({ create, normalizeAnswer, splitArticle, guessPartOfSpeech, levenshtein });
})();
if (typeof module !== 'undefined') module.exports = CoachLearning;
