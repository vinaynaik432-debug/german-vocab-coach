const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const BackupData = require('../backup-data.js');

function database() {
  return {
    version: 6,
    created_at: '2026-05-29T09:00:00.000Z',
    words: [{
      id: 'custom-marketing-1', word_en: 'the conversion rate', word_de: 'die Conversion-Rate',
      part_of_speech: 'noun', topic: 'marketing', status: 'learning',
      correct_streak: 2, times_seen: 8, wrong_count: 1, half_count: 1,
      difficulty: 'B1', notes: 'A custom note with ä, ö, ü and ß.',
      created_at: '2026-06-01T12:00:00.000Z', curriculum_id: 'marketing-metrics-03',
      accepted_answers: ['die Konversionsrate'],
      recall: { version: 1, correctDates: ['2026-11-10', '2026-11-13'], firstAttempt: true },
    }],
    sessions: Array.from({length: 230}, (_, i) => ({
      round_id: `round-${i}`, date: new Date(Date.UTC(2026, 10, 1, 0, i)).toISOString(),
      score_correct: 4.5, score_total: 5, accuracy: 90, words_ids: ['custom-marketing-1'],
      mode: 'marketing', level: 'B1', count_new: 0, count_learning: 1, count_mastered_review: 0,
      retry_only: false, first_attempt_accuracy: 80,
    })),
    profile: {
      name: 'Example learner', hasChosenName: true, hasChosenLevel: true, level: 'B1', weeklyGoal: 45,
      modeLevels: {vocab:'B1', story:'A2', context:'B1', sentence:'A2', tense:'B1'},
    },
    preferences: {learningFocus:'marketing', futureSetting:{enabled:true}},
    futureMetadata: {mode:'preserve', values:[null, true, 4, 'text']},
  };
}

const exportedAt = '2026-11-16T16:00:00.000Z';
const options = {exportedAt, maxDatabaseVersion:6};

test('full backup round trip retains words, every session, profile, preferences and extensible recall data', () => {
  const original = database();
  const text = BackupData.stringify(original, options);
  const restored = BackupData.parse(text, options);
  assert.equal(restored.format, BackupData.FORMAT);
  assert.equal(restored.format_version, 1);
  assert.equal(restored.exported_at, exportedAt);
  assert.deepEqual(restored.database, original);
  assert.equal(restored.database.sessions.length, 230);
  restored.database.words[0].recall.correctDates.push('2026-11-16');
  assert.equal(original.words[0].recall.correctDates.length, 2);
});

test('preview describes the imported file without touching the current database', () => {
  const current = database();
  const original = JSON.stringify(current);
  const summary = BackupData.preview(BackupData.create(current, options), options);
  assert.equal(summary.learnerName, 'Example learner');
  assert.equal(summary.wordCount, 1);
  assert.equal(summary.sessionCount, 230);
  assert.equal(summary.learningFocus, 'marketing');
  assert.deepEqual(summary.counts, {new:0, learning:1, mastered:0});
  assert.equal(summary.firstSessionAt, current.sessions[0].date);
  assert.equal(summary.lastSessionAt, current.sessions.at(-1).date);
  assert.equal(JSON.stringify(current), original);
});

test('invalid JSON, CSV, wrong app, future envelope and future DB versions are rejected', () => {
  assert.throws(() => BackupData.parse('{broken'), /not valid JSON/);
  assert.throws(() => BackupData.parse('word_en,word_de\na,b'), /not valid JSON/);
  const envelope = BackupData.create(database(), options);
  for (const candidate of [null, [], {}, {...envelope,format:'another-app'}]) {
    assert.throws(() => BackupData.parse(JSON.stringify(candidate)), /full backup/);
  }
  assert.throws(() => BackupData.parse(JSON.stringify({...envelope,format_version:2})), /format is not supported/);
  envelope.database.version = 7;
  assert.throws(() => BackupData.parse(JSON.stringify(envelope), options), /newer app version/);
});

test('missing or malformed essential sections cannot replace a complete database', () => {
  for (const key of ['words','sessions','profile','preferences','created_at']) {
    const db = database(); delete db[key];
    assert.throws(() => BackupData.create(db, options), Error, key);
  }
  for (const [key,value] of [['words',{}],['sessions',null],['profile',[]],['preferences','marketing']]) {
    const db = database(); db[key] = value;
    assert.throws(() => BackupData.create(db, options), Error, key);
  }
});

test('duplicate identifiers, empty words and corrupt progress counters are rejected', () => {
  const duplicate = database(); duplicate.words.push({...duplicate.words[0]});
  assert.throws(() => BackupData.create(duplicate, options), /duplicate word/);
  for (const [key,value] of [['word_de',''],['word_en',null],['times_seen',-1],['wrong_count','4'],['correct_streak',1.2],['half_count',NaN],['status','fluent']]) {
    const db = database(); db.words[0][key] = value;
    assert.throws(() => BackupData.create(db, options), Error, key);
  }
});

test('bad profile settings and malformed session histories are rejected', () => {
  const corrupt = [
    db => {db.profile.modeLevels.vocab='C3';},
    db => {db.profile.weeklyGoal=-5;},
    db => {db.profile.hasChosenName='yes';},
    db => {db.preferences.learningFocus='unknown';},
    db => {db.sessions[0].date='yesterday';},
    db => {db.sessions[0].date='2026-02-30T00:00:00.000Z';},
    db => {db.sessions[0].accuracy=105;},
    db => {db.sessions[0].score_correct=8;},
    db => {db.sessions[0].words_ids='custom-marketing-1';},
  ];
  for (const change of corrupt) {const db=database();change(db);assert.throws(() => BackupData.create(db, options));}
});

test('prototype-polluting keys are rejected recursively without mutating the runtime', () => {
  const base = JSON.stringify(BackupData.create(database(), options));
  const malicious = base.replace('"futureMetadata":{', '"futureMetadata":{"__proto__":{"polluted":true},');
  assert.throws(() => BackupData.parse(malicious, options), /reserved property/);
  const constructor = base.replace('"futureMetadata":{', '"futureMetadata":{"constructor":{"prototype":{"polluted":true}},');
  assert.throws(() => BackupData.parse(constructor, options), /reserved property/);
  assert.equal({}.polluted, undefined);
});

test('export rejects values JSON would silently lose, circular data and accessor properties', () => {
  for (const value of [undefined, Infinity, NaN, () => {}, Symbol('bad')]) {
    const db=database();db.futureMetadata.value=value;
    assert.throws(() => BackupData.create(db, options));
  }
  const circular=database();circular.futureMetadata.self=circular;
  assert.throws(() => BackupData.create(circular, options), /circular/);
  const accessor=database();let accessed=false;
  Object.defineProperty(accessor.futureMetadata,'secret',{enumerable:true,get(){accessed=true;return 'secret';}});
  assert.throws(() => BackupData.create(accessor, options), /accessor/);
  assert.equal(accessed,false);
  const sparse=database();sparse.futureMetadata.values=[1,,3];
  assert.throws(() => BackupData.create(sparse, options), /incomplete/);
  const decorated=database();decorated.futureMetadata.values.note='not JSON array data';
  assert.throws(() => BackupData.create(decorated, options), /unsupported list/);
});

test('oversized files and excessive nesting fail before producing a restore candidate', () => {
  assert.throws(() => BackupData.parse(' '.repeat(BackupData.MAX_TEXT_BYTES + 1)), /20 MB limit/);
  const db=database();let branch=db.futureMetadata;
  for(let i=0;i<70;i++){branch.child={};branch=branch.child;}
  assert.throws(() => BackupData.create(db, options), /nested too deeply/);
});

test('UTF-8 BOM and historical word references are safely preserved', () => {
  const db=database();db.sessions[0].words_ids.push('removed-long-ago');
  const backup=BackupData.parse('\uFEFF'+BackupData.stringify(db,options),options);
  assert.deepEqual(backup.database,db);
});

test('the same helper works as a plain browser script without CommonJS or TextEncoder', () => {
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../backup-data.js'),'utf8'),context);
  context.input=database();
  const serialized=vm.runInContext(`BackupData.stringify(input,{exportedAt:'${exportedAt}'})`,context);
  assert.deepEqual(BackupData.parse(serialized,options).database,database());
});
