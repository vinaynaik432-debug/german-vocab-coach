const test = require('node:test');
const assert = require('node:assert/strict');
const { appHarness } = require('./harness.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
const dbKey = 'vinay_german_vocab_coach_v1';
const day = n => `2026-11-${String(n).padStart(2,'0')}T12:00:00.000Z`;
function attempt(h, result='correct', mode='typed') {
  h.run(`activeRound={id:'test-'+Date.now(),roundSize:1,mode:'${mode}',sessionMode:'marketing',retryOnly:false};applyResults([{word:db.words[0],answer:'test',result:'${result}'}])`);
}

test('actual typed result handler requires delayed recall; choice and exposure cannot confer mastery',()=>{
  const h=appHarness(null,{now:day(10)});
  for(let i=0;i<5;i++)attempt(h,'correct','choice');
  h.run(`for(let i=0;i<5;i++){applyStoryExposure([db.words[0]],100);applySentenceExposure([db.words[0]],100);applySentenceExposure([db.words[0]],100,'tense');}`);
  assert.equal(h.run('RecallEvidence.count(db.words[0])'),0);
  assert.equal(h.run('db.words[0].status'),'learning');
  for(let i=0;i<5;i++)attempt(h);
  assert.equal(h.run('RecallEvidence.count(db.words[0])'),1);
  h.setNow(day(11));attempt(h);assert.equal(h.run('db.words[0].status'),'learning');
  h.setNow(day(12));attempt(h);assert.equal(h.run('db.words[0].status'),'mastered');
  assert.equal(h.run('db.words[0].exposure.sources.choice.correct'),5);
  assert.equal(h.run('db.words[0].recall.attempts'),7);
  h.run('applyStoryExposure([db.words[0]],0)');
  assert.equal(h.run('db.words[0].status'),'mastered');
  attempt(h,'half');attempt(h);
  assert.equal(h.run('db.words[0].status'),'learning');
  assert.equal(h.run('RecallEvidence.count(db.words[0])'),0);
});

test('context results record exposure only and preserve direct recall failures',()=>{
  const h=appHarness(null,{now:day(10)});
  h.run(`const drill=contextDrills[0];const contextWord=ensureContextWord(drill.options.find(x=>x.fits),drill);RecallEvidence.record(contextWord,{result:'wrong',at:new Date().toISOString()});for(let i=0;i<4;i++)applyContextExposure([{drill,exact:true}]);`);
  assert.equal(h.run('contextWord.status'),'learning');
  assert.equal(h.run('contextWord.recall.attempts'),1);
  assert.equal(h.run('contextWord.last_result'),'wrong');
  assert.equal(h.run('contextWord.wrong_count'),1);
});

test('legacy mastery is relabelled once without deleting counters or sessions',()=>{
  const old=plain(appHarness().run('db'));old.version=5;
  old.words[0].status='mastered';old.words[0].correct_streak=19;old.words[0].times_seen=27;delete old.words[0].recall;
  const h=appHarness(old);const migrated=plain(h.run('db'));
  assert.equal(migrated.words[0].status,'learning');
  assert.equal(migrated.words[0].correct_streak,19);
  assert.equal(migrated.words[0].times_seen,27);
  assert.equal(migrated.words[0].legacy_mastery.status,'mastered');
  assert.deepEqual(plain(appHarness(migrated).run('db')),migrated);
  h.run(`moveWordToStatus(db.words[0],'mastered')`);
  assert.equal(h.run('db.words[0].status'),'learning');
  assert.equal(h.run(`getStatusMeta('learning').action`),'Practise recall');
});

test('full backup restores complete retained history, settings and verified recall; keeps a pre-restore safety copy',()=>{
  const h=appHarness(null,{now:day(10)});
  for(const n of [10,11,12]){h.setNow(day(n));attempt(h);}
  h.run(`saveProfileSetup('Backup learner','B1');db.profile.weeklyGoal=55;db.preferences.learningFocus='everyday';db.preferences.extraSetting='preserved';for(let i=0;i<220;i++)db.sessions.push({round_id:'historic-'+i,date:'2026-10-01T12:00:00.000Z',mode:'quick',score_correct:3,score_total:5});saveDb();const fullText=BackupData.stringify(db);`);
  const expected=plain(h.run('db'));assert.equal(expected.sessions.length,223);
  h.run(`db.profile.name='Current learner';db.words[0].notes='current state';saveDb();`);
  const before=plain(h.run('db'));h.run(`const staged=prepareBackupRestore(fullText)`);
  assert.deepEqual(plain(h.run('db')),before);
  h.run(`commitBackupRestore(staged)`);
  assert.deepEqual(plain(h.run('db')),expected);
  assert.deepEqual(JSON.parse(h.stored.get(dbKey)),expected);
  assert.deepEqual(JSON.parse(h.stored.get(dbKey+'_before_restore')).database,before);
  assert.deepEqual(plain(appHarness(expected).run('db')),expected);
});

test('a failed restore write leaves both live data and main saved data unchanged',()=>{
  const h=appHarness();h.run(`const candidate=BackupData.create(db);candidate.database.profile.name='Replacement';saveDb();const oldSerialized=JSON.stringify(db);storage.set=()=>{throw new Error('quota');}`);
  const old=h.run('oldSerialized');
  assert.throws(()=>h.run('commitBackupRestore(candidate)'),/quota/);
  assert.equal(h.run('JSON.stringify(db)'),old);
  assert.equal(h.stored.get(dbKey),old);
  assert.equal(JSON.stringify(JSON.parse(h.stored.get(dbKey+'_before_restore')).database),old);
});

test('invalid preview and cancellation never replace the current database',async()=>{
  const h=appHarness();const before=JSON.stringify(plain(h.run('db')));
  await h.run(`previewFullBackupRestore({target:{files:[{size:3,text:async()=>'{no'}],value:'x'}})`);
  assert.equal(h.run('pendingBackupRestore'),null);
  assert.equal(JSON.stringify(plain(h.run('db'))),before);
  h.run('pendingBackupRestore=BackupData.create(db);cancelFullBackupRestore()');
  assert.equal(h.run('pendingBackupRestore'),null);
  assert.equal(JSON.stringify(plain(h.run('db'))),before);
});

test('an older CSV cannot roll back current evidence or promote an unverified word',async()=>{
  const h=appHarness(null,{now:day(10)});attempt(h);
  const before=plain(h.run('db.words[0]'));
  h.run(String.raw`const oldCsv=toCsvRow(['word_en','word_de','status','times_seen','correct_streak'])+'\n'+toCsvRow([db.words[0].word_en,db.words[0].word_de,'mastered',0,99]);`);
  await h.run(`importCsv({target:{files:[{text:async()=>oldCsv}],value:'x'}})`);
  assert.deepEqual(plain(h.run('db.words[0]')),before);
  h.run(String.raw`const injectedCsv='word_en,word_de,status,correct_streak\nnew custom,neuartig,mastered,999'`);
  await h.run(`importCsv({target:{files:[{text:async()=>injectedCsv}],value:'x'}})`);
  assert.equal(h.run(`db.words.find(w=>w.word_de==='neuartig').status`),'learning');
  assert.equal(h.run(`RecallEvidence.count(db.words.find(w=>w.word_de==='neuartig'))`),0);
});

test('a slow previously selected restore file cannot overwrite a newer preview or a cancellation',async()=>{
  const h=appHarness();
  h.run(`let finishSlow;const slowText=BackupData.stringify(db);const fastDb=BackupData.validateDatabase(db);fastDb.profile.name='Latest selection';const fastText=BackupData.stringify(fastDb);`);
  const slow=h.run(`previewFullBackupRestore({target:{files:[{name:'slow.json',text:()=>new Promise(resolve=>{finishSlow=resolve})}],value:'a'}})`);
  await h.run(`previewFullBackupRestore({target:{files:[{name:'fast.json',text:async()=>fastText}],value:'b'}})`);
  h.run('finishSlow(slowText)');await slow;
  assert.equal(h.run('pendingBackupRestore.database.profile.name'),'Latest selection');
  assert.match(h.elements.get('#restorePreviewSummary').textContent,/fast.json/);
  const cancelled=h.run(`previewFullBackupRestore({target:{files:[{text:()=>new Promise(resolve=>{finishSlow=resolve})}],value:'c'}})`);
  h.run('cancelFullBackupRestore();finishSlow(slowText)');await cancelled;
  assert.equal(h.run('pendingBackupRestore'),null);
});

test('malformed legacy CSV counters cannot poison the full backup',async()=>{
  const h=appHarness();
  h.run(String.raw`const malformed='word_en,word_de,wrong_count,half_count,correct_streak,times_seen,created_at\ncustom,benutzerdefiniert,nope,-8,Infinity,2.5,not-a-date'`);
  await h.run(`importCsv({target:{files:[{text:async()=>malformed}],value:'x'}})`);
  assert.doesNotThrow(()=>h.run('BackupData.stringify(db)'));
  assert.equal(h.run(`db.words.find(w=>w.word_de==='benutzerdefiniert').times_seen`),2);
});

test('restore refuses to overwrite more recent saved data from another tab',()=>{
  const h=appHarness();h.run('const restoreCandidate=BackupData.create(db)');
  const otherTab=plain(h.run('db'));otherTab.words[0].times_seen=99;
  const external=JSON.stringify(otherTab);h.stored.set(dbKey,external);
  assert.throws(()=>h.run('commitBackupRestore(restoreCandidate)'),/another tab/);
  assert.equal(h.stored.get(dbKey),external);
  assert.equal(h.stored.has(dbKey+'_before_restore'),false);
});
