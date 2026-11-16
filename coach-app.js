/* Continuous, local-first UI. All durable changes pass through CoachStore. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now = () => new Date().toISOString();
  const day = date => new Date(date).toLocaleDateString('en-CA');
  const uid = () => crypto.randomUUID();
  const stamp = date => date ? new Date(date).toLocaleDateString(undefined, {day:'numeric', month:'short',year:'numeric'}) : 'Not scheduled';
  const engine = PracticeEngine.create({recallEvidence:RecallEvidence, reviewScheduler:ReviewScheduler});
  const data = PracticeData.create({backupData:BackupData, practiceEngine:PracticeEngine, reviewScheduler:ReviewScheduler});
  const learning = CoachLearning.create({learningPriorities:LearningPriorities, reviewScheduler:ReviewScheduler, recallEvidence:RecallEvidence, curriculum:VOCAB_CURRICULUM, frequencyData:WORD_FREQUENCIES});
  let store, db, activities, page = 'today', uiBusy = false, writing = 0, writeQueue = Promise.resolve(), draftTimer, draftDirty = false, practiceFocusPending = false;
  let wordPage = 0, filteredWords = [], selectedWords = new Set(), restorePreview = null;
  const categories = VOCAB_CURRICULUM.categories;
  const notify = message => { $('#global-status').textContent = message; $('#global-status').hidden = !message; };
  function download(text, name, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([text], {type})), a = document.createElement('a');
    a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function showError(error) { notify(error?.message || 'That change could not be completed. Your saved progress is unchanged.'); }
  function syncState() {
    const state = store.getState(); db = state.database;
    const issue = !state.writable;
    $('#recovery-panel').hidden = !issue;
    $('#retry-save').hidden = !state.pending;
    $('#download-pending').hidden = !state.pending?.database;
    $('#recovery-title').textContent = state.pending ? 'Your latest change still needs saving.' : 'Your progress needs attention.';
    $('#recovery-copy').textContent = state.reason === 'web-locks-unavailable'
      ? 'This browser cannot protect simultaneous saves. You can read and export your data. Open the app in a current browser over localhost or HTTPS to practise.'
      : state.reason === 'legacy-data-changed' ? 'An older app tab changed its progress. Close that tab, download a recovery copy, then review which full backup to restore in Settings. Both versions are preserved.'
      : state.status === 'conflict' ? 'Another tab changed this browser’s data. Download a recovery copy before reloading, or review a full backup in Settings. An unsaved answer will not be replaced by another answer.'
      : state.status === 'invalid' ? 'Saved data could not be safely opened. Download a recovery copy, then restore a valid full backup in Settings. Nothing has been reset.'
      : 'This change is kept for an exact retry. Download the unsaved full backup or a recovery copy before closing. Further practice is paused until saving succeeds.';
    $('#save-status').textContent = draftDirty || writing ? 'Saving…' : state.saved ? 'Saved on this device' : 'Not fully saved — see recovery options above';
    $$('#practice-area input, #practice-area button').forEach(el => { el.disabled = issue || uiBusy; });
    $('#stop-practice').disabled = issue || uiBusy || !db?.practice?.pending || db?.practice?.paused;
    $('#practice-focus').disabled = issue || uiBusy;
    $('#export-backup').disabled = !db;
    if (db) applyTheme();
    return state;
  }
  function write(mutator) {
    writing++;
    $('#save-status').textContent = 'Saving…';
    const task = writeQueue.then(async () => {
      const state = await store.update(mutator); syncState();
      if (!state.saved && state.message) notify(state.message);
      return state.saved === true;
    }).catch(error => { syncState(); showError(error); return false; }).finally(() => { writing--; syncState(); });
    writeQueue = task.then(() => undefined); return task;
  }
  async function action(callback) {
    if (uiBusy) return;
    uiBusy = true; syncState();
    try { await callback(); } catch (error) { showError(error); } finally {
      uiBusy = false; syncState();
      if (practiceFocusPending && page === 'today' && store.getState().writable) practiceFocusTarget()?.focus({preventScroll:true});
      practiceFocusPending = false;
    }
  }
  function practiceFocusTarget() { return $('#practice-answer') || $('#practice-area .choice-option') || $('#practice-area .primary'); }
  function applyTheme() {
    const theme = db?.preferences?.theme === 'studio' ? 'studio' : 'cobalt';
    document.body.dataset.theme = theme;
    $('meta[name="theme-color"]').content = theme === 'studio' ? '#f16b3c' : '#2454db';
    $$('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  }
  function currentWord() { return db?.words.find(w => w.id === db.practice?.pending?.word_id); }
  function queue(database, extra = {}) {
    const scope = database.practice.scope || {focus:database.preferences.learningFocus || 'marketing',wordIds:null};
    return learning.queue(database, {at:now(),focus:scope.focus || 'all',wordIds:scope.wordIds ?? null,topic:scope.topic || 'all',
      recentIds:database.practice.seen_day === day(now()) ? database.practice.seen_ids || [] : [],allowRepeat:database.practice.extra === true,...extra});
  }
  function startCandidate(database) {
    let next = database;
    if (next.practice.format?.size && next.practice.format.completed >= next.practice.format.size) return next;
    if (next.practice.seen_day !== day(now())) { next.practice.seen_day = day(now()); next.practice.seen_ids = []; }
    const item = queue(next).items[0];
    if (item) {
      next = engine.start(next, {wordId:item.word.id,attemptId:uid(),at:now(),source:next.practice.format?.mode === 'recognition' ? 'recognition' : 'typed'});
      next.practice.selection_reason = item.reason;
    }
    return next;
  }
  function draftValue() { return $('#practice-answer')?.value ?? db?.practice?.pending?.draft ?? ''; }
  async function flushDraft() {
    clearTimeout(draftTimer); await writeQueue;
    if (!draftDirty) return !store.getState().pending;
    if (!db?.practice?.pending || !store.getState().writable) return false;
    const answer = draftValue(), attemptId = db.practice.pending.attempt_id;
    const ok = await write(d => engine.saveDraft(d, {attemptId,answer,at:now()}));
    if (ok && draftValue() === answer) draftDirty = false;
    syncState(); return ok && !draftDirty;
  }
  function startDraftWatch() {
    const input = $('#practice-answer');
    if (!input) return;
    input.addEventListener('input', () => { draftDirty = true; $('#save-status').textContent = 'Saving…'; clearTimeout(draftTimer); draftTimer = setTimeout(flushDraft, 400); });
  }
  function reasonLabel(reason) {
    return ({due:'Due for review','unscheduled-review':'From your earlier practice','new-marketing':'Useful for your marketing work','new-frequency':'Common everyday German','voluntary-review':'Extra practice · not due yet'})[reason] || 'Your chosen words';
  }
  function practiceShell(word, body) {
    const entry = learning.entryFor(word), category = categories[entry?.category] || (learning.isMarketingWord(word) ? 'Marketing' : 'Everyday German');
    return `<article class="practice-card"><section class="prompt-pane"><span class="sun-mark" aria-hidden="true">✦</span><p class="eyebrow">${esc(category)} · ${esc(word.difficulty || 'German')}</p><p class="prompt-context">How would you say…</p><h2 class="word-prompt">${esc(word.word_en)}</h2><p class="queue-reason">${esc(reasonLabel(db.practice.selection_reason))}</p></section><section class="answer-pane">${body}</section></article>`;
  }
  function renderPractice(focus = false) {
    if (!db) { $('#practice-area').innerHTML = '<section class="panel"><h2>Let’s recover your saved progress.</h2><p>Open Settings to export a recovery copy or review a full backup.</p><button data-page="settings" class="primary">Open recovery options</button></section>'; return; }
    const p = db.practice, pending = p.pending, word = currentWord();
    $('#greeting').textContent = db.profile?.name ? `Hallo, ${db.profile.name}.` : 'Hallo.';
    $('#practice-focus').value = p.scope?.focus || db.preferences.learningFocus || 'marketing';
    const scoped = Array.isArray(p.scope?.wordIds);
    $('#practice-scope').hidden = !scoped && !p.format?.size && !db.preferences.habitCue;
    $('#practice-scope').innerHTML = scoped ? `<span>Practising ${p.scope.wordIds.length} selected ${p.scope.wordIds.length === 1 ? 'word' : 'words'}.</span> <button data-action="clear-scope" class="text-button">Return to my focus</button>`
      : p.format?.size ? `<span>Optional ${p.format.size}-answer practice · ${p.format.completed || 0} answered. You can stop at any time.</span>`
      : db.preferences.habitCue ? '<span>One useful answer is enough to start. Come back when it suits your day.</span>' : '';
    if (p.paused) {
      $('#practice-area').innerHTML = `<section class="paused-state"><span class="sun-mark" aria-hidden="true">✦</span><p class="eyebrow">A good place to pause</p><h2>Your place is saved.</h2><p>Come back for one answer or a little longer. ${pending ? 'Your current word and draft are waiting.' : 'There is no round to finish.'}</p><button data-action="resume" class="primary">Continue when you’re ready</button></section>`;
    } else if (!pending || !word) {
      const q = queue(db);
      const limited = p.format?.size && p.format.completed >= p.format.size;
      $('#practice-area').innerHTML = `<section class="empty-state"><span class="sun-mark" aria-hidden="true">✦</span><p class="eyebrow">${limited ? 'Optional practice complete' : 'A natural stopping point'}</p><h2>${limited ? 'Nice work. You can leave it here.' : q.emptyReason === 'empty-scope' ? 'No words in this selection.' : 'Nothing ready in this selection.'}</h2><p>${q.nextDueAt ? `The next scheduled review is ${esc(stamp(q.nextDueAt))}. ` : ''}${q.counts.blocked ? `${q.counts.blocked} words have saved learning evidence that needs attention. ` : ''}Your saved answers stay with you.</p><div class="button-row">${q.counts.total > q.counts.blocked ? '<button data-action="extra" class="primary">Keep practising</button>' : ''}<button data-page="words" class="secondary">Choose words</button></div></section>`;
    } else if (pending.phase === 'feedback' && !p.correction) renderFeedback(word);
    else {
      const correction = Boolean(p.correction), recognition = pending.source === 'recognition' && !correction;
      let form;
      if (recognition) {
        const options = recognitionOptions(word);
        form = `<p class="eyebrow">Recognition practice</p><h2>Choose the German.</h2><p class="muted">This is supported practice, separate from typed recall.</p><div class="choices">${options.map(option => `<button class="choice-option" lang="de" data-answer="${esc(option)}">${esc(option)}</button>`).join('')}</div>`;
      } else {
        form = `<p class="eyebrow">${correction ? 'A second try · supported practice' : 'One word. Your own pace.'}</p><form id="answer-form" class="answer-form"><label for="practice-answer">${correction ? 'Try the German again' : 'Your answer in German'}</label><input id="practice-answer" lang="de" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="2000" value="${esc(pending.draft)}" placeholder="Include der, die or das for nouns" aria-describedby="answer-help answer-validation"><p id="answer-validation" class="validation" role="status"></p><button class="primary" type="submit">Check answer <span aria-hidden="true">↗</span></button></form><p id="answer-help" class="answer-help">Enter to check. Continue whenever you’re ready.</p>`;
      }
      const hint = pending.hint_used ? `<p class="hint-note">Hint: ${esc(word.word_de.match(/^(der|die|das)\s/i)?.[0] || '')}${esc(word.word_de.replace(/^(der|die|das)\s/i,'').slice(0,1))}… <span class="muted">This answer counts as supported practice.</span></p>` : '';
      $('#practice-area').innerHTML = practiceShell(word, `${form}${hint}<div class="answer-actions">${correction ? '<button data-action="cancel-correction" class="text-button">Back to feedback</button>' : `${!pending.hint_used && !recognition ? '<button data-action="hint" class="text-button">Give me a hint</button>' : ''}<button data-action="reveal" class="text-button">Show answer</button>`}</div>`);
      $('#answer-form')?.addEventListener('submit', event => { event.preventDefault(); action(() => submit(draftValue())); });
      startDraftWatch();
    }
    syncState();
    if (focus && uiBusy) practiceFocusPending = true;
    else if (focus) practiceFocusTarget()?.focus({preventScroll:true});
  }
  function recognitionOptions(word) {
    const options = [word.word_de], candidates = learning.scopeWords(db.words,{focus:db.practice.scope?.focus || 'all'});
    for (const candidate of [...candidates.filter(w => w.part_of_speech === word.part_of_speech),...candidates]) {
      if (!options.some(option => learning.normalizeAnswer(option) === learning.normalizeAnswer(candidate.word_de))
        && learning.gradeAnswer(candidate.word_de,word).result !== 'correct') options.push(candidate.word_de);
      if (options.length === 4) break;
    }
    // A stable per-item order survives draft saves and reloads without moving choices.
    const offset = [...db.practice.pending.attempt_id].reduce((a,c) => a+c.charCodeAt(0),0) % options.length;
    return options.slice(offset).concat(options.slice(0,offset));
  }
  function renderFeedback(word) {
    const p = db.practice, pending = p.pending, first = p.attempts.find(a => a.id === pending.first_attempt_id);
    const last = p.attempts.find(a => a.id === pending.correction_ids.at(-1)) || first;
    const entry = learning.entryFor(word), grade = learning.gradeAnswer(last.answer,word);
    const correction = last.kind === 'correction', good = last.result === 'correct';
    const title = last.revealed && !correction ? 'Answer shown.' : correction && good ? 'Corrected. Nicely done.' : good ? last.assisted ? 'Correct, with support.' : 'Genau — that’s right.' : last.result === 'half' ? grade.comment === 'article slip' ? `Meaning right. The article is ${word.word_de.split(' ')[0]}.` : 'Almost. Check the spelling.' : 'Here’s the word for this context.';
    const count = correction ? 'Your first answer is unchanged. This correction is saved as supported practice.' : last.assisted ? 'Saved as supported practice. Hints, shown answers and choices do not verify independent recall.' : good ? 'Saved as an independent first answer. Recall is verified only after three fully correct typed recalls on separate days, at least 24 hours apart.' : 'Your first answer is saved. A later correction will help you practise without replacing this result.';
    const example = entry?.example_de || word.example_de;
    const renderedWord = grade.comment === 'article slip' ? `<mark>${esc(word.word_de.split(' ')[0])}</mark> ${esc(word.word_de.split(' ').slice(1).join(' '))}` : esc(word.word_de);
    $('#practice-area').innerHTML = practiceShell(word, `<div class="feedback ${good ? 'good':'care'}"><p class="eyebrow">${good ? '✓ Saved answer':'Saved · a useful learning moment'}</p><h2 tabindex="-1" id="feedback-title">${esc(title)}</h2><p class="answer-label">German</p><p class="correct-answer" lang="de">${renderedWord}</p><p class="muted">${esc(word.word_en)}</p>${example ? `<div class="example-block"><p lang="de">${esc(example)}</p><small>${esc(entry?.example_en || word.example_en || '')}</small></div>` : ''}<div class="button-row"><button data-action="next" class="primary">Next word <span aria-hidden="true">→</span></button>${!good ? '<button data-action="correct" class="secondary">Try it again</button>' : ''}<button data-action="listen" class="text-button">Listen</button></div><details><summary>How this counts</summary><p>${esc(count)}</p>${word.review?.due_at ? `<p>Next review: ${esc(stamp(word.review.due_at))}.</p>` : ''}${word.notes ? `<p>${esc(word.notes)}</p>` : ''}</details><p class="original-answer">First answer: <strong>${esc(first.answer || '(answer shown)')}</strong>${correction ? ` · Correction: ${esc(last.answer)}` : ''}</p></div>`);
    $('#feedback-title')?.focus({preventScroll:true});
  }
  async function submit(answer) {
    if (!answer.trim()) { $('#answer-validation').textContent = 'Type an answer, or choose Show answer.'; $('#practice-answer').focus(); return; }
    if (!await flushDraft()) return;
    const pending = db.practice.pending, word = currentWord(); if (!pending || !word) return;
    const correction = db.practice.correction;
    const request = {attemptId:correction?.attempt_id || pending.attempt_id,wordId:word.id,answer,result:learning.gradeAnswer(answer,word).result,at:now(),source:pending.source};
    const ok = await write(d => { const next = engine.submitAnswer(d,request); delete next.practice.correction; return next; });
    if (ok) { draftDirty = false; renderPractice(); }
  }
  async function nextWord() {
    if (!await flushDraft()) return;
    const ok = await write(d => {
      const pending = d.practice.pending;
      let next = engine.advance(d,{attemptId:pending.attempt_id});
      next.practice.seen_ids = [...new Set([...(next.practice.seen_ids || []),pending.word_id])];
      if (next.practice.format?.size) { next.practice.format.completed = (next.practice.format.completed || 0) + 1; if (next.practice.format.completed >= next.practice.format.size) return next; }
      return startCandidate(next);
    });
    if (ok) renderPractice(true);
  }
  async function beginScope(scope, format = {mode:'typed',size:null}) {
    if (!await flushDraft() || !await activities.beforeLeave()) return;
    if ((db.practice.pending?.phase === 'answering' || db.practice.correction) && db.practice.pending?.draft && !await confirmDialog('Change your practice?', 'Your unsubmitted draft will be discarded. Saved answers and feedback stay in your history.', 'Change practice')) return;
    const ok = await write(d => {
      let next = d.practice.pending ? engine.advance(d,{attemptId:d.practice.pending.attempt_id,discard:true}) : d;
      delete next.practice.correction;
      next.practice.scope = scope; next.practice.format = {...format,completed:0}; next.practice.seen_ids = []; next.practice.seen_day = day(now()); next.practice.extra = false; next.practice.paused = false;
      if (!Array.isArray(scope.wordIds) && ['marketing','everyday'].includes(scope.focus)) next.preferences.learningFocus = scope.focus;
      return startCandidate(next);
    });
    if (ok) { draftDirty = false; await navigate('today'); renderPractice(true); }
  }
  function speak(text) {
    const synth = window.speechSynthesis;
    const voice = synth?.getVoices().find(v => /^de(?:-|$)/i.test(v.lang) && v.localService);
    if (!voice) { notify('A German voice is not available on this device. You can still read and practise the text; no audio is sent to an online service.'); return; }
    synth.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = 0.9; synth.speak(utterance);
  }
  function confirmDialog(title, message, label = 'Continue', extra = '') {
    return new Promise(resolve => {
      const dialog = $('#app-dialog');
      $('#dialog-content').innerHTML = `<h2 id="dialog-title">${esc(title)}</h2><p>${esc(message)}</p>${extra}<div class="button-row"><button id="dialog-confirm" class="primary">${esc(label)}</button><button id="dialog-cancel" class="secondary">Cancel</button></div>`;
      let result = false;
      $('#dialog-confirm').onclick = () => { result = true; dialog.close(); };
      $('#dialog-cancel').onclick = () => dialog.close();
      dialog.addEventListener('close', () => resolve(result), {once:true}); dialog.showModal();
    });
  }
  async function navigate(next) {
    if (!['today','words','progress','settings','work','more'].includes(next)) next = 'today';
    const changedPage = page !== next;
    if ((page !== next || next === 'today') && (!await flushDraft() || !await activities.beforeLeave())) {
      // Recovery remains reachable even when a draft cannot be saved.
      if (next !== 'settings') return;
    }
    page = next;
    $$('.page').forEach(section => section.hidden = section.id !== `page-${page}`);
    $$('[data-page]').forEach(button => button.toggleAttribute('aria-current', button.dataset.page === page));
    $$('[data-page][aria-current]').forEach(button => button.setAttribute('aria-current','page'));
    history.replaceState(null,'',`#${page}`);
    if (page === 'today') renderPractice();
    if (page === 'words') renderWords();
    if (page === 'progress') renderProgress();
    if (page === 'settings') renderSettings();
    if (page === 'work') activities.renderWork();
    if (page === 'more') activities.renderMore();
    if (changedPage) {
      if (store.getState().writable) notify('');
      const heading = $(`#page-${page} h1`);
      if (heading) { heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true}); }
    }
    window.scrollTo({top:0,behavior:'instant'});
  }
  function wordReady(word) { return engine.inspectEvidence(word,{at:now()}).supported && (word.review == null || ReviewScheduler.hasSchedule(word) && Date.parse(word.review.last_attempt_at) <= Date.now()); }
  function wordState(word) { return !wordReady(word) ? 'Needs attention' : learning.isVerified(word,{at:now()}) ? 'Recall verified' : word.status === 'new' ? 'New' : 'Learning'; }
  function renderWordSelection() {
    $('#word-results').textContent = `${filteredWords.length} ${filteredWords.length === 1 ? 'word' : 'words'}${selectedWords.size ? ` · ${selectedWords.size} selected` : ''}`;
    $('#practice-results').disabled = !filteredWords.length || !store.getState().writable;
    $('#practice-selected').disabled = !selectedWords.size || !store.getState().writable;
    $('#practice-selected').textContent = selectedWords.size ? `Practise selected (${selectedWords.size})` : 'Practise selected';
  }
  function renderWords() {
    if (!db) { $('#word-list').textContent = 'Recover your database in Settings to view your words.'; return; }
    const search = $('#word-search').value.toLocaleLowerCase().trim(), focus = $('#word-focus').value, topic = $('#word-topic').value, state = $('#word-status').value;
    filteredWords = learning.scopeWords(db.words,{focus,topic}).filter(word => (!search || [word.word_de,word.word_en,word.notes,learning.entryFor(word)?.category].join(' ').toLocaleLowerCase().includes(search))
      && (state === 'all' || state === 'due' && wordReady(word) && ReviewScheduler.isDue(word,now()) || state === 'new' && wordState(word) === 'New' || state === 'learning' && wordState(word) === 'Learning' || state === 'verified' && learning.isVerified(word,{at:now()})));
    const size = 30, pages = Math.max(1,Math.ceil(filteredWords.length/size)); wordPage = Math.min(wordPage,pages-1);
    renderWordSelection();
    $('#word-list').innerHTML = filteredWords.slice(wordPage*size,(wordPage+1)*size).map(word => {
      const entry = learning.entryFor(word), verified = engine.inspectEvidence(word,{at:now()}).supported ? RecallEvidence.count(word) : 0;
      return `<div class="word-row"><input type="checkbox" data-select-word="${esc(word.id)}" ${selectedWords.has(word.id) ? 'checked':''} aria-label="Select ${esc(word.word_de)}"><details><summary><span class="word-german" lang="de">${esc(word.word_de)}</span><span class="word-english">${esc(word.word_en)}</span><span class="word-meta">${esc(wordState(word))}${wordReady(word) && ReviewScheduler.isDue(word,now()) ? ' · Due':''}</span></summary><div class="word-detail">${entry?.example_de ? `<p><span lang="de">${esc(entry.example_de)}</span><br><span class="muted">${esc(entry.example_en)}</span></p>`:''}${word.notes ? `<p>${esc(word.notes)}</p>`:''}<p class="muted">${esc(categories[entry?.category] || word.topic || 'General')} · ${esc(word.difficulty)} · ${wordReady(word) ? `${verified}/3 qualifying recall days` : 'Evidence needs recovery'}${ReviewScheduler.hasSchedule(word) ? ` · Review ${esc(stamp(word.review.due_at))}` : ''}</p><p class="muted">${learning.isMarketingWord(word) ? 'Work priority: an editorial learning sequence.' : `Everyday frequency: ${esc(learning.frequencyBand(word) || 'no estimate')}. Historical corpus estimates guide new words, not due reviews.`}</p><button data-listen-word="${esc(word.id)}" class="text-button">Listen</button><button data-practice-word="${esc(word.id)}" class="text-button">Practise this word</button></div></details></div>`;
    }).join('') || '<p class="panel">No words match these filters. Try a different topic or search.</p>';
    $('#word-page').textContent = `Page ${wordPage+1} of ${pages}`;
    $('#previous-words').disabled = wordPage === 0; $('#next-words').disabled = wordPage >= pages-1;
  }
  function renderProgress() {
    if (!db) { $('#progress-content').textContent = 'Recover your database in Settings to see saved progress.'; return; }
    const focus = $('#progress-focus').value, stats = learning.progress(db,{at:now(),focus});
    const rows = [['Independent first answers',stats.firstUnaided],['Supported first answers',stats.assisted],['Corrections',stats.corrections]];
    const wordIds = new Set(learning.scopeWords(db.words,{focus}).map(w => w.id));
    const attempts = db.practice.attempts.filter(a => wordIds.has(a.word_id) && Date.parse(a.at) <= Date.now());
    const calendar = Array.from({length:7},(_,i) => { const date = new Date(); date.setDate(date.getDate()-6+i); const count = attempts.filter(a => day(a.at) === day(date)).length; return `<div class="activity-day ${count ? 'active':''}"><span>${esc(date.toLocaleDateString(undefined,{weekday:'short'}))}</span><strong>${count}</strong><small>${count === 1 ? 'answer':'answers'}</small></div>`; }).join('');
    const workAttempts = (db.activities?.attempts || []).filter(a => a.source === 'work' || a.source === 'scenario');
    $('#progress-content').innerHTML = `<div class="stats-grid"><section class="stat"><h2>Recall verified</h2><strong>${stats.verifiedCount}<small> / ${stats.wordCount}</small></strong><p>Three fully correct typed recalls on separate days, at least 24 hours apart.</p></section><section class="stat"><h2>Due for review</h2><strong>${stats.dueCount}</strong><p>${stats.scheduledLaterCount} scheduled later. ${stats.unscheduledCount} earlier words have no review date.</p></section><section class="stat"><h2>Independent accuracy</h2><strong>${stats.firstUnaided.accuracyPercent === null ? '—' : stats.firstUnaided.accuracyPercent+'%'}</strong><p>${stats.firstUnaided.correct} fully correct of ${stats.firstUnaided.total} first answers. Partial answers are not counted as correct.</p></section></div><section class="panel"><h2>Different practice, different evidence.</h2><div class="table-scroll" tabindex="0" role="region" aria-label="Practice evidence table"><table class="progress-table"><thead><tr><th scope="col">Practice</th><th scope="col">Answers</th><th scope="col">Correct</th><th scope="col">Partial</th><th scope="col">Wrong</th></tr></thead><tbody>${rows.map(([label,s]) => `<tr><th scope="row">${label}</th><td>${s.total}</td><td>${s.correct}</td><td>${s.half}</td><td>${s.wrong}</td></tr>`).join('')}</tbody></table></div><p class="muted">Hints, shown answers, recognition and corrections cannot increase verified recall. A later mistake restarts the current recall evidence. This is vocabulary practice, not a measure of overall fluency.</p>${stats.blockedReviewCount ? `<p>${stats.blockedReviewCount} words have unsupported saved learning evidence or a future-dated attempt. They are preserved and excluded from the queue.</p>`:''}${stats.excludedAttempts ? `<p>${stats.excludedAttempts} ambiguous records are excluded from these totals.</p>`:''}</section><section class="panel"><h2>Your last seven days</h2><div class="activity-days">${calendar}</div><p class="muted">Saved vocabulary answers, including corrections. No streak to lose.</p></section><section class="panel"><h2>Recent saved answers</h2><ol class="history-list">${attempts.slice(-8).reverse().map(a => `<li><strong>${esc(db.words.find(w => w.id === a.word_id)?.word_de || 'Word')}</strong><span>${esc(a.answer || 'Answer shown')} · ${a.kind === 'correction' ? 'Correction' : a.assisted ? 'Supported' : 'Independent'} · ${esc(a.result)} · ${esc(stamp(a.at))}</span></li>`).join('') || '<li>Your first saved answer will appear here.</li>'}</ol></section><details class="panel"><summary>Other practice and earlier history</summary><p>${db.activities?.attempts?.length || 0} saved activity records. Workplace writing uses your own self-review; sentence variants are compared with examples, not graded as general German.</p><p>${stats.legacySessionCount} earlier sessions are retained in your full backup. Their old scores do not count toward the independent accuracy above.</p>${db.sessions.length ? `<ol class="history-list">${db.sessions.slice(-10).reverse().map(s => `<li>${esc(s.mode || s.type || 'Earlier practice')} · ${esc(s.ended_at || s.date || s.started_at || 'Date not recorded')}</li>`).join('')}</ol>`:''}</details>`;
  }
  function renderSettings() {
    if (db) { $('#profile-name').value = db.profile.name || ''; $('#profile-level').value = db.profile.level || 'B1'; $('#habit-cue').checked = Boolean(db.preferences.habitCue); }
    $$('#profile-form input, #profile-form select, #profile-form button, [data-theme-choice]').forEach(el => el.disabled = !store.getState().writable);
    $('#reset-progress').disabled = !store.getState().writable;
    applyTheme();
  }
  async function previewBackup(file) {
    if (!file) return;
    if (file.size > 20*1024*1024) throw new Error('This file exceeds the 20 MB backup limit.');
    await flushDraft(); await activities.beforeLeave();
    restorePreview = await store.previewRestore(await file.text());
    if (restorePreview.status !== 'success') throw new Error(restorePreview.message || 'This is not a supported full backup. Recovery copies and CSV files have a different purpose.');
    const s = restorePreview.summary;
    $('#restore-preview').hidden = false;
    $('#restore-summary').textContent = `${s.words} words, ${s.attempts} vocabulary answers and ${s.sessions} earlier sessions. Exported ${stamp(s.exportedAt)}. ${s.invalidCurrent ? 'The current data cannot be opened safely. Its exact original contents will be saved as a recovery copy before replacement.' : `This replaces ${s.replacesWords} current words and ${s.replacesAttempts} current vocabulary answers.`}${s.pendingWrite ? ' This also replaces the unsaved change; it will be retained in the recovery copy.' : ''}`;
    $('#acknowledge-restore').checked = false; $('#acknowledge-legacy').checked = false; $('#acknowledge-invalid').checked = false;
    $('#legacy-ack-label').hidden = !s.legacyChanged; $('#invalid-ack-label').hidden = !s.invalidCurrent; $('#confirm-restore').disabled = true;
    $('#backup-status').textContent = 'Backup validated. Review the details before restoring.';
  }
  function cancelRestore() { store.cancelRestorePreview(); restorePreview = null; $('#restore-preview').hidden = true; $('#restore-file').value = ''; }
  async function restore() {
    if (!restorePreview || !$('#acknowledge-restore').checked || restorePreview.summary.legacyChanged && !$('#acknowledge-legacy').checked
      || restorePreview.summary.invalidCurrent && !$('#acknowledge-invalid').checked) return;
    await writeQueue;
    const state = await store.restore(restorePreview.previewId,{discardPending:Boolean(restorePreview.summary.pendingWrite),acknowledgeLegacyChange:$('#acknowledge-legacy').checked,replaceInvalid:$('#acknowledge-invalid').checked});
    syncState();
    if (!state.saved) { $('#backup-status').textContent = state.reason === 'restore-preview-stale' ? 'Data changed after this preview. Choose the file again to review a fresh preview.' : 'Restore has not fully completed. Use the recovery options above.'; return; }
    cancelRestore(); draftDirty = false; selectedWords.clear(); activities = makeActivities(); refreshTopics();
    if (!db.practice.pending && !db.practice.paused) await write(d => startCandidate(d));
    renderSettings();
    $('#backup-status').textContent = 'Full backup restored. A pre-restore copy is available to download.';
    notify('Your full backup is restored. Your saved place is ready in Today.');
  }
  function addWordDialog() {
    if (!db || !store.getState().writable) return;
    $('#dialog-content').innerHTML = '<h2 id="dialog-title">Add a useful word</h2><form id="add-word-form" class="form-grid" aria-describedby="add-word-error"><label>English meaning<input id="add-en" required maxlength="300"></label><label>German word or phrase<input id="add-de" lang="de" required maxlength="300" placeholder="Include the article for nouns"></label><label>Topic<select id="add-topic"><option value="marketing">Marketing</option><option value="custom">Everyday / custom</option></select></label><label>Note or example<textarea id="add-note" maxlength="2000"></textarea></label><p id="add-word-error" class="validation" role="status" aria-live="polite"></p><button class="primary" type="submit">Save word</button><button id="add-word-close" class="secondary" type="button">Close</button></form><p class="muted">For many words at once, import a word list CSV in Settings.</p>';
    $('#add-word-close').onclick = () => $('#app-dialog').close();
    $('#add-word-form').onsubmit = event => { event.preventDefault(); action(async () => {
      const en = $('#add-en').value.trim(), de = $('#add-de').value.trim();
      $('#add-word-error').textContent = '';
      if (!en || !de) { $('#add-word-error').textContent = 'Enter both the English meaning and German word.'; return; }
      if (db.words.some(w => learning.normalizeAnswer(w.word_en) === learning.normalizeAnswer(en) && learning.normalizeAnswer(w.word_de) === learning.normalizeAnswer(de))) { $('#add-word-error').textContent = 'That word and meaning are already in your collection.'; return; }
      const word = makeWord({word_en:en,word_de:de,topic:$('#add-topic').value,notes:$('#add-note').value.trim()});
      if (await write(d => {d.words.push(word);})) { $('#app-dialog').close(); notify('Word added. It is ready for practice.'); refreshTopics(); renderWords(); }
      else $('#add-word-error').textContent = 'This word is not saved yet. Your entry is still here. Close this dialog and use Retry save above to save the same word.';
    }); }; $('#app-dialog').showModal();
  }
  function makeWord(fields) {
    const word = {id:`custom-${uid()}`,word_en:fields.word_en,word_de:fields.word_de,topic:fields.topic || 'custom',difficulty:fields.difficulty || db.profile.level || 'B1',part_of_speech:fields.part_of_speech || learning.guessPartOfSpeech(fields.word_en,fields.word_de),notes:fields.notes || '',status:'new',correct_streak:0,times_seen:0,wrong_count:0,half_count:0,last_seen:'',last_result:'',last_missed_at:'',last_missed_round_id:'',created_at:now()};
    if (fields.accepted_answers) word.accepted_answers = fields.accepted_answers;
    RecallEvidence.normalizeWord(word); return word;
  }
  async function importCSV(file) {
    if (!file) return;
    if (!db || !store.getState().writable) throw new Error('Resolve the saving issue before importing words.');
    if (file.size > 20*1024*1024) throw new Error('The word list exceeds the 20 MB limit.');
    const rows = CoachCSV.parse(await file.text());
    const key = w => `${learning.normalizeAnswer(w.word_en)}|${learning.normalizeAnswer(w.word_de)}`;
    const known = new Set(db.words.map(key)), fresh = [];
    for (const row of rows) { if (!known.has(key(row))) { fresh.push(row); known.add(key(row)); } }
    if (!fresh.length) { $('#csv-status').textContent = 'All words in that file are already in your collection.'; return; }
    if (!await confirmDialog('Import this word list?', `Add ${fresh.length} new words. Skip ${rows.length-fresh.length} duplicates. Existing words and learning history stay as they are. CSV does not restore learning progress.`, 'Import words')) return;
    if (await write(d => { const existing = new Set(d.words.map(key)); for (const row of fresh) if (!existing.has(key(row))) { d.words.push(makeWord(row)); existing.add(key(row)); } })) { $('#csv-status').textContent = `${fresh.length} words added.`; refreshTopics(); }
  }
  async function resetProgress() {
    if (!db || !store.getState().writable) return;
    if (!await flushDraft() || !await activities.beforeLeave()) return;
    download(store.exportBackup(),`german-coach-before-reset-${day(now())}.json`);
    if (!await confirmDialog('Reset your practice history?', 'A full backup download has started. Check that it was saved before continuing. This resets recall, review dates, drafts and practice history. Your vocabulary, name and preferences stay.', 'Reset practice history')) return;
    const baseline = store.getState().committed;
    if (!baseline?.database) throw new Error('Reload your saved data before preparing a reset.');
    const next = JSON.parse(JSON.stringify(baseline.database));
    next.words.forEach(word => { for (const key of ['recall','review','exposure','legacy_recall','legacy_mastery']) delete word[key]; Object.assign(word,{status:'new',correct_streak:0,times_seen:0,wrong_count:0,half_count:0,last_seen:'',last_result:'',last_missed_at:'',last_missed_round_id:''}); RecallEvidence.normalizeWord(word); });
    next.sessions = []; delete next.practice; next.activities = {version:1,drafts:{},attempts:[]};
    const preview = await store.previewRestore(data.stringify(data.initializeCandidate(next),{exportedAt:now()}),{expectedRaw:baseline.raw});
    if (preview.status !== 'success') throw new Error(preview.message || 'Reset could not be prepared.');
    const state = await store.restore(preview.previewId); syncState();
    if (state.saved) { await write(d => startCandidate(d)); notify('Practice history reset. Your words and preferences are kept, and a pre-reset copy is available in Settings.'); renderSettings(); }
  }
  function refreshTopics() {
    if (!db) return;
    const previous = $('#word-topic').value;
    const topics = [...new Set([...Object.keys(categories),...db.words.map(w => w.topic).filter(Boolean)])].sort();
    $('#word-topic').innerHTML = '<option value="all">All topics</option>'+topics.map(t => `<option value="${esc(t)}">${esc(categories[t] || t)}</option>`).join('');
    $('#word-topic').value = topics.includes(previous) ? previous : 'all';
  }
  function makeActivities() {
    return CoachActivities.create({content:CoachContent,scenarios:MarketingScenarios,getDb:() => db,update:write,status:notify,speak,startWords:({mode,size}) => beginScope({focus:db.preferences.learningFocus || 'marketing',wordIds:null},{mode,size})});
  }
  async function handlePracticeAction(name) {
    if (name === 'next') return nextWord();
    if (name === 'listen') return speak(currentWord().word_de);
    if (name === 'clear-scope') return beginScope({focus:db.preferences.learningFocus || 'marketing',wordIds:null});
    if (!await flushDraft()) return;
    if (name === 'hint') {
      const id = db.practice.pending.attempt_id;
      if (await write(d => engine.markHint(d,{attemptId:id,at:now()}))) renderPractice(true);
    } else if (name === 'reveal') {
      const pending = db.practice.pending;
      if (await write(d => { const at = now(); const next = engine.reveal(d,{attemptId:pending.attempt_id,at}); return engine.submitAnswer(next,{attemptId:pending.attempt_id,wordId:pending.word_id,answer:pending.draft,result:'wrong',source:pending.source,at,assisted:true}); })) renderPractice();
    } else if (name === 'correct') {
      if (await write(d => { d.practice.correction = {attempt_id:uid()}; d.practice.pending.draft = ''; d.practice.pending.updated_at = now(); })) renderPractice(true);
    } else if (name === 'cancel-correction') {
      if (await write(d => { const p = d.practice.pending, id = p.correction_ids.at(-1) || p.first_attempt_id; p.draft = d.practice.attempts.find(a => a.id === id).answer; p.updated_at = now(); delete d.practice.correction; })) renderPractice();
    } else if (name === 'resume') {
      if (await write(d => { const next = engine.resume(d); return next.practice.pending ? next : startCandidate(next); })) renderPractice(true);
    } else if (name === 'extra') {
      if (await write(d => { d.practice.extra = true; d.practice.format = {mode:d.practice.format?.mode || 'typed',size:null,completed:0}; return startCandidate(d); })) renderPractice(true);
    }
  }
  function bindEvents() {
    document.addEventListener('click', event => {
      const target = event.target.closest('button, a.brand'); if (!target) return;
      if (target.classList.contains('brand')) { event.preventDefault(); action(() => navigate('today')); }
      else if (target.dataset.page) action(() => navigate(target.dataset.page));
      else if (target.dataset.action) action(() => handlePracticeAction(target.dataset.action));
      else if (target.dataset.answer !== undefined) action(() => submit(target.dataset.answer));
      else if (target.dataset.listenWord) speak(db.words.find(w => w.id === target.dataset.listenWord).word_de);
      else if (target.dataset.practiceWord) action(() => beginScope({focus:'all',wordIds:[target.dataset.practiceWord]}));
      else if (target.dataset.themeChoice) action(async () => { if (await write(d => {d.preferences.theme = target.dataset.themeChoice;})) renderSettings(); });
    });
    $('#practice-focus').addEventListener('change', event => action(async () => { await beginScope({focus:event.target.value,wordIds:null}); $('#practice-focus').value = db.practice.scope?.focus || db.preferences.learningFocus || 'marketing'; }));
    $('#stop-practice').onclick = () => action(async () => { if (await flushDraft() && await write(d => engine.pause(d))) renderPractice(); });
    $('#open-work').onclick = () => action(() => navigate('work'));
    $('#open-more').onclick = () => action(() => navigate('more'));
    $('#word-list').addEventListener('change', event => { if (event.target.dataset.selectWord) { if (event.target.checked) selectedWords.add(event.target.dataset.selectWord); else selectedWords.delete(event.target.dataset.selectWord); renderWordSelection(); } });
    ['word-search','word-focus','word-topic','word-status'].forEach(id => $('#'+id).addEventListener(id === 'word-search' ? 'input':'change', () => {wordPage=0;renderWords();}));
    $('#previous-words').onclick = () => { wordPage--; renderWords(); };
    $('#next-words').onclick = () => { wordPage++; renderWords(); };
    $('#practice-results').onclick = () => action(() => beginScope({focus:'all',wordIds:filteredWords.map(w => w.id)}));
    $('#practice-selected').onclick = () => action(() => beginScope({focus:'all',wordIds:[...selectedWords]}));
    $('#open-add-word').onclick = addWordDialog;
    $('#progress-focus').onchange = renderProgress;
    $('#profile-form').onsubmit = event => { event.preventDefault(); action(async () => {
      const name = $('#profile-name').value.trim(), level = $('#profile-level').value, habitCue = $('#habit-cue').checked;
      if (await write(d => { Object.assign(d.profile,{name,level,hasChosenName:true,hasChosenLevel:true}); Object.keys(d.profile.modeLevels).forEach(key => d.profile.modeLevels[key]=level); d.preferences.habitCue=habitCue; })) notify('Preferences saved.');
    }); };
    $('#export-backup').onclick = () => action(async () => { await flushDraft(); await activities.beforeLeave(); download(store.exportBackup(),`german-coach-full-${day(now())}.json`); $('#backup-status').textContent = store.getState().pending ? 'Downloaded saved progress. The unsaved change has a separate download above.' : 'Full backup download started. Keep the JSON file somewhere safe.'; });
    $('#download-recovery').onclick = () => { try { download(store.exportRecovery(),`german-coach-recovery-${day(now())}.json`); } catch(e) {showError(e);} };
    $('#download-pending').onclick = () => { try { download(store.exportBackup({source:'pending'}),`german-coach-unsaved-full-${day(now())}.json`); } catch(e) {showError(e);} };
    $('#retry-save').onclick = () => action(async () => {
      await writeQueue; const replacing = store.getState().pending?.kind === 'restore';
      const state = await store.retry(); syncState();
      if (state.saved) {
        if (replacing) {
          cancelRestore(); draftDirty = false; selectedWords.clear(); activities = makeActivities(); refreshTopics();
          if (!db.practice.pending && !db.practice.paused && !await write(d => startCandidate(d))) return;
          await navigate(page); notify('Your replacement backup is saved. The previous data is available as a safety copy in Settings.'); return;
        }
        // The exact failed snapshot may predate typing that is still on the
        // page. Keep both draft owners alive until those newer edits also save.
        if (!await flushDraft() || !await activities.beforeLeave()) return;
        await navigate(page); notify('Your pending change is saved.');
      }
    });
    $('#export-safety').onclick = () => { try { const text=store.exportSafetyCopy(); const raw=JSON.parse(text).format === 'german-vocab-coach-raw-recovery'; download(text,`german-coach-${raw?'pre-repair-recovery':'pre-restore-backup'}-${day(now())}.json`); } catch(e) { $('#backup-status').textContent=e.message; } };
    $('#restore-file').onchange = event => action(() => previewBackup(event.target.files[0]));
    ['acknowledge-restore','acknowledge-legacy','acknowledge-invalid'].forEach(id => $('#'+id).onchange = () => { $('#confirm-restore').disabled = !$('#acknowledge-restore').checked || restorePreview?.summary.legacyChanged && !$('#acknowledge-legacy').checked || restorePreview?.summary.invalidCurrent && !$('#acknowledge-invalid').checked; });
    $('#confirm-restore').onclick = () => action(async () => { await restore(); if (store.getState().saved) { activities=makeActivities();refreshTopics(); } });
    $('#cancel-restore').onclick = cancelRestore;
    $('#export-csv').onclick = () => { try { download(CoachCSV.stringify(db.words),`german-coach-word-list-${day(now())}.csv`,'text/csv;charset=utf-8'); $('#csv-status').textContent='Word list downloaded. Use Full backup to preserve learning history and settings.'; } catch(e) {showError(e);} };
    $('#import-csv').onchange = event => action(async () => { await importCSV(event.target.files[0]); event.target.value=''; });
    $('#export-original').onclick = () => { try { const bundle=JSON.parse(store.exportRecovery()); const source=bundle.original_legacy?.raw && JSON.parse(bundle.original_legacy.raw); if (!source?.raw) { $('#csv-status').textContent='There was no earlier app database to migrate in this browser.'; return; } download(source.raw,`german-coach-original-database-${day(now())}.json`); $('#csv-status').textContent='Original database downloaded for recovery. This raw migration copy is separate from a restorable full backup.'; } catch(e) {showError(e);} };
    $('#reset-progress').onclick = () => action(resetProgress);
    window.addEventListener('beforeunload', event => { if (draftDirty || writing || activities.hasUnsaved() || store.getState().pending) { event.preventDefault(); event.returnValue=''; } });
    window.addEventListener('pagehide', () => window.speechSynthesis?.cancel());
    document.addEventListener('visibilitychange', () => { if (document.hidden && draftDirty) flushDraft(); });
    window.addEventListener('storage', event => { if (event.key?.startsWith(CoachStore.LEGACY_KEY)) notify('This browser’s saved data changed in another tab. Finish recovery or reload before continuing; conflicting changes will not overwrite each other.'); });
  }
  async function prepareOffline() {
    if (!('serviceWorker' in navigator)) { $('#offline-status').textContent='Offline installation is unavailable in this browser. Full backup downloads still work.'; return; }
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      function status() {
        $('#offline-status').textContent = registration.waiting ? 'An app update is ready. Save your work, then close all app tabs and reopen to use it.' : navigator.serviceWorker.controller ? 'Offline files are ready for this device.' : registration.active ? 'Offline files are saved. Reopen the app to finish enabling offline use.' : 'Offline files are being prepared. Keep the app open until this finishes.';
      }
      status(); registration.addEventListener('updatefound', () => { const worker=registration.installing; worker?.addEventListener('statechange',status); });
      navigator.serviceWorker.addEventListener('controllerchange',status); navigator.serviceWorker.ready.then(status).catch(() => {});
    } catch { $('#offline-status').textContent='Offline files could not be prepared. You can keep using the open page and download a full backup.'; }
  }
  async function boot() {
    try {
      store = CoachStore.create({storage:window.localStorage,locks:navigator.locks,seed:() => CoachContent.createSeed(),migrateLegacy:raw => CoachMigration.upgrade(raw,{seed:CoachContent.createSeed(),recall:RecallEvidence}),practiceData:data,persistence:Persistence,practiceSession:PracticeSession,engine});
      await store.load(); syncState(); activities=makeActivities(); bindEvents(); refreshTopics();
      if (db && store.getState().writable && !db.practice.pending && !db.practice.paused) await write(d => startCandidate(d));
      await navigate(location.hash.slice(1) || 'today');
      if (db?.practice?.pending && !db.practice.paused && page === 'today') renderPractice(false);
      prepareOffline();
    } catch(error) {
      $('#practice-area').innerHTML='<section class="panel"><h2>The coach could not open safely.</h2><p>No progress has been reset. Keep this page open and check that browser storage is enabled, then try reopening.</p></section>';
      showError(error);
    }
  }
  boot();
})();
