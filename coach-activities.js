/* Optional activities. All writes use the injected durable update; no word mastery is changed. */
const CoachActivities = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const normal = text => String(text).normalize('NFC').toLocaleLowerCase('de').replace(/[.,!?;:“”„"']/g, '').replace(/\s+/g, ' ').trim();
  const labels = { crm: 'CRM & lifecycle', metrics: 'KPIs & reporting', campaigns: 'Digital campaigns', meetings: 'Meetings & teamwork', creative: 'Creative & content', strategy: 'Research & strategy' };
  const kinds = { story: 'Stories', context: 'Words in context', sentence: 'Sentence writing', tense: 'Verb tenses' };
  const collections = { story: 'stories', context: 'contexts', sentence: 'sentences', tense: 'tenses' };
  const tenseNames = { present: 'Present', past: 'Past · Perfekt', future: 'Future · werden' };

  function create({ content, scenarios, getDb, update, status, speak, startWords } = {}) {
    if (!content || !Array.isArray(scenarios) || !Object.values(collections).every(key => Array.isArray(content[key]))
      || ![getDb, update, status, speak, startWords].every(fn => typeof fn === 'function')) throw new TypeError('Activity content and callbacks are required.');
    const document = globalThis.document;
    if (!document?.getElementById) throw new TypeError('An activity document is required.');
    let selectedScenario = null, selectedKind = null, selectedItem = null, levelFilter = 'all', selectedTense = 'present';
    let timer = null, inFlight = null, pending = null, serial = 0;
    const edits = new Map(), shownModels = new Set(), choiceOrder = new Map();
    const now = () => new Date().toISOString();
    const id = () => globalThis.crypto?.randomUUID?.() || `activity-${Date.now()}-${++serial}-${Math.random().toString(36).slice(2)}`;
    const byId = value => document.getElementById(value);

    function activityData(db, writable = false) {
      if (!plain(db)) throw new Error('Your saved data is not available.');
      if (!own(db, 'activities')) {
        if (!writable) return { version: 1, drafts: {}, attempts: [] };
        db.activities = { version: 1, drafts: {}, attempts: [] };
      }
      const data = db.activities;
      if (!plain(data) || data.version !== 1 || !plain(data.drafts) || !Array.isArray(data.attempts)) throw new Error('This activity history needs a supported migration before it can be changed.');
      for (const draft of Object.values(data.drafts)) {
        if (!plain(draft) || ['writing', 'variation', 'answer'].some(key => own(draft, key) && typeof draft[key] !== 'string')) throw new Error('A saved activity draft needs recovery.');
      }
      if (data.attempts.some(attempt => !plain(attempt) || typeof attempt.id !== 'string' || typeof attempt.source !== 'string' || typeof attempt.key !== 'string')) throw new Error('A saved activity attempt needs recovery.');
      return data;
    }
    function history() { return activityData(getDb()).attempts; }
    function first(key) { return history().find(attempt => attempt.key === key) || null; }
    function draftFor(scenarioId) { return edits.get(scenarioId) || activityData(getDb()).drafts[scenarioId] || { writing: '', variation: '' }; }
    function localNotice(message) {
      for (const name of ['scenario-draft-status', 'optional-draft-status']) {
        const target = byId(name);
        if (target) target.textContent = message;
      }
      status(message);
    }
    function committed(intent) { try { return intent.verify(getDb()); } catch { return false; } }
    function acknowledge() { if (pending && committed(pending)) pending = null; }

    async function persist(intent) {
      acknowledge();
      if (inFlight) { status('A save is still in progress. Please wait a moment.'); return false; }
      if (pending && pending !== intent) { status('The previous save is not confirmed. Use Retry save before making another change.'); return false; }
      pending = intent;
      inFlight = (async () => {
        try {
          if (committed(intent)) { pending = null; return true; }
          const saved = await update(intent.mutate);
          if (saved === true && committed(intent)) { pending = null; return true; }
          status('Not saved yet. Your current work stays on this page. Retry the save before leaving.');
          return false;
        } catch (error) {
          status(`Not saved: ${error.message || 'storage is unavailable'}`);
          return false;
        }
      })();
      try { return await inFlight; } finally { inFlight = null; }
    }

    async function saveDrafts() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (inFlight) await inFlight;
      acknowledge();
      if (pending && !(await persist(pending))) return false;
      if (!edits.size) return true;
      const snapshot = [...edits].map(([key, value]) => [key, { ...value }]);
      const fields = value => Object.fromEntries(['writing', 'variation', 'answer'].filter(key => own(value, key)).map(key => [key, value[key]]));
      const at = now();
      const intent = {
        mutate(db) {
          const data = activityData(db, true);
          for (const [key, value] of snapshot) data.drafts[key] = { ...(data.drafts[key] || {}), ...fields(value), updated_at: at };
        },
        verify(db) {
          const drafts = activityData(db).drafts;
          return snapshot.every(([key, value]) => Object.entries(fields(value)).every(([field, text]) => drafts[key]?.[field] === text) && drafts[key]?.updated_at === at);
        }
      };
      if (!(await persist(intent))) return false;
      for (const [key, value] of snapshot) if (edits.get(key)?.revision === value.revision) edits.delete(key);
      localNotice(edits.size ? 'Recent changes still need saving.' : 'Draft saved on this device.');
      return true;
    }
    async function beforeLeave() {
      if (inFlight) await inFlight;
      acknowledge();
      if (pending && !(await persist(pending))) return false;
      while (edits.size) if (!(await saveDrafts())) return false;
      return true;
    }
    function hasUnsaved() { acknowledge(); return Boolean(inFlight || pending || edits.size || timer); }
    function editDraft(scenarioId, field, value) {
      const old = draftFor(scenarioId);
      edits.set(scenarioId, { writing: old.writing || '', variation: old.variation || '', ...{ [field]: value }, revision: ++serial });
      localNotice('Draft has unsaved changes.');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; void saveDrafts(); }, 700);
    }
    function editOptionalDraft(key, answer) {
      edits.set(key, { answer, revision: ++serial });
      localNotice('Draft has unsaved changes.');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; void saveDrafts(); }, 700);
    }

    async function record(fields, immutable = false) {
      if (!(await beforeLeave())) return false;
      if (immutable && first(fields.key)) return true;
      const attempt = { id: id(), at: now(), ...fields };
      const intent = {
        mutate(db) {
          const data = activityData(db, true);
          if (data.attempts.some(saved => saved.id === attempt.id)) return;
          if (immutable && data.attempts.some(saved => saved.key === attempt.key)) throw new Error('The first answer is already saved.');
          data.attempts.push(attempt);
        },
        verify(db) { return activityData(db).attempts.some(saved => saved.id === attempt.id && equal(saved, attempt)); }
      };
      return persist(intent);
    }
    function safeRender(target, callback) {
      acknowledge();
      try { callback(); }
      catch (error) { if (target) target.innerHTML = `<div class="panel"><p>${esc(error.message)}</p><p class="muted">Existing activity data has been left unchanged.</p></div>`; status(error.message); }
    }
    function bind(container, name, handler) { if (container) container[name] = handler; }
    function focusHeading(target) {
      if (!target) return;
      target.tabIndex = -1;
      target.focus({ preventScroll: false });
      target.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    }
    function typingFocus(container) {
      const active = document.activeElement;
      if (!active?.id || !container.contains(active) || !['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return null;
      return { id: active.id, start: active.selectionStart, end: active.selectionEnd, direction: active.selectionDirection };
    }
    function restoreTypingFocus(previous) {
      if (!previous) return;
      const target = byId(previous.id);
      if (!target || target.disabled) return;
      // A resumed variation can sit inside a disclosure rebuilt by the render.
      let disclosure = target.closest?.('details');
      while (disclosure) { disclosure.open = true; disclosure = disclosure.parentElement?.closest?.('details'); }
      target.focus({ preventScroll: true });
      if (typeof previous.start === 'number' && typeof target.setSelectionRange === 'function') {
        try { target.setSelectionRange(previous.start, previous.end, previous.direction || 'none'); } catch { /* Non-text inputs do not have a selection. */ }
      }
    }

    function renderWork({ focus = null } = {}) {
      const list = byId('scenario-list'), detail = byId('scenario-detail');
      if (!list || !detail) return;
      const previousFocus = typingFocus(detail);
      safeRender(detail, () => {
        activityData(getDb());
        list.innerHTML = scenarios.map(scenario => `<article class="activity-card panel"><p class="eyebrow">${esc(labels[scenario.category] || scenario.category)} · ${esc(scenario.level)}</p><h2>${esc(scenario.title)}</h2><p class="muted">Read, listen, write or speak. Choose one small task.</p><button type="button" class="secondary" data-scenario="${esc(scenario.id)}">Open scenario</button></article>`).join('');
        bind(list, 'onclick', async event => {
          const button = event.target.closest('[data-scenario]');
          if (!button || !list.contains(button) || !(await beforeLeave())) return;
          selectedScenario = button.dataset.scenario; renderWork({ focus: 'scenario' });
        });
        const scenario = scenarios.find(item => item.id === selectedScenario);
        list.hidden = Boolean(scenario); detail.hidden = !scenario;
        if (!scenario) {
          detail.innerHTML = '';
          if (focus === 'overview') focusHeading(byId('page-work')?.querySelector('h1'));
          return;
        }
        const draft = draftFor(scenario.id);
        const reviewed = history().filter(item => item.source === 'scenario-speaking' && item.item_id === scenario.id).at(-1);
        detail.innerHTML = `<button class="text-button" type="button" data-work="back">← All scenarios</button>
          <div class="panel"><p class="eyebrow">${esc(labels[scenario.category])} · ${esc(scenario.level)} practice</p><h2 id="scenario-heading" tabindex="-1">${esc(scenario.title)}</h2><p class="muted">A fictional workplace situation. One small task is enough.</p>
          <h3>Read or listen</h3><p lang="de">${esc(scenario.reading)}</p><div class="button-row"><button class="secondary" type="button" data-work="listen">Listen in German</button><button class="text-button" type="button" data-work="reading">Record reading practice</button></div>
          <details><summary>English translation</summary><p>${esc(scenario.translation)}</p></details>
          <details><summary>Useful phrases and noun forms</summary><dl>${scenario.phrases.map(phrase => `<dt lang="de">${esc(phrase.de)}</dt><dd>${esc(phrase.en)}</dd>`).join('')}</dl></details></div>
          <div class="panel"><h3>Write a short response</h3><p>${esc(scenario.writePrompt)}</p><label for="scenario-writing">Your German draft</label><textarea id="scenario-writing" rows="4" maxlength="20000" lang="de">${esc(draft.writing || '')}</textarea>
          <p id="scenario-draft-status" class="muted" role="status" aria-live="polite">${edits.has(scenario.id) ? 'Draft has unsaved changes.' : draft.updated_at ? 'Saved draft restored from this device.' : 'Your draft saves on this device as you write.'}</p>
          <div class="button-row"><button class="secondary" type="button" data-work="save">Save draft</button><button class="text-button" type="button" data-work="model">${shownModels.has(scenario.id) ? 'Example response shown' : 'Show an example response'}</button></div>
          ${shownModels.has(scenario.id) ? `<div class="panel"><p class="eyebrow">One possible response</p><p lang="de">${esc(scenario.modelAnswer)}</p><p class="muted">Other wording may also be valid. This is not automatic writing assessment.</p><button class="text-button" type="button" data-work="listen-model">Listen to the example</button></div>` : ''}
          <details><summary>Try a fresh variation</summary><p>${esc(scenario.variation)}</p><label for="scenario-variation">Your new response</label><textarea id="scenario-variation" rows="4" maxlength="20000" lang="de">${esc(draft.variation || '')}</textarea></details>
          <button class="secondary" type="button" data-work="writing">Record my writing practice</button><p class="muted">Records your participation, not a score or word mastery.</p></div>
          <div class="panel"><h3>Speak and review for yourself</h3><p>${esc(scenario.speakPrompt)}</p><p class="muted">${esc(scenario.checklist[0])} No audio is recorded or sent.</p>
          <fieldset><legend>Your self-review</legend>${scenario.checklist.slice(1).map((check, index) => `<label><input type="checkbox" data-self-check="${index}"${reviewed?.checks?.includes(index) ? ' checked' : ''}> ${esc(check)}</label>`).join('')}</fieldset>
          <button class="secondary" type="button" data-work="speaking">Save my self-review</button>${reviewed ? '<p class="muted">Your previous self-review has been restored.</p>' : ''}</div>`;
        bind(detail, 'oninput', event => {
          if (event.target.id === 'scenario-writing') editDraft(scenario.id, 'writing', event.target.value);
          if (event.target.id === 'scenario-variation') editDraft(scenario.id, 'variation', event.target.value);
        });
        bind(detail, 'onclick', async event => {
          const button = event.target.closest('[data-work]');
          if (!button || !detail.contains(button)) return;
          const action = button.dataset.work;
          if (action === 'listen' || action === 'listen-model') { speak(action === 'listen' ? scenario.reading : scenario.modelAnswer); return; }
          if (action === 'save') { await saveDrafts(); return; }
          if (action === 'back') { if (await beforeLeave()) { selectedScenario = null; renderWork({ focus: 'overview' }); } return; }
          if (action === 'model' && shownModels.has(scenario.id)) return;
          const fields = { key: `${scenario.id}:${action}:${id()}`, source: `scenario-${action}`, item_id: scenario.id, score: null, assessment: 'self-reported', assisted: shownModels.has(scenario.id) };
          if (action === 'writing') {
            const text = draftFor(scenario.id);
            if (!(text.writing || '').trim() && !(text.variation || '').trim()) { status('Write a response first; there is no minimum length.'); byId('scenario-writing')?.focus(); return; }
            fields.answer = text.writing || ''; fields.variation = text.variation || '';
          }
          if (action === 'speaking') fields.checks = [...detail.querySelectorAll('[data-self-check]:checked')].map(input => Number(input.dataset.selfCheck));
          if (!['model', 'writing', 'speaking', 'reading'].includes(action)) return;
          button.disabled = true;
          const saved = await record(fields);
          button.disabled = false;
          if (!saved) return;
          if (action === 'model') shownModels.add(scenario.id);
          status(action === 'model' ? 'Example view saved. Compare ideas and wording, not an automatic score.' : 'Practice recorded on this device. Word mastery is unchanged.');
          renderWork();
        });
        if (focus === 'scenario') focusHeading(byId('scenario-heading'));
        else restoreTypingFocus(previousFocus);
      });
    }

    function items() { return selectedKind ? content[collections[selectedKind]].filter(item => levelFilter === 'all' || item.level === levelFilter) : []; }
    function title(item) { return item.title || item.sentence_de || item.en?.present || item.en || item.id; }
    function order(key, length) {
      if (!choiceOrder.has(key)) {
        const values = Array.from({ length }, (_, index) => index);
        for (let i = values.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; }
        choiceOrder.set(key, values);
      }
      return choiceOrder.get(key);
    }
    function feedback(attempt, expected, extra = '') {
      if (!attempt) return '';
      const headline = attempt.assessment === 'example-comparison'
        ? attempt.assisted ? 'Example viewed; no answer submitted.' : attempt.result === 'matches-example' ? 'Your answer matches this example.' : 'Compare your answer with this example.'
        : attempt.result === 'correct' ? 'Your first answer was correct.' : 'Your first answer needs another look.';
      return `<div class="panel" role="status" id="${esc(`optional-feedback-${attempt.id}`)}" tabindex="-1"><p><strong>${esc(headline)}</strong></p><p class="muted">First response saved. Later viewing does not replace it.</p>${typeof attempt.answer === 'string' && attempt.answer ? `<p>Your response: <span lang="de">${esc(attempt.answer)}</span></p>` : ''}<p${attempt.assessment === 'example-comparison' ? ' lang="de"' : ''}>${esc(expected)}</p>${extra}${attempt.assessment === 'example-comparison' ? '<p class="muted">Other translations may also be valid. This comparison is not a full language assessment.</p>' : ''}</div>`;
    }
    function questionMarkup(item, question, index) {
      const key = `story:${item.id}:${index}`, attempt = first(key);
      return `<form data-answer="story" data-question="${index}"><fieldset${attempt ? ' disabled' : ''}><legend>${index + 1}. ${esc(question.q)}</legend>${order(key, question.options.length).map(option => `<label><input type="radio" name="answer" value="${option}"${attempt?.answer === option ? ' checked' : ''} required> ${esc(question.options[option])}</label>`).join('')}</fieldset>${attempt ? '' : '<button class="secondary" type="submit">Save answer</button>'}${feedback(attempt, `Answer: ${question.options[question.answer]}`)}</form>`;
    }
    function itemMarkup(item) {
      if (selectedKind === 'story') return `<p class="muted">${esc(item.intro || '')} Reading comprehension is separate from unaided word recall.</p>${item.paragraphs.map(text => `<p lang="de">${esc(text)}</p>`).join('')}<button class="text-button" type="button" data-more="listen">Listen to the story</button><details><summary>Useful words</summary><dl>${(item.vocab || []).map(pair => `<dt lang="de">${esc(pair[1])}</dt><dd>${esc(pair[0])}</dd>`).join('')}</dl></details>${item.questions.map((question, index) => questionMarkup(item, question, index)).join('')}`;
      if (selectedKind === 'context') {
        const attempt = first(`context:${item.id}`);
        return `<p lang="de"><strong>${esc(item.sentence_de)}</strong></p><p>${esc(item.sentence_en)}</p><p>Select every option that fits. Several can be correct with different meanings.</p><form data-answer="context"><fieldset${attempt ? ' disabled' : ''}><legend>Which words fit?</legend>${order(`context:${item.id}`, item.options.length).map(index => `<label><input type="checkbox" name="answer" value="${index}"${attempt?.answer?.includes(index) ? ' checked' : ''}> <span lang="de">${esc(item.options[index].word_de)}</span></label>`).join('')}</fieldset>${attempt ? '' : '<button class="secondary" type="submit">Save choices</button>'}${feedback(attempt, 'Compare each option:', attempt ? `<ul>${item.options.map(option => `<li><span lang="de">${esc(option.word_de)}</span> — ${option.fits ? 'fits' : 'does not fit'}: ${esc(option.note || option.word_en)}</li>`).join('')}</ul>` : '')}</form>`;
      }
      const tense = selectedKind === 'tense', key = `${selectedKind}:${item.id}${tense ? `:${selectedTense}` : ''}`, attempt = first(key);
      const prompt = tense ? item.en[selectedTense] : item.en, expected = tense ? item.de[selectedTense] : item.de;
      const draft = draftFor(`optional:${key}`);
      const distinctPrompt = tense && prompt !== title(item) ? `<p id="optional-tense-prompt" tabindex="-1"><strong>${esc(prompt)}</strong></p>` : '';
      return `${tense ? `<label for="activity-tense">Time form</label><select id="activity-tense">${Object.entries(tenseNames).map(([value, label]) => `<option value="${value}"${value === selectedTense ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select><p class="muted">Verb: <span lang="de">${esc(item.infinitive)}</span></p>` : ''}${distinctPrompt}<form data-answer="${selectedKind}"><label for="activity-typed">Write it in German</label><textarea id="activity-typed" name="answer" rows="3" maxlength="20000" lang="de"${attempt ? ' disabled' : ''}>${esc(typeof attempt?.answer === 'string' ? attempt.answer : draft.answer || '')}</textarea>${attempt ? '' : `<p id="optional-draft-status" class="muted" role="status" aria-live="polite">${edits.has(`optional:${key}`) ? 'Draft has unsaved changes.' : draft.updated_at ? 'Saved draft restored from this device.' : 'Your draft saves on this device as you write.'}</p><div class="button-row"><button class="secondary" type="submit">Save and compare</button><button class="text-button" type="button" data-more="save-draft">Save draft</button><button class="text-button" type="button" data-more="reveal">Show example without answering</button></div>`}${feedback(attempt, expected, attempt && item.note ? `<p class="muted">${esc(item.note)}</p>` : '')}${attempt ? '<button class="text-button" type="button" data-more="listen">Listen to the example</button>' : ''}</form>`;
    }

    function renderMore({ focusId = null } = {}) {
      const root = byId('optional-practice');
      if (!root) return;
      const previousFocus = typingFocus(root);
      safeRender(root, () => {
        activityData(getDb());
        const list = items();
        if (selectedKind && !list.some(item => item.id === selectedItem)) selectedItem = list[0]?.id || null;
        const item = list.find(entry => entry.id === selectedItem);
        root.innerHTML = !selectedKind ? `<div class="panel"><h2 id="optional-overview-heading" tabindex="-1">Word practice</h2><p class="muted">Stop after any answer. These are optional sizes, not a commitment.</p><div class="button-row"><button class="secondary" type="button" data-words="recognition" data-size="continuous">Choose from word options</button><button class="text-button" type="button" data-words="typed" data-size="5">5 typed prompts</button><button class="text-button" type="button" data-words="typed" data-size="20">20 typed prompts</button></div><details><summary>Recognition round sizes</summary><div class="button-row"><button class="text-button" type="button" data-words="recognition" data-size="5">5 recognition prompts</button><button class="text-button" type="button" data-words="recognition" data-size="20">20 recognition prompts</button></div></details><p class="muted">Recognition answers are recorded separately from independent typed recall.</p></div><div class="scenario-grid">${Object.entries(kinds).map(([kind, label]) => `<article class="activity-card panel"><h2>${label}</h2><p class="muted">${content[collections[kind]].length} available. Pick one item and leave whenever you like.</p><button class="secondary" type="button" data-kind="${kind}">Open ${label.toLowerCase()}</button></article>`).join('')}</div>` : `<button class="text-button" type="button" data-more="back">← All optional practice</button><div class="panel"><h2 id="optional-kind-heading" tabindex="-1">${kinds[selectedKind]}</h2><div class="form-grid"><div><label for="activity-level">Level</label><select id="activity-level">${['all', 'A1', 'A2', 'B1', 'B2'].map(level => `<option value="${level}"${level === levelFilter ? ' selected' : ''}>${level === 'all' ? 'All levels' : level}</option>`).join('')}</select></div><div><label for="activity-item">Choose an item</label><select id="activity-item"${list.length ? '' : ' disabled'}>${list.map(entry => `<option value="${esc(entry.id)}"${entry.id === selectedItem ? ' selected' : ''}>${esc(entry.level)} · ${esc(title(entry))}</option>`).join('')}</select></div></div></div>${item ? `<article class="panel"><p class="eyebrow">${esc(item.level)} · optional ${esc(selectedKind)} practice</p><h3 id="optional-item-heading" tabindex="-1"${['story', 'context'].includes(selectedKind) ? ' lang="de"' : ''}>${esc(title(item))}</h3>${itemMarkup(item)}<div class="button-row"><button class="text-button" type="button" data-more="next">Next ${selectedKind === 'context' ? 'context' : selectedKind}</button></div><p class="muted">These results stay separate from word mastery. Stop after any answer.</p></article>` : '<p class="panel">No items at this level. Choose another level.</p>'}`;
        bind(root, 'onchange', async event => {
          if (!['activity-level', 'activity-item', 'activity-tense'].includes(event.target.id)) return;
          if (!(await beforeLeave())) { renderMore(); return; }
          if (event.target.id === 'activity-level') { levelFilter = event.target.value; selectedItem = null; }
          if (event.target.id === 'activity-item') selectedItem = event.target.value;
          if (event.target.id === 'activity-tense') selectedTense = event.target.value;
          renderMore({ focusId: event.target.id === 'activity-tense' && selectedTense !== 'present' ? 'optional-tense-prompt' : 'optional-item-heading' });
        });
        bind(root, 'oninput', event => {
          if (event.target.id !== 'activity-typed' || !item || !['sentence', 'tense'].includes(selectedKind)) return;
          const key = `${selectedKind}:${item.id}${selectedKind === 'tense' ? `:${selectedTense}` : ''}`;
          editOptionalDraft(`optional:${key}`, event.target.value);
        });
        bind(root, 'onclick', async event => {
          const button = event.target.closest('[data-more],[data-kind],[data-words]');
          if (!button || !root.contains(button)) return;
          if (button.dataset.more === 'listen' && item) { speak(selectedKind === 'story' ? item.paragraphs.join('\n\n') : selectedKind === 'tense' ? item.de[selectedTense] : item.de); return; }
          if (button.dataset.more === 'save-draft') { await saveDrafts(); return; }
          if (button.dataset.more === 'reveal' && item) { await submit(root, item, null, true); return; }
          if (!(await beforeLeave())) return;
          if (button.dataset.words) { await startWords({ mode: button.dataset.words, size: button.dataset.size === 'continuous' ? null : Number(button.dataset.size) }); return; }
          if (button.dataset.kind) { selectedKind = button.dataset.kind; selectedItem = null; levelFilter = 'all'; }
          if (button.dataset.more === 'back') { selectedKind = null; selectedItem = null; }
          if (button.dataset.more === 'next' && list.length) selectedItem = list[(list.findIndex(entry => entry.id === selectedItem) + 1) % list.length].id;
          renderMore({ focusId: button.dataset.kind ? 'optional-kind-heading' : button.dataset.more === 'back' ? 'optional-overview-heading' : 'optional-item-heading' });
        });
        bind(root, 'onsubmit', async event => {
          const form = event.target.closest('form[data-answer]');
          if (!form || !root.contains(form) || !item) return;
          event.preventDefault(); await submit(root, item, form, false);
        });
        if (focusId) focusHeading(byId(focusId) || byId('optional-kind-heading'));
        else restoreTypingFocus(previousFocus);
      });
    }

    async function submit(root, item, form, assisted) {
      const source = selectedKind;
      let key = `${source}:${item.id}`, answer, expected, result, score, assessment;
      let questionId = null;
      if (source === 'story') {
        const index = Number(form?.dataset.question), question = item.questions[index];
        const input = form?.querySelector('input[name="answer"]:checked');
        if (!question || !input) { status('Choose an answer first.'); return; }
        questionId = String(index); key += `:${index}`; answer = Number(input.value); expected = question.answer;
        result = answer === expected ? 'correct' : 'wrong'; score = { correct: Number(result === 'correct'), total: 1 }; assessment = 'reading-comprehension';
      } else if (source === 'context') {
        answer = [...form.querySelectorAll('input[name="answer"]:checked')].map(input => Number(input.value)).sort((a, b) => a - b);
        if (!answer.length) { status('Choose at least one option before saving.'); return; }
        expected = item.options.flatMap((option, index) => option.fits ? [index] : []);
        result = equal(answer, expected) ? 'correct' : 'wrong'; score = { correct: Number(result === 'correct'), total: 1 }; assessment = 'context-recognition';
      } else if (source === 'sentence' || source === 'tense') {
        if (source === 'tense') { questionId = selectedTense; key += `:${selectedTense}`; }
        answer = assisted ? '' : form?.querySelector('[name="answer"]')?.value || '';
        if (!assisted && !answer.trim()) { status('Write an answer, or choose to view the example without answering.'); return; }
        expected = source === 'tense' ? item.de[selectedTense] : item.de;
        result = !assisted && normal(answer) === normal(expected) ? 'matches-example' : 'compare-example'; score = null; assessment = 'example-comparison';
      } else return;
      if (first(key)) { renderMore({ focusId: `optional-feedback-${first(key).id}` }); return; }
      const controls = [...root.querySelectorAll('button[type="submit"],button[data-more="reveal"]')];
      controls.forEach(control => { control.disabled = true; });
      const saved = await record({ key, source, item_id: item.id, question_id: questionId, answer, expected, result, score, assessment, assisted }, true);
      controls.forEach(control => { control.disabled = false; });
      if (saved) { status('First response saved on this device.'); renderMore({ focusId: `optional-feedback-${first(key).id}` }); }
    }

    return Object.freeze({ renderWork, renderMore, beforeLeave, hasUnsaved });
  }
  return Object.freeze({ create });
})();
if (typeof module !== 'undefined') module.exports = CoachActivities;
