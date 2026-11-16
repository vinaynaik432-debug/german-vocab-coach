const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const scenarios = require('../marketing-scenarios.js');
const curriculum = require('../curriculum-data.js');

test('twelve unique scenarios cover every existing marketing category twice', () => {
  assert.equal(scenarios.length, 12);
  assert.equal(new Set(scenarios.map(scenario => scenario.id)).size, 12);
  for (const category of Object.keys(curriculum.categories)) {
    assert.equal(scenarios.filter(scenario => scenario.category === category).length, 2, category);
  }
});

test('every scenario supplies complete reading, writing, speaking and transfer content', () => {
  for (const scenario of scenarios) {
    for (const key of ['id', 'title', 'category', 'level', 'reading', 'translation', 'writePrompt', 'modelAnswer', 'speakPrompt', 'variation']) {
      assert.equal(typeof scenario[key], 'string', `${scenario.id}.${key}`);
      assert.ok(scenario[key].trim(), `${scenario.id}.${key} is empty`);
      assert.doesNotMatch(scenario[key], /<\/?(?:script|iframe|img|a|div)\b/i);
    }
    assert.ok(['B1', 'B2'].includes(scenario.level));
    assert.notEqual(scenario.reading, scenario.translation);
    assert.notEqual(scenario.variation, scenario.writePrompt);
    assert.notEqual(scenario.modelAnswer, scenario.reading);
    assert.ok(scenario.phrases.length >= 6);
    assert.equal(new Set(scenario.phrases.map(phrase => phrase.de)).size, scenario.phrases.length);
    for (const phrase of scenario.phrases) {
      assert.ok(phrase.de?.trim() && phrase.en?.trim(), `${scenario.id} has an incomplete phrase`);
    }
    const nounForms = scenario.phrases.filter(phrase => /^(der|die|das) .+; die .+/.test(phrase.de));
    assert.ok(nounForms.length >= 3, `${scenario.id} needs articles and plural forms`);
  }
});

test('speaking explicitly uses self-review and has concrete checks without scoring claims', () => {
  for (const scenario of scenarios) {
    assert.ok(Array.isArray(scenario.checklist) && scenario.checklist.length >= 4);
    assert.match(scenario.checklist[0], /Self-review only.*does not automatically grade/);
    for (const check of scenario.checklist.slice(1)) assert.ok(check.trim().endsWith('?'), `${scenario.id}: ${check}`);
    assert.doesNotMatch(scenario.speakPrompt, /automatically (?:grade|score)|guaranteed|native[- ]level/i);
  }
});

test('curriculum references resolve to real marketing words, including each scenario domain', () => {
  const words = new Map(curriculum.words.map(word => [word.curriculum_id, word]));
  for (const scenario of scenarios) {
    assert.ok(scenario.curriculumWordIds.length >= 4);
    assert.equal(new Set(scenario.curriculumWordIds).size, scenario.curriculumWordIds.length);
    for (const id of scenario.curriculumWordIds) {
      assert.equal(words.get(id)?.domain, 'marketing', `${scenario.id} has unknown vocabulary link ${id}`);
    }
    assert.ok(scenario.curriculumWordIds.some(id => words.get(id).category === scenario.category));
  }
});

test('fictional conversion example computes the stated rate using visits as denominator', () => {
  const scenario = scenarios.find(item => item.id === 'marketing-metrics-conversion');
  const visits = Number(scenario.reading.match(/(\d+) Besuche/)[1]);
  const forms = Number(scenario.reading.match(/(\d+) abgeschickte Kontaktformulare/)[1]);
  const rate = Number(scenario.reading.match(/:\s*(\d+) Prozent/)[1]);
  assert.equal(forms / visits * 100, rate);
  assert.match(scenario.reading, /fiktiven Wochenbericht/);
  assert.match(scenario.reading, /Als Conversion gilt hier ein abgeschicktes Formular/);
  assert.match(scenario.translation, /500 visits.*25 submitted contact forms/);
  assert.match(scenario.modelAnswer, /5 Prozent/);
  assert.match(scenario.variation, /800 landing-page visits and 24 submitted forms/);
});

test('fictional ad example uses impressions for CTR and ad spend for CPC', () => {
  const scenario = scenarios.find(item => item.id === 'marketing-metrics-ad-report');
  const germanNumber = value => Number(value.replaceAll('.', '').replace(',', '.'));
  const impressions = germanNumber(scenario.reading.match(/([\d.]+) Impressionen/)[1]);
  const clicks = germanNumber(scenario.reading.match(/([\d.]+) Klicks/)[1]);
  const cost = germanNumber(scenario.reading.match(/([\d.,]+) Euro Werbekosten/)[1]);
  const rate = germanNumber(scenario.reading.match(/Klickrate beträgt ([\d,]+) Prozent/)[1]);
  const cpc = germanNumber(scenario.reading.match(/Kosten pro Klick liegen bei ([\d,]+) Euro/)[1]);
  assert.equal(clicks / impressions * 100, rate);
  assert.equal(cost / clicks, cpc);
  assert.match(scenario.reading, /fiktiver Anzeigenbericht/);
  assert.match(scenario.reading, /noch nicht, wie viele Käufe/);
  assert.match(scenario.translation, /20,000 impressions, 400 clicks and €200/);
  assert.match(scenario.variation, /10,000 impressions, 300 clicks and €180/);
});

test('browser and CommonJS exports expose identical data without runtime dependencies', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../marketing-scenarios.js'), 'utf8'), context);
  const browserData = JSON.parse(vm.runInContext('JSON.stringify(MarketingScenarios)', context));
  assert.deepEqual(browserData, scenarios);
});
