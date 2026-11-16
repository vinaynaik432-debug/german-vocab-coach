const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const content = require('../coach-content.js');
const scenarios = require('../marketing-scenarios.js');
const copy = value => JSON.parse(JSON.stringify(value));

function harness(initial) {
  let db = copy(initial || { words: [{ id: 'protected', recall: { version: 1, attempts: 0 }, status: 'new' }], profile: {} });
  let fail = false, writes = 0;
  const messages = [], starts = [], audio = [], focusEvents = [], scrollEvents = [], elements = new Map();
  const document = { getElementById: element, activeElement: null };
  function element(id) {
    if (!elements.has(id)) elements.set(id, { id, tagName: 'DIV', innerHTML: '', textContent: '', hidden: false, contains: () => true,
      focus(options) { document.activeElement = this; focusEvents.push({ id, options: copy(options || {}) }); },
      scrollIntoView(options) { scrollEvents.push({ id, options: copy(options) }); },
      setSelectionRange(start, end, direction) { this.selectionStart = start; this.selectionEnd = end; this.selectionDirection = direction; },
      querySelector: selector => selector === 'h1' ? element(`${id}-heading`) : null, querySelectorAll: () => [] });
    return elements.get(id);
  }
  const context = vm.createContext({ document, setTimeout: () => 1, clearTimeout() {}, content, scenarios,
    getDb: () => copy(db), update: async mutator => { writes++; if (fail) return false; const candidate = copy(db); mutator(candidate); db = candidate; return true; },
    status: message => messages.push(message), speak: text => audio.push(text), startWords: async options => starts.push(copy(options)) });
  vm.runInContext(fs.readFileSync(require.resolve('../coach-activities.js'), 'utf8'), context);
  const controller = vm.runInContext('CoachActivities.create({content,scenarios,getDb,update,status,speak,startWords})', context);
  const click = async (id, dataset) => { const button = { dataset, closest() { return this; }, disabled: false }; await element(id).onclick({ target: button }); };
  const submit = async ({ question = '0', radio = '1', checked = [], answer = '' } = {}) => {
    const form = { dataset: { question }, closest() { return this; }, querySelector: selector => selector.includes('input') ? { value: radio } : { value: answer }, querySelectorAll: () => checked.map(value => ({ value: String(value) })) };
    await element('optional-practice').onsubmit({ target: form, preventDefault() {} });
  };
  return { controller, element, click, submit, messages, starts, audio, focusEvents, scrollEvents, document, get db() { return copy(db); }, get writes() { return writes; }, set fail(value) { fail = value; } };
}

test('browsing work and optional cards does not write or expose writing examples', async () => {
  const h = harness(); h.controller.renderWork(); h.controller.renderMore();
  assert.equal((h.element('scenario-list').innerHTML.match(/data-scenario=/g) || []).length, 12);
  await h.click('scenario-list', { scenario: scenarios[0].id });
  assert.match(h.element('scenario-detail').innerHTML, /Show an example response/);
  assert.ok(!h.element('scenario-detail').innerHTML.includes(scenarios[0].modelAnswer));
  assert.equal(h.writes, 0);
  assert.equal(h.controller.hasUnsaved(), false);
});

test('first MC answer is saved before feedback and survives a failed save plus changed resubmission', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'story' });
  assert.doesNotMatch(h.element('optional-practice').innerHTML, /Your first answer|Answer: To the supermarket/);
  h.fail = true; await h.submit({ radio: '1' });
  assert.equal(h.db.activities, undefined);
  assert.doesNotMatch(h.element('optional-practice').innerHTML, /Your first answer/);
  assert.equal(h.controller.hasUnsaved(), true);
  assert.equal(await h.controller.beforeLeave(), false);
  h.fail = false; await h.submit({ radio: '0' });
  const saved = h.db.activities.attempts;
  assert.equal(saved.length, 1); assert.equal(saved[0].answer, 1); assert.equal(saved[0].result, 'wrong');
  assert.match(h.element('optional-practice').innerHTML, /Your first answer needs another look/);
  assert.deepEqual(h.db.words, [{ id: 'protected', recall: { version: 1, attempts: 0 }, status: 'new' }]);
  await h.submit({ radio: '0' }); assert.equal(h.db.activities.attempts.length, 1);
});

test('context records all selected options separately from story scoring', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'context' });
  assert.doesNotMatch(h.element('optional-practice').innerHTML, /A Termin can/);
  await h.submit({ checked: [0, 1, 2] });
  const attempt = h.db.activities.attempts[0];
  assert.equal(attempt.source, 'context'); assert.equal(attempt.assessment, 'context-recognition');
  assert.deepEqual(attempt.answer, [0, 1, 2]); assert.deepEqual(attempt.score, { correct: 1, total: 1 });
  assert.match(h.element('optional-practice').innerHTML, /A Termin can/);
});

test('optional typed drafts flush on leave and resume without inventing an attempt', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'sentence' });
  h.element('optional-practice').oninput({ target: { id: 'activity-typed', value: 'Ich habe einen Tisch' } });
  assert.equal(h.controller.hasUnsaved(), true);
  assert.equal(await h.controller.beforeLeave(), true);
  assert.equal(h.controller.hasUnsaved(), false);
  assert.equal(h.db.activities.drafts['optional:sentence:sentence-reservation-table'].answer, 'Ich habe einen Tisch');
  assert.equal(h.db.activities.attempts.length, 0);
  const reopened = harness(h.db); reopened.controller.renderMore(); await reopened.click('optional-practice', { kind: 'sentence' });
  assert.match(reopened.element('optional-practice').innerHTML, /Ich habe einen Tisch<\/textarea>/);
  assert.match(reopened.element('optional-practice').innerHTML, /Saved draft restored/);
});

test('sentence alternatives receive example comparison without an inaccurate language score', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'sentence' });
  assert.ok(!h.element('optional-practice').innerHTML.includes(content.sentences[0].de));
  await h.submit({ answer: 'Für zwei Personen habe ich einen Tisch reserviert.' });
  const attempt = h.db.activities.attempts[0];
  assert.equal(attempt.source, 'sentence'); assert.equal(attempt.result, 'compare-example'); assert.equal(attempt.score, null);
  assert.match(h.element('optional-practice').innerHTML, /Other translations may also be valid/);
  assert.ok(h.element('optional-practice').innerHTML.includes(content.sentences[0].de));
});

test('tense forms have independent first-answer keys and reveals do not earn a score', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'tense' });
  await h.submit({ answer: content.tenses[0].de.present });
  await h.element('optional-practice').onchange({ target: { id: 'activity-tense', value: 'past' } });
  assert.ok(!h.element('optional-practice').innerHTML.includes(content.tenses[0].de.past));
  await h.click('optional-practice', { more: 'reveal' });
  const attempts = h.db.activities.attempts;
  assert.equal(attempts.length, 2);
  assert.match(attempts[0].key, /:present$/); assert.equal(attempts[0].result, 'matches-example');
  assert.match(attempts[1].key, /:past$/); assert.equal(attempts[1].assisted, true); assert.equal(attempts[1].score, null);
  assert.match(h.element('optional-practice').innerHTML, /Example viewed; no answer submitted/);
});

test('scenario drafts, model views and self-reviews are separate from mastery', async () => {
  const h = harness(); h.controller.renderWork(); await h.click('scenario-list', { scenario: scenarios[0].id });
  h.element('scenario-detail').oninput({ target: { id: 'scenario-writing', value: '<script>draft</script>' } });
  assert.equal(await h.controller.beforeLeave(), true);
  h.controller.renderWork(); assert.match(h.element('scenario-detail').innerHTML, /&lt;script&gt;draft&lt;\/script&gt;/);
  h.fail = true; await h.click('scenario-detail', { work: 'model' });
  assert.ok(!h.element('scenario-detail').innerHTML.includes(scenarios[0].modelAnswer));
  h.fail = false; await h.controller.beforeLeave(); await h.click('scenario-detail', { work: 'model' });
  assert.ok(h.element('scenario-detail').innerHTML.includes(scenarios[0].modelAnswer));
  h.element('scenario-detail').querySelectorAll = () => [{ dataset: { selfCheck: '0' } }];
  await h.click('scenario-detail', { work: 'speaking' });
  const review = h.db.activities.attempts.find(item => item.source === 'scenario-speaking');
  assert.equal(review.assessment, 'self-reported'); assert.equal(review.score, null); assert.deepEqual(review.checks, [0]);
  assert.equal(h.db.words[0].recall.attempts, 0);
});

test('word buttons pass the requested mode and size without activity writes', async () => {
  const h = harness(); h.controller.renderMore();
  await h.click('optional-practice', { words: 'recognition', size: 'continuous' });
  await h.click('optional-practice', { words: 'typed', size: '5' });
  await h.click('optional-practice', { words: 'recognition', size: '20' });
  assert.deepEqual(h.starts, [{ mode: 'recognition', size: null }, { mode: 'typed', size: 5 }, { mode: 'recognition', size: 20 }]);
  assert.equal(h.writes, 0);
});

test('unsupported activity history remains intact and reports recovery instead of replacement', () => {
  const original = { words: [], activities: { version: 99, future: 'preserve' } };
  const h = harness(original); h.controller.renderMore();
  assert.match(h.element('optional-practice').innerHTML, /supported migration/);
  assert.deepEqual(h.db, original); assert.equal(h.writes, 0);
});

test('opening optional kinds, items and overview places focus at the visible heading', async () => {
  const h = harness(); h.controller.renderMore();
  assert.equal(h.focusEvents.length, 0);
  await h.click('optional-practice', { kind: 'sentence' });
  assert.deepEqual(h.focusEvents.at(-1), { id: 'optional-kind-heading', options: { preventScroll: false } });
  assert.deepEqual(h.scrollEvents.at(-1), { id: 'optional-kind-heading', options: { block: 'start', behavior: 'auto' } });
  await h.element('optional-practice').onchange({ target: { id: 'activity-item', value: content.sentences[1].id } });
  assert.equal(h.focusEvents.at(-1).id, 'optional-item-heading');
  await h.click('optional-practice', { more: 'next' });
  assert.equal(h.scrollEvents.at(-1).id, 'optional-item-heading');
  await h.click('optional-practice', { more: 'back' });
  assert.equal(h.focusEvents.at(-1).id, 'optional-overview-heading');
});

test('sentence prompt appears once in its activity panel and changed tense prompts remain visible', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'sentence' });
  const panel = h.element('optional-practice').innerHTML.split('<article class="panel">')[1];
  assert.equal(panel.split(content.sentences[0].en).length - 1, 1);
  assert.match(panel, /id="optional-item-heading" tabindex="-1"/);
  await h.click('optional-practice', { more: 'back' }); await h.click('optional-practice', { kind: 'tense' });
  await h.element('optional-practice').onchange({ target: { id: 'activity-tense', value: 'past' } });
  assert.ok(h.element('optional-practice').innerHTML.includes(content.tenses[0].en.past));
  assert.equal(h.focusEvents.at(-1).id, 'optional-tense-prompt');
});

test('draft saving never moves typing focus and passive rerender restores the caret without scrolling', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'sentence' });
  const input = h.element('activity-typed'); input.tagName = 'TEXTAREA'; input.selectionStart = 4; input.selectionEnd = 7; input.selectionDirection = 'forward'; input.focus();
  h.element('optional-practice').oninput({ target: { id: 'activity-typed', value: 'Ich habe einen Tisch' } });
  const focusCount = h.focusEvents.length, scrollCount = h.scrollEvents.length;
  await h.controller.beforeLeave();
  assert.equal(h.focusEvents.length, focusCount); assert.equal(h.scrollEvents.length, scrollCount);
  h.controller.renderMore();
  assert.deepEqual(h.focusEvents.at(-1), { id: 'activity-typed', options: { preventScroll: true } });
  assert.equal(input.selectionStart, 4); assert.equal(input.selectionEnd, 7); assert.equal(h.scrollEvents.length, scrollCount);
});

test('scenario entry and return focus the new heading while work draft saves stay put', async () => {
  const h = harness(); h.controller.renderWork(); await h.click('scenario-list', { scenario: scenarios[0].id });
  assert.equal(h.focusEvents.at(-1).id, 'scenario-heading');
  const input = h.element('scenario-writing'); input.tagName = 'TEXTAREA'; input.selectionStart = input.selectionEnd = 3; input.focus();
  h.element('scenario-detail').oninput({ target: { id: 'scenario-writing', value: 'Der Lead' } });
  const focusCount = h.focusEvents.length;
  await h.controller.beforeLeave(); assert.equal(h.focusEvents.length, focusCount);
  h.controller.renderWork(); assert.deepEqual(h.focusEvents.at(-1), { id: 'scenario-writing', options: { preventScroll: true } });
  await h.click('scenario-detail', { work: 'back' }); assert.equal(h.focusEvents.at(-1).id, 'page-work-heading');
});

test('saved optional answers focus their feedback instead of a removed submit button', async () => {
  const h = harness(); h.controller.renderMore(); await h.click('optional-practice', { kind: 'sentence' });
  await h.submit({ answer: content.sentences[0].de });
  assert.equal(h.focusEvents.at(-1).id, `optional-feedback-${h.db.activities.attempts[0].id}`);
  assert.equal(h.focusEvents.at(-1).options.preventScroll, false);
});
