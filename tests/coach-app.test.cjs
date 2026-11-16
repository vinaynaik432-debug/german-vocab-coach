const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Content = require('../coach-content.js');
const Practice = require('../practice-engine.js');
const Recall = require('../recall-evidence.js');
const Review = require('../review-scheduler.js');
const Store = require('../coach-store.js');
const engine = Practice.create({ recallEvidence: Recall, reviewScheduler: Review });
const copy = value => JSON.parse(JSON.stringify(value));
const at = '2026-11-15T12:00:00.000Z';
const libraries = ['curriculum-data','frequency-data','learning-priorities','recall-evidence','backup-data','persistence',
  'practice-engine','practice-session','review-scheduler','practice-data','coach-content','coach-migration','coach-learning',
  'coach-store','marketing-scenarios','coach-csv','coach-activities'];
const scripts = libraries.map(name => new vm.Script(fs.readFileSync(require.resolve(`../${name}.js`), 'utf8')));
const source = fs.readFileSync(require.resolve('../coach-app.js'), 'utf8').replace('  boot();', `  globalThis.controller = {
    boot, flushDraft, renderPractice, beginScope, handlePracticeAction, submit, nextWord, navigate, previewBackup, restore, resetProgress,
    state: () => store.getState(), database: () => db, activity: () => activities, dirty: () => draftDirty,
    startCandidate, syncState, recognitionOptions, makeWord, action, renderWords, renderProgress, addWordDialog, confirmDialog, getStore: () => store
  };`);
const controllerScript = new vm.Script(source);

function fixture() {
  const data = Content.createSeed(at); data.words = data.words.slice(0, 3);
  let result = engine.initialize(data);
  result.practice.scope = { focus: 'all', wordIds: null };
  return result;
}
async function harness(initial = fixture(), options = {}) {
  const elements = new Map(), timers = new Map(), windowListeners = {}, documentListeners = {}, writes = [], downloads = [];
  let serial = 0, failMain = false, held = null, holdNext = false;
  const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  function element(id) {
    if (!elements.has(id)) {
      const item = { id, value: '', checked: false, hidden: false, disabled: false, textContent: '', dataset: {}, listeners: {}, attributes: {},
        classList: { contains: () => false }, addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); },
        setAttribute(key, value) { this.attributes[key] = value; }, toggleAttribute(key, value) { if (value) this.attributes[key] = ''; else delete this.attributes[key]; },
        focus() { this.focused = true; this.focusedWhileDisabled = this.disabled; document.activeElement = this; }, contains: () => true, querySelectorAll: () => [], showModal() { this.open = true; },
        close() { this.open = false; for (const listener of this.listeners.close || []) listener(); this.listeners.close = []; },
        click() { if (this.download) downloads.push(this.download); } };
      let html = '';
      Object.defineProperty(item, 'innerHTML', { get: () => html, set(value) {
        html = value; item.renderCount = (item.renderCount || 0) + 1;
        if (id === 'word-list') item.rowDetails = [...value.matchAll(/<details>/g)].map(() => ({ open: false }));
        if (id === 'practice-area') {
          for (const dynamic of ['practice-answer','answer-form','answer-validation','feedback-title',...Array.from({length:4},(_,i)=>`choice-option-${i}`)]) elements.delete(dynamic);
          let choice = 0;
          for (const match of value.matchAll(/<button class="choice-option"[^>]*data-answer="([^"]*)"/g)) element(`choice-option-${choice++}`).dataset.answer = decode(match[1]);
        }
        for (const match of value.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
          const nested = element(match[1]), initial = /\bvalue="([^"]*)"/.exec(match[0]);
          if (initial) nested.value = decode(initial[1]);
        }
      } });
      elements.set(id, item);
    }
    return elements.get(id);
  }
  for (const id of fs.readFileSync(require.resolve('../index.html'), 'utf8').matchAll(/\bid="([^"]+)"/g)) element(id[1]);
  element('acknowledge-invalid'); element('invalid-ack-label');
  for (const id of ['word-focus','word-topic','word-status','progress-focus']) element(id).value = 'all';
  const document = { body: { dataset: {} }, hidden: false, getElementById: id => elements.get(id) || null,
    querySelector(selector) {
      const heading = /^#page-(\w+) h1$/.exec(selector); if (heading) return element(`heading-${heading[1]}`);
      if (selector === '#practice-area .choice-option') return elements.get('choice-option-0') || null;
      if (selector.startsWith('#')) return elements.get(selector.slice(1)) || null;
      if (selector.startsWith('meta')) return element('theme-meta'); return null;
    },
    querySelectorAll(selector) {
      if (selector === '.page') return [...elements.values()].filter(item => item.id.startsWith('page-'));
      if (selector === '#practice-area input, #practice-area button') return ['practice-answer',...Array.from({length:4},(_,i)=>`choice-option-${i}`)].map(id => elements.get(id)).filter(Boolean);
      return [];
    },
    createElement: () => element(`created-${++serial}`), addEventListener(type, callback) { (documentListeners[type] ||= []).push(callback); } };
  const values = new Map([[Store.STORAGE_KEY, JSON.stringify(initial)],
    [`${Store.STORAGE_KEY}_metadata`, JSON.stringify({ version: 1, legacy_raw: null })],
    [`${Store.STORAGE_KEY}_legacy_source`, JSON.stringify({ format: 'german-vocab-coach-legacy-source', version: 1, raw: null })]]);
  if (options.raw !== undefined) values.set(Store.STORAGE_KEY, options.raw);
  const storage = { getItem: key => values.has(key) ? values.get(key) : null,
    setItem(key, value) { if (failMain && key === Store.STORAGE_KEY) throw new Error('Storage is full'); values.set(key, value); writes.push({ key, value }); } };
  const locks = { request(name, mode, callback) {
    if (!holdNext) return Promise.resolve().then(callback);
    holdNext = false; return new Promise((resolve, reject) => { held = () => { held = null; Promise.resolve().then(callback).then(resolve, reject); }; });
  } };
  const window = { localStorage: storage, addEventListener(type, callback) { (windowListeners[type] ||= []).push(callback); }, scrollTo() {} };
  const context = vm.createContext({ document, window, navigator: { locks: options.noLocks ? undefined : locks }, location: { hash: '#today' }, history: { replaceState() {} },
    crypto: { randomUUID: () => `id-${++serial}` }, Blob, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    setTimeout(callback) { const id = ++serial; timers.set(id, callback); return id; }, clearTimeout(id) { timers.delete(id); } });
  scripts.forEach(script => script.runInContext(context)); controllerScript.runInContext(context);
  const run = expression => vm.runInContext(expression, context);
  await run('controller.boot()');
  return { run, element, elements, values, writes, downloads, windowListeners,
    get db() { return copy(run('controller.database()')); }, get state() { return copy(run('controller.state()')); },
    input(value) { const target = element('practice-answer'); target.value = value; for (const callback of target.listeners.input || []) callback({ target }); },
    set fail(value) { failMain = value; }, hold() { holdNext = true; }, release() { assert.ok(held, 'An exclusive write is waiting'); held(); },
    async waitHeld() { for (let i = 0; i < 30 && !held; i++) await Promise.resolve(); assert.ok(held); },
    async event(id, property = 'onclick') { return element(id)[property](); } };
}

test('All my words changes the queue scope while keeping a valid persisted learning priority', async () => {
  const h = await harness(); await h.run("controller.beginScope({focus:'all',wordIds:null})");
  assert.equal(h.state.saved, true); assert.equal(h.state.writable, true);
  assert.equal(h.db.practice.scope.focus, 'all'); assert.equal(h.db.preferences.learningFocus, 'marketing');
});

test('a completed optional format does not restart on reload', async () => {
  const data = fixture(); data.practice.format = { mode: 'typed', size: 5, completed: 5 };
  const h = await harness(data);
  assert.equal(h.db.practice.pending, null);
  assert.match(h.element('practice-area').innerHTML, /Optional practice complete/);
  await h.run("controller.handlePracticeAction('extra')");
  assert.ok(h.db.practice.pending); assert.equal(h.db.practice.format.size, null);
});

test('exact one-word scope stops without filler and labels the selection in singular', async () => {
  const h = await harness(); const id = h.db.words[2].id;
  await h.run(`controller.beginScope({focus:'all',wordIds:[${JSON.stringify(id)}]})`);
  assert.equal(h.db.practice.pending.word_id, id);
  assert.match(h.element('practice-scope').innerHTML, /1 selected word\./);
  h.input(h.db.words[2].word_de); await h.run('controller.submit(document.querySelector("#practice-answer").value)');
  await h.run('controller.nextWord()');
  assert.equal(h.db.practice.pending, null); assert.equal(h.db.practice.attempts.length, 1);
});

test('a failed first response displays no saved feedback and retry keeps that exact response', async () => {
  const h = await harness(); const firstWord = h.db.practice.pending.word_id;
  h.input('falsch'); await h.run('controller.flushDraft()'); h.fail = true;
  await h.run("controller.submit('falsch')");
  assert.equal(h.db.practice.attempts.length, 0); assert.equal(h.state.pending.database.practice.attempts[0].result, 'wrong');
  assert.doesNotMatch(h.element('practice-area').innerHTML, /Saved · a useful learning moment/);
  h.fail = false; await h.event('retry-save');
  assert.equal(h.db.practice.attempts.length, 1); assert.equal(h.db.practice.attempts[0].word_id, firstWord);
  assert.equal(h.db.practice.attempts[0].answer, 'falsch'); assert.equal(h.db.practice.attempts[0].result, 'wrong');
  assert.match(h.element('practice-area').innerHTML, /Saved · a useful learning moment/);
});

test('newer text typed during a failed autosave survives exact retry and is saved before rendering', async () => {
  const h = await harness(); h.input('erste'); h.fail = true; h.hold();
  const save = h.run('controller.flushDraft()'); await h.waitHeld();
  h.input('erste Antwort vollständig'); h.release(); await save;
  assert.equal(h.state.pending.database.practice.pending.draft, 'erste');
  h.fail = false; await h.event('retry-save');
  assert.equal(h.db.practice.pending.draft, 'erste Antwort vollständig');
  assert.equal(h.element('practice-answer').value, 'erste Antwort vollständig');
  assert.equal(h.run('controller.dirty()'), false); assert.equal(h.db.practice.attempts.length, 0);
});

test('explicit submit locks typing until its answer is durably acknowledged', async () => {
  const h = await harness(); h.input('falsch'); await h.run('controller.flushDraft()'); h.hold();
  const submission = h.run("document.querySelector('#answer-form').listeners.submit[0]({preventDefault(){}})");
  await h.waitHeld(); assert.equal(h.element('practice-answer').disabled, true);
  h.release(); await submission;
  // The DOM event handler starts an asynchronous action; allow its promise chain to settle.
  for (let i = 0; i < 30 && h.db.practice.attempts.length === 0; i++) await Promise.resolve();
  assert.equal(h.db.practice.attempts.length, 1);
});

test('a saved hint returns keyboard focus only after the temporary input lock ends', async () => {
  const h = await harness();
  await h.run("controller.action(() => controller.handlePracticeAction('hint'))");
  assert.equal(h.element('practice-answer').focused, true);
  assert.equal(h.element('practice-answer').focusedWhileDisabled, false);
  assert.equal(h.element('practice-answer').disabled, false);
});

test('stop and resume preserve a partial draft without grading it', async () => {
  const h = await harness(); h.input('die Verant'); await h.event('stop-practice');
  assert.equal(h.db.practice.paused, true); assert.equal(h.db.practice.pending.draft, 'die Verant');
  const reopened = await harness(h.db); assert.match(reopened.element('practice-area').innerHTML, /Your place is saved/);
  await reopened.run("controller.handlePracticeAction('resume')");
  assert.equal(reopened.element('practice-answer').value, 'die Verant'); assert.equal(reopened.db.practice.attempts.length, 0);
});

test('theme switch preserves a partially typed draft, then flush saves it without an answer', async () => {
  const h = await harness(); h.input('noch nicht fertig');
  await h.run("controller.getStore().update(d => {d.preferences.theme='studio'})"); h.run('controller.syncState()');
  assert.equal(h.element('practice-answer').value, 'noch nicht fertig');
  await h.run('controller.flushDraft()'); assert.equal(h.db.practice.pending.draft, 'noch nicht fertig');
  assert.equal(h.db.practice.attempts.length, 0);
});

test('returning to Today while already there flushes the latest text before replacing the form', async () => {
  const h = await harness(); h.input('mein unvollständiger Entwurf');
  await h.run("controller.navigate('today')");
  assert.equal(h.element('practice-answer').value, 'mein unvollständiger Entwurf');
  assert.equal(h.db.practice.pending.draft, 'mein unvollständiger Entwurf');
  assert.equal(h.db.practice.attempts.length, 0);
  h.input('neuer Entwurf bleibt auch bei Fehler'); h.fail = true;
  await h.run("controller.navigate('today')");
  assert.equal(h.element('practice-answer').value, 'neuer Entwurf bleibt auch bei Fehler');
  assert.equal(h.state.pending.database.practice.pending.draft, 'neuer Entwurf bleibt auch bei Fehler');
});

test('switching scope with an unsubmitted correction asks before discarding it', async () => {
  const h = await harness(); await h.run("controller.submit('falsch')"); await h.run("controller.handlePracticeAction('correct')");
  h.input('meine Korrektur'); await h.run('controller.flushDraft()');
  const before = copy(h.db.practice); const changing = h.run("controller.beginScope({focus:'everyday',wordIds:null})");
  for (let i = 0; i < 30 && !h.element('app-dialog').open; i++) await Promise.resolve();
  assert.equal(h.element('app-dialog').open, true); h.element('dialog-cancel').onclick(); await changing;
  assert.deepEqual(h.db.practice, before);
});

test('read-only opening never creates or grades a new prompt', async () => {
  const h = await harness(fixture(), { noLocks: true });
  assert.equal(h.state.writable, false); assert.equal(h.db.practice.pending, null);
  assert.equal(h.writes.length, 0); assert.equal(h.element('recovery-panel').hidden, false);
});

test('repairing unreadable data requires the independent explicit acknowledgement', async () => {
  const h = await harness(fixture(), { raw: '{broken' });
  const backup = h.run(`PracticeData.create({backupData:BackupData,practiceEngine:PracticeEngine,reviewScheduler:ReviewScheduler}).stringify(JSON.parse(${JSON.stringify(JSON.stringify(fixture()))}),{exportedAt:new Date().toISOString()})`);
  h.run(`globalThis.backupFile={size:100,text:async()=>${JSON.stringify(backup)}}`);
  await h.run('controller.previewBackup(backupFile)');
  assert.equal(h.element('invalid-ack-label').hidden, false);
  h.element('acknowledge-restore').checked = true; h.element('acknowledge-restore').onchange();
  assert.equal(h.element('confirm-restore').disabled, true);
  await h.run('controller.restore()'); assert.equal(h.values.get(Store.STORAGE_KEY), '{broken');
  h.element('acknowledge-invalid').checked = true; h.element('acknowledge-invalid').onchange();
  assert.equal(h.element('confirm-restore').disabled, false);
  await h.run('controller.restore()'); assert.equal(h.state.saved, true);
  assert.equal(JSON.parse(h.values.get(`${Store.STORAGE_KEY}_before_restore`)).raw, '{broken');
});

test('activity retry saves newer in-memory writing revisions instead of recreating the activity owner', async () => {
  const h = await harness(); await h.run("controller.navigate('work')");
  await h.run("document.getElementById('scenario-list').onclick({target:{closest(){return {dataset:{scenario:MarketingScenarios[0].id}}}}})");
  h.run("document.getElementById('scenario-detail').oninput({target:{id:'scenario-writing',value:'erste Fassung'}})");
  h.fail = true; assert.equal(await h.run('controller.activity().beforeLeave()'), false);
  const scenario = h.run('MarketingScenarios[0].id');
  assert.equal(h.state.pending.database.activities.drafts[scenario].writing, 'erste Fassung');
  h.run("document.getElementById('scenario-detail').oninput({target:{id:'scenario-writing',value:'vollständige neuere Fassung'}})");
  h.fail = false; await h.event('retry-save');
  assert.equal(h.db.activities.drafts[scenario].writing, 'vollständige neuere Fassung');
  assert.equal(h.run('controller.activity().hasUnsaved()'), false);
  assert.match(h.element('scenario-detail').innerHTML, /vollständige neuere Fassung/);
});

test('a successful restore retry dismisses its obsolete preview and activates the restored queue', async () => {
  const h = await harness(), replacement = fixture(); replacement.profile.name = 'Restored learner';
  const backup = h.run(`PracticeData.create({backupData:BackupData,practiceEngine:PracticeEngine,reviewScheduler:ReviewScheduler}).stringify(JSON.parse(${JSON.stringify(JSON.stringify(replacement))}),{exportedAt:new Date().toISOString()})`);
  h.run(`globalThis.backupFile={size:100,text:async()=>${JSON.stringify(backup)}}`);
  await h.run('controller.previewBackup(backupFile)'); h.element('acknowledge-restore').checked = true;
  h.fail = true; await h.run('controller.restore()'); assert.equal(h.state.pending.kind, 'restore');
  h.fail = false; await h.event('retry-save');
  assert.equal(h.db.profile.name, 'Restored learner'); assert.equal(h.state.saved, true);
  assert.equal(h.element('restore-preview').hidden, true); assert.equal(h.element('restore-file').value, '');
  assert.ok(h.db.practice.pending);
  await h.run('controller.restore()'); assert.equal(h.state.saved, true);
});

test('reset refuses a newer other-tab word and profile instead of resetting a stale clone over them', async () => {
  const h = await harness(), reset = h.run('controller.resetProgress()');
  for (let i = 0; i < 30 && !h.element('app-dialog').open; i++) await Promise.resolve();
  assert.equal(h.element('app-dialog').open, true);
  const newer = h.db; newer.profile.name = 'Changed in other tab';
  newer.words.push({ ...copy(newer.words[0]), id: 'other-tab-word', word_en: 'new meaning', word_de: 'das Neue' });
  const raw = JSON.stringify(newer); h.values.set(Store.STORAGE_KEY, raw);
  h.element('dialog-confirm').onclick();
  await assert.rejects(reset, /changed in another tab/);
  assert.equal(h.values.get(Store.STORAGE_KEY), raw);
  assert.equal(h.values.has(`${Store.STORAGE_KEY}_before_restore`), false);
});

test('recognition choices exclude accepted aliases and custom nouns retain their part of speech', async () => {
  const data = fixture();
  data.words[0].word_de = 'die Conversion-Rate'; data.words[0].accepted_answers = ['die Konversionsrate'];
  data.words[1].word_de = 'die Konversionsrate';
  const h = await harness(data);
  const options = copy(h.run('controller.recognitionOptions(controller.database().words[0])'));
  assert.ok(options.includes('die Conversion-Rate')); assert.ok(!options.includes('die Konversionsrate'));
  assert.equal(h.run("controller.makeWord({word_en:'the approval',word_de:'die Freigabe'}).part_of_speech"), 'noun');
});

test('checking a word updates selection controls without replacing its focused checkbox or open details', async () => {
  const h = await harness(); await h.run("controller.navigate('words')");
  const list = h.element('word-list'), renders = list.renderCount, details = list.rowDetails[0]; details.open = true;
  const checkbox = h.element('test-word-checkbox'); checkbox.dataset.selectWord = h.db.words[0].id; checkbox.checked = true; checkbox.focus();
  list.listeners.change[0]({ target: checkbox });
  assert.equal(list.renderCount, renders); assert.equal(list.rowDetails[0], details); assert.equal(details.open, true);
  assert.equal(h.run('document.activeElement.id'), 'test-word-checkbox');
  assert.equal(h.element('practice-selected').textContent, 'Practise selected (1)');
  checkbox.checked = false; list.listeners.change[0]({ target: checkbox });
  assert.equal(list.renderCount, renders); assert.equal(h.element('practice-selected').disabled, true);
});

test('recognition starts with keyboard focus on its first enabled German choice', async () => {
  const h = await harness();
  await h.run("controller.action(() => controller.beginScope({focus:'all',wordIds:null},{mode:'recognition',size:5}))");
  assert.equal(h.element('choice-option-0').focused, true);
  assert.equal(h.element('choice-option-0').focusedWhileDisabled, false);
  assert.match(h.element('practice-area').innerHTML, /class="choice-option" lang="de"/);
});

test('actual page changes focus the heading and clear obsolete success messages while retaining recovery messages', async () => {
  const h = await harness(); h.element('global-status').textContent = 'Old success'; h.element('global-status').hidden = false;
  await h.run("controller.navigate('words')");
  assert.equal(h.element('heading-words').focused, true); assert.equal(h.element('heading-words').attributes.tabindex, '-1');
  assert.equal(h.element('global-status').textContent, ''); assert.equal(h.element('global-status').hidden, true);
  const readonly = await harness(fixture(), { noLocks: true }); readonly.element('global-status').textContent = 'Recovery is needed';
  await readonly.run("controller.navigate('settings')");
  assert.equal(readonly.element('heading-settings').focused, true);
  assert.equal(readonly.element('global-status').textContent, 'Recovery is needed');
});

test('both native dialog forms provide the stable accessible title', async () => {
  const h = await harness(); h.run('controller.addWordDialog()');
  assert.match(h.element('dialog-content').innerHTML, /<h2 id="dialog-title">Add a useful word<\/h2>/);
  h.element('add-word-close').onclick();
  const confirmation = h.run("controller.confirmDialog('Review this change','Keep your earlier data safe','Continue')");
  assert.match(h.element('dialog-content').innerHTML, /<h2 id="dialog-title">Review this change<\/h2>/);
  h.element('dialog-cancel').onclick(); assert.equal(await confirmation, false);
});

test('duplicate and failed new-word saves announce an error inside the open dialog and retain the entry', async () => {
  const h = await harness(); h.run('controller.addWordDialog()');
  h.element('add-en').value = h.db.words[0].word_en; h.element('add-de').value = h.db.words[0].word_de;
  h.element('add-word-form').onsubmit({ preventDefault() {} });
  for (let i = 0; i < 30 && !h.element('add-word-error').textContent; i++) await Promise.resolve();
  assert.match(h.element('add-word-error').textContent, /already in your collection/);
  assert.match(h.element('dialog-content').innerHTML, /id="add-word-error"[^>]+role="status"[^>]+aria-live="polite"/);
  assert.equal(h.element('app-dialog').open, true);
  await new Promise(resolve => setImmediate(resolve));
  h.element('add-en').value = 'a new useful meaning'; h.element('add-de').value = 'die neue Bedeutung';
  h.element('add-topic').value = 'custom'; h.fail = true;
  h.element('add-word-form').onsubmit({ preventDefault() {} });
  for (let i = 0; i < 80 && !h.element('add-word-error').textContent.includes('not saved'); i++) await Promise.resolve();
  assert.match(h.element('add-word-error').textContent, /not saved yet/);
  assert.equal(h.element('app-dialog').open, true); assert.equal(h.element('add-de').value, 'die neue Bedeutung');
  assert.equal(h.state.pending.database.words.at(-1).word_de, 'die neue Bedeutung');
});

test('German content declares its language and the evidence table supports keyboard scrolling', async () => {
  const h = await harness(); assert.match(h.element('practice-area').innerHTML, /id="practice-answer" lang="de"/);
  await h.run("controller.submit('falsch')");
  assert.match(h.element('practice-area').innerHTML, /class="correct-answer" lang="de"/);
  assert.match(h.element('practice-area').innerHTML, /class="example-block"><p lang="de"/);
  await h.run("controller.navigate('words')"); assert.match(h.element('word-list').innerHTML, /class="word-german" lang="de"/);
  await h.run("controller.navigate('progress')");
  assert.match(h.element('progress-content').innerHTML, /class="table-scroll" tabindex="0" role="region" aria-label="Practice evidence table"/);
  assert.match(h.element('progress-content').innerHTML, /saved activity records/);
  assert.doesNotMatch(h.element('progress-content').innerHTML, /saved activity responses/);
});
