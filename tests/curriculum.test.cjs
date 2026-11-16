const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {appHarness}=require('./harness.cjs');
const curriculum=require('../curriculum-data.js');
const frequency=require('../frequency-data.js');
const priority=require('../learning-priorities.js');
const plain=x=>JSON.parse(JSON.stringify(x));

test('marketing curriculum covers six areas with examples and stable unique identifiers',()=>{
  const words=curriculum.words.filter(w=>w.domain==='marketing');
  assert.equal(words.length,120);
  for(const category of Object.keys(curriculum.categories))assert.equal(words.filter(w=>w.category===category).length,20);
  assert.equal(new Set(curriculum.words.map(w=>w.curriculum_id)).size,curriculum.words.length);
  assert.ok(words.every(w=>w.example_de && w.example_en && w.accepted_answers.every(x=>typeof x==='string')));
});
test('frequency data uses real distinct estimates and retains source and licence',()=>{
  assert.equal(frequency.version,'3.1.1');
  assert.equal(frequency.author,'Robyn Speer');
  assert.equal(frequency.license,'CC BY-SA 4.0');
  assert.ok(frequency.notice.includes('SUBTLEX'));
  assert.ok(frequency.values.sein > frequency.values.aufenthaltstitel);
  assert.equal(priority.frequency({word_de:'die Conversion-Rate'},frequency),null);
  assert.equal(priority.frequency({word_de:'einen Lead an den Vertrieb übergeben'},frequency),null);
  assert.equal(priority.frequency({word_de:'das Nichtvorhandenewort'},frequency),null);
  assert.equal(priority.frequencyKey('sich bewerben'),'bewerben');
  assert.equal(priority.frequencyKey('die Zielgruppe'),'zielgruppe');
});
test('migration preserves old progress, custom words, sessions, and profile; repeated load is idempotent',()=>{
  const base=appHarness().run('createSeedDb()');
  const old=plain(base);old.version=4;delete old.preferences;
  old.words=old.words.filter(w=>!w.id.startsWith('curriculum-'));
  old.words.forEach(w=>delete w.curriculum_id);
  old.words[0].correct_streak=9;old.words[0].status='mastered';old.words[0].times_seen=22;
  old.words.push({id:'my-custom',word_en:'my custom word',word_de:'mein eigenes Wort',status:'learning',times_seen:6});
  old.profile.name='Existing learner';old.profile.hasChosenName=true;old.sessions=[{round_id:'historic',mode:'quick',score_correct:4,score_total:5}];
  const h=appHarness(old);const upgraded=plain(h.run('db'));
  assert.equal(upgraded.words.find(w=>w.id===old.words[0].id).correct_streak,9);
  assert.equal(upgraded.words.find(w=>w.id==='my-custom').times_seen,6);
  assert.equal(upgraded.profile.name,'Existing learner');assert.equal(upgraded.sessions[0].round_id,'historic');
  assert.equal(upgraded.preferences.learningFocus,'marketing');
  const reloaded=plain(appHarness(upgraded).run('db'));
  assert.deepEqual(reloaded,upgraded);
  assert.equal(new Set(upgraded.words.map(w=>w.id)).size,upgraded.words.length);
  assert.equal(h.run('db.words.filter(isMarketingWord).length'),120);
});
test('existing focus survives saving profile settings and reloading',()=>{
  const h=appHarness();h.run(`db.preferences.learningFocus='everyday';saveProfileName('Test');saveWeeklyGoal(40);saveProfileLevel('B2');saveDb()`);
  assert.equal(appHarness(plain(h.run('db'))).run('getLearningFocus()'),'everyday');
});
test('invalid saved data is retained for recovery instead of silently overwritten',()=>{
  const raw='{not valid JSON';const h=appHarness(null,{raw});
  h.run('saveDb()');
  assert.equal(h.stored.get('vinay_german_vocab_coach_v1'),raw);
  assert.equal(h.run('storage.persistent'),false);
  assert.ok(h.run('storage.warning').includes('recovery'));
});
test('quota failure during upgrade keeps old saved data and current word progress',()=>{
  const old=plain(appHarness().run('createSeedDb()'));old.version=4;old.words[0].times_seen=42;
  const original=JSON.stringify(old);const h=appHarness(old,{failWrites:true});
  h.run('saveDb()');
  assert.equal(h.stored.get('vinay_german_vocab_coach_v1'),original);
  assert.equal(h.run('db.words[0].times_seen'),42);
  assert.equal(h.run('storage.persistent'),false);
});
test('first-time A1 setup actually applies A1 to every mode',()=>{
  const h=appHarness();h.run(`saveProfileSetup('Test','A1')`);
  assert.deepEqual(plain(h.run('Object.values(db.profile.modeLevels)')),['A1','A1','A1','A1','A1']);
});
test('first mission gives earliest marketing priorities; categories remain isolated even when filling',()=>{
  const h=appHarness();
  const picked=plain(h.run(`pickRound({size:8,mission:true}).map(w=>wordCurriculum(w))`));
  assert.ok(picked.every(x=>x.domain==='marketing'&&x.priority===1));
  assert.deepEqual(picked.map(x=>x.order).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
  for(const category of Object.keys(curriculum.categories)){
    const result=plain(h.run(`pickRound({size:20,scope:'marketing',category:'${category}'}).map(w=>wordCurriculum(w).category)`));
    assert.equal(result.length,20);assert.ok(result.every(x=>x===category));
  }
});
test('new marketing material moves to later stages after earlier material is introduced',()=>{
  const h=appHarness();
  h.run(`db.words.filter(w=>isMarketingWord(w)&&wordCurriculum(w).priority===1).forEach(w=>{w.status='mastered';w.correct_streak=3;})`);
  const newStages=plain(h.run(`pickRound({size:5,scope:'marketing'}).filter(w=>w.bucket==='new').map(w=>wordCurriculum(w).priority)`));
  assert.ok(newStages.length>0);assert.ok(newStages.every(x=>x===2));
});
test('everyday new words are highest frequency in the eligible bank with no specialist filler',()=>{
  const h=appHarness();h.run(`db.profile.modeLevels.vocab='A1'`);
  const got=plain(h.run(`pickRound({scope:'everyday',size:20})`));
  assert.equal(got.length,20);
  for(const w of got){assert.ok(!curriculum.words.find(e=>e.curriculum_id===w.curriculum_id&&e.domain==='marketing'));}
  assert.ok(h.run(`pickRound({scope:'everyday',size:20}).every(w=>wordLevelIndex(w)<=levelIndex('A1'))`));
  const expected=plain(h.run(`db.words.filter(w=>!isMarketingWord(w)&&wordLevelIndex(w)<=levelIndex('A1')).sort((a,b)=>compareNewWords(a,b,'everyday')).slice(0,20).map(w=>w.id)`));
  assert.deepEqual(got.map(w=>w.id).sort(),expected.sort());
});
test('changing the context level does not alter vocabulary priority',()=>{
  const h=appHarness();const before=h.run(`levelFitScore({difficulty:'B1'})`);
  h.run(`db.profile.modeLevels.context='A1'`);
  assert.equal(h.run(`levelFitScore({difficulty:'B1'})`),before);
});
test('learning and mastered review slots survive frequency ordering',()=>{
  const h=appHarness();h.run(`db.words.slice(0,7).forEach(w=>{w.status='learning';w.wrong_count=1;});db.words.slice(7,12).forEach(w=>{w.status='mastered';w.correct_streak=3;})`);
  const buckets=plain(h.run(`pickRound({size:20}).reduce((out,w)=>(out[w.bucket]=(out[w.bucket]||0)+1,out),{})`));
  assert.deepEqual(buckets,{learning:7,new:8,mastered:5});
});
test('correct answers update actual stored words, including new scoped round sessions',()=>{
  const h=appHarness();h.run(`const selected=pickRound({size:5,scope:'marketing',category:'metrics'});activeRound={id:'test-round',roundSize:5,sessionMode:'marketing',mode:'typed',retryOnly:false};applyResults(selected.map(word=>({word,answer:word.word_de,result:'correct'})));saveDb()`);
  assert.equal(h.run(`db.words.filter(w=>isMarketingWord(w)&&w.times_seen===1).length`),5);
  assert.equal(h.run(`db.sessions.at(-1).mode`),'marketing');
  assert.equal(h.run(`db.sessions.at(-1).score_correct`),5);
});
test('curated alternatives are accepted and article omissions still count as partial',()=>{
  const h=appHarness();
  assert.equal(h.run(`gradeAnswer('die Konversionsrate',db.words.find(w=>w.word_de==='die Conversion-Rate')).result`),'correct');
  assert.equal(h.run(`gradeAnswer('das Creative',db.words.find(w=>w.word_de==='das Werbemittel')).result`),'correct');
  assert.equal(h.run(`gradeAnswer('das Meeting',db.words.find(w=>w.word_de==='die Besprechung')).result`),'correct');
  assert.equal(h.run(`gradeAnswer('Zielgruppe',db.words.find(w=>w.word_de==='die Zielgruppe')).result`),'half');
});
test('multiple choice never includes the correct displayed answer twice or a listed synonym as a distractor',()=>{
  const h=appHarness();
  assert.ok(h.run(`(()=>{const w=db.words.find(w=>w.word_de==='die Rechnung');for(let i=0;i<100;i++){const options=getChoiceOptions(w);if(new Set(options.map(o=>normalizeAnswer(o.word_de))).size!==options.length)return false;}return true;})()`));
  h.run(`const target=db.words.find(w=>w.word_de==='die Conversion-Rate');db.words=[target,normalizeWordRecord({id:'synonym',word_de:'die Konversionsrate',word_en:'conversion rate',part_of_speech:'noun'}),...db.words.filter(w=>w.id!==target.id).slice(0,3)]`);
  assert.ok(h.run(`getChoiceOptions(target).every(w=>w.word_de!=='die Konversionsrate')`));
});
test('CSV round-trip carries progress and accepted alternatives without duplicating the curriculum',async()=>{
  const h=appHarness();h.run(`let csvResult='';downloadText=(name,text)=>{csvResult=text};const w=db.words.find(w=>w.word_de==='die Conversion-Rate');w.status='learning';w.times_seen=6;w.correct_streak=2;exportCsv()`);
  const csv=h.run('csvResult');
  const target=appHarness();target.run(`globalThis.importText=${JSON.stringify(csv)}`);
  await target.run(`importCsv({target:{files:[{text:async()=>importText}],value:'test'}})`);
  assert.equal(target.run(`db.words.find(w=>w.word_de==='die Conversion-Rate').times_seen`),6);
  assert.equal(target.run(`gradeAnswer('die Konversionsrate',db.words.find(w=>w.word_de==='die Conversion-Rate')).result`),'correct');
  assert.equal(target.run(`db.words.filter(isMarketingWord).length`),120);
  assert.equal(target.run(`new Set(db.words.map(w=>w.id)).size===db.words.length`),true);
});
test('offline manifest includes every versioned entry script and all referenced files exist',()=>{
  const root=path.join(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  for(const [,asset] of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^\"]+)?)"/g)){
    assert.ok(sw.includes(asset),`not precached: ${asset}`);assert.ok(fs.existsSync(path.join(root,asset.split('?')[0])));
  }
  assert.ok(sw.includes('vocabulary-sources.html'));
});
