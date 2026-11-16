const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const CSV = require('../coach-csv.js');
const content = require('../coach-content.js');
const word = (overrides = {}) => ({ word_en: 'the approval', word_de: 'die Freigabe', part_of_speech: 'noun', topic: 'marketing', difficulty: 'B1', notes: '', ...overrides });

test('quoted commas, escaped quotes, BOM and CRLF preserve the text exactly', () => {
  const input = '\uFEFFEnglish,German,notes\r\n"  approval, consent  ","die Freigabe","Say ""bitte""\r\nThen wait."\r\n\r\n';
  assert.deepEqual(CSV.parse(input), [{ word_en: '  approval, consent  ', word_de: 'die Freigabe', part_of_speech: '', topic: '', difficulty: '', notes: 'Say "bitte"\r\nThen wait.' }]);
});

test('common header aliases map to word fields without trimming entered word text', () => {
  assert.deepEqual(CSV.parse('Englisch,Deutsch,Wortart,Thema,Niveau,Notizen\nhello,hallo,interjection,alltag,A1, informal '), [word({ word_en: 'hello', word_de: 'hallo', part_of_speech: 'interjection', topic: 'alltag', difficulty: 'A1', notes: ' informal ' })]);
  assert.equal(CSV.parse('English word,German word\nx,y')[0].word_de, 'y');
});

test('old CSV history, status, IDs and counters are ignored even when malformed', () => {
  const input = 'id,word_en,word_de,status,correct_streak,times_seen,recall,exposure,review,legacy_mastery\nold-id,approval,die Freigabe,mastered,999,500,{broken,{future,{unknown,{legacy';
  const parsed = CSV.parse(input)[0];
  assert.deepEqual(Object.keys(parsed), ['word_en', 'word_de', 'part_of_speech', 'topic', 'difficulty', 'notes']);
  assert.equal(parsed.word_de, 'die Freigabe');
});

test('accepted alternatives use a validated JSON string array and round-trip', () => {
  const original = word({ accepted_answers: ['die Zustimmung', 'das Okay'], notes: 'Keep alternatives separate.' });
  assert.deepEqual(CSV.parse(CSV.stringify([original])), [original]);
  const encodedString = word({ accepted_answers: JSON.stringify(['die Zustimmung']) });
  assert.deepEqual(CSV.parse(CSV.stringify([encodedString]))[0].accepted_answers, ['die Zustimmung']);
  for (const invalid of ['not JSON', '"just one string"', '[42]', '[""]', '[null]']) {
    const quoted = `"${invalid.replaceAll('"', '""')}"`;
    assert.throws(() => CSV.parse(`word_en,word_de,accepted_answers\nx,y,${quoted}`), /accepted_answers/);
  }
});

test('formula-like cells are protected and known exports decode without losing genuine apostrophes', () => {
  const risky = ['=1+1', '+SUM(A1)', '-12', '@SUM(A1)', '  =2+2', '\tformula', '\rline', '\nline', '＝1+1', "'literal", "''two"];
  for (const text of risky) {
    const original = word({ word_en: text, notes: text });
    const csv = CSV.stringify([original]);
    assert.ok(csv.includes('"\'' + text.replaceAll('"', '""') + '"'), text);
    assert.match(csv, /_coach_csv_encoding/);
    assert.deepEqual(CSV.parse(csv), [original]);
  }
});

test('unmarked external apostrophes are never stripped and unsupported markers fail closed', () => {
  assert.equal(CSV.parse("word_en,word_de\n'=1+1,die Formel")[0].word_en, "'=1+1");
  assert.equal(CSV.parse("word_en,word_de\n'hello,hallo")[0].word_en, "'hello");
  assert.throws(() => CSV.parse('word_en,word_de,_coach_csv_encoding\nx,y,future-v9'), /unsupported spreadsheet text encoding/);
  assert.throws(() => CSV.parse("word_en,word_de,_coach_csv_encoding\n'hello,hallo,apostrophe-v1"), /marker does not match/);
});

test('duplicate, empty, alias-conflicting and missing required headers are rejected', () => {
  for (const input of ['English,word_en,German\nx,x,y', 'word_en,word_de,Notes,notes\nx,y,a,b', 'word_en,word_de,\nx,y,z', 'English,notes\nx,y']) {
    assert.throws(() => CSV.parse(input), /header/);
  }
});

test('invalid rows reject the entire import with row or line context', () => {
  const valid = 'word_en,word_de,difficulty\nhello,hallo,A1\n';
  assert.throws(() => CSV.parse(valid + 'missing,,B1'), /row 3.*word_de is empty/);
  assert.throws(() => CSV.parse(valid + 'too,many,B1,columns'), /row 3.*expected 3 columns but found 4/);
  assert.throws(() => CSV.parse(valid + 'hard,schwer,C2'), /row 3.*difficulty/);
  assert.throws(() => CSV.parse('word_en,word_de,part_of_speech\nx,y,unsupported'), /part_of_speech/);
  assert.throws(() => CSV.parse('word_en,word_de\nx,\u0000y'), /control character/);
  assert.throws(() => CSV.parse('word_en,word_de\n"",y'), /word_en is empty/);
});

test('malformed quotation never silently changes a word or creates a partial import', () => {
  for (const input of ['word_en,word_de\n"hello,hallo', 'word_en,word_de\nhel"lo,hallo', 'word_en,word_de\n"hello"x,hallo', 'word_en,word_de\n"hello" ,hallo']) {
    assert.throws(() => CSV.parse(input), /CSV line/);
  }
  assert.throws(() => CSV.parse(null), /must be text/);
  assert.throws(() => CSV.parse('\uFEFF\r\n'), /empty/);
  assert.deepEqual(CSV.parse('word_en,word_de\r\n'), []);
});

test('20 MiB UTF-8 and 50000-row limits reject instead of truncating', () => {
  assert.throws(() => CSV.parse('x'.repeat(CSV.MAX_BYTES + 1)), /20 MiB/);
  assert.throws(() => CSV.parse('ä'.repeat(CSV.MAX_BYTES / 2 + 1)), /20 MiB/);
  assert.equal(CSV.parse('word_en,word_de\n' + 'x,y\n'.repeat(CSV.MAX_ROWS)).length, CSV.MAX_ROWS);
  assert.throws(() => CSV.parse('word_en,word_de\n' + 'x,y\n'.repeat(CSV.MAX_ROWS + 1)), /50,000-row/);
  assert.throws(() => CSV.stringify(Array(CSV.MAX_ROWS + 1).fill(word())), /50,000-row/);
  assert.throws(() => CSV.stringify([word({ notes: 'ä'.repeat(CSV.MAX_BYTES / 2) })]), /20 MiB/);
});

test('export selects only word-list fields and does not read irrelevant history accessors', () => {
  const original = word({ id: 'keep-out', status: 'mastered', recall: { version: 999 }, review: { future: true } });
  let read = false;
  Object.defineProperty(original, 'history', { enumerable: true, get() { read = true; throw new Error('not word content'); } });
  const csv = CSV.stringify([original]);
  assert.equal(read, false);
  assert.doesNotMatch(csv, /mastered|recall|keep-out|future/);
  assert.deepEqual(CSV.parse(csv), [word()]);
  const accessor = word(); Object.defineProperty(accessor, 'word_de', { get() { read = true; return 'bad'; } });
  assert.throws(() => CSV.stringify([accessor]), /accessor/); assert.equal(read, false);
});

test('the complete current vocabulary exports and imports as word content only', () => {
  const words = content.createSeed().words;
  const parsed = CSV.parse(CSV.stringify(words));
  assert.equal(parsed.length, words.length);
  assert.ok(parsed.every(item => !Object.hasOwn(item, 'status') && !Object.hasOwn(item, 'recall')));
  assert.equal(parsed[0].word_de, words[0].word_de);
});

test('browser global CoachCSV works without CommonJS or TextEncoder', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../coach-csv.js'), 'utf8'), context);
  assert.equal(vm.runInContext('CoachCSV.parse("English,German\\nx,y")[0].word_de', context), 'y');
  const text = vm.runInContext('CoachCSV.stringify([{word_en:"=1+1",word_de:"die Formel"}])', context);
  assert.equal(CSV.parse(text)[0].word_en, '=1+1');
});
