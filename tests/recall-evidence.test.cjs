const test = require('node:test');
const assert = require('node:assert/strict');
const Recall = require('../recall-evidence.js');
const word = () => ({id:'test',word_de:'die Zielgruppe',word_en:'the target group',status:'new',times_seen:0,correct_streak:0,wrong_count:0,half_count:0,last_result:''});
const at = day => new Date(2024,0,day,12,0,0).toISOString();
const correct = (w,day) => Recall.record(w,{result:'correct',at:at(day)});

test('three spaced typed recall days earn verified status; same-day repetition does not',()=>{
  const w=word();correct(w,1);correct(w,1);correct(w,1);
  assert.equal(Recall.count(w),1);assert.equal(w.status,'learning');
  correct(w,2);assert.equal(w.status,'learning');correct(w,3);
  assert.equal(Recall.isMastered(w),true);assert.equal(w.status,'mastered');assert.equal(w.recall.attempts,5);
});
test('a different calendar day less than 24 hours later does not qualify',()=>{
  const w=word();Recall.record(w,{result:'correct',at:new Date(2024,0,1,23,55)});
  Recall.record(w,{result:'correct',at:new Date(2024,0,2,0,5)});
  assert.equal(Recall.count(w),1);
  Recall.record(w,{result:'correct',at:new Date(2024,0,2,23,55)});
  assert.equal(Recall.count(w),2);
});
test('wrong and partial answers reset evidence and immediate corrections cannot count that day',()=>{
  for(const result of ['wrong','half']){
    const w=word();correct(w,1);correct(w,2);correct(w,3);
    Recall.record(w,{result,at:at(4)});correct(w,4);
    assert.equal(Recall.count(w),0);assert.equal(w.status,'learning');assert.equal(w[result==='wrong'?'wrong_count':'half_count'],1);
    correct(w,5);correct(w,6);assert.equal(Recall.isMastered(w),false);correct(w,7);assert.equal(Recall.isMastered(w),true);
  }
});
test('story, context, sentence, tense, and choice exposure neither earns nor removes typed mastery',()=>{
  for(const source of ['story','context','sentence','tense','choice']){
    const w=word();for(let i=1;i<=5;i++)Recall.recordExposure(w,{source,result:'correct',at:at(i)});
    assert.equal(Recall.count(w),0);assert.equal(w.correct_streak,0);assert.equal(w.status,'learning');
    correct(w,6);correct(w,7);correct(w,8);
    const before=JSON.stringify(w.recall);const streak=w.correct_streak;
    Recall.recordExposure(w,{source,result:'wrong',at:at(9)});
    assert.equal(JSON.stringify(w.recall),before);assert.equal(w.status,'mastered');assert.equal(w.correct_streak,streak);
    assert.equal(w.last_result,'correct');assert.equal(w.wrong_count,0);assert.equal(w.exposure.sources[source].wrong,1);
  }
});
test('exposure preserves direct failures and their separate error counters',()=>{
  const w=word();Recall.record(w,{result:'wrong',at:at(1)});
  Recall.recordExposure(w,{source:'story',result:'correct',at:at(2)});
  assert.equal(w.last_result,'wrong');assert.equal(w.wrong_count,1);assert.equal(w.correct_streak,0);assert.equal(w.times_seen,2);
});
test('legacy mastered records are retained as unverified learning with historical counters intact',()=>{
  const w={...word(),status:'mastered',correct_streak:9,times_seen:22,wrong_count:3,last_seen:'2023-12-31'};
  Recall.normalizeWord(w);assert.equal(w.status,'learning');assert.equal(w.correct_streak,9);assert.equal(w.times_seen,22);
  assert.equal(w.legacy_mastery.correct_streak,9);assert.equal(Recall.count(w),0);
  const snapshot=JSON.stringify(w);Recall.normalizeWord(w);assert.equal(JSON.stringify(w),snapshot);
});
test('valid evidence survives JSON backup round trips and repeated normalization',()=>{
  const w=word();correct(w,1);correct(w,2);correct(w,3);
  const copy=JSON.parse(JSON.stringify(w));Recall.normalizeWord(copy);
  assert.deepEqual(copy,w);assert.equal(Recall.isMastered(copy),true);
});
test('invalid timestamps, dates, duplicate days, short gaps, and missing attempt counters cannot yield mastery',()=>{
  const valid=word();correct(valid,1);correct(valid,2);correct(valid,3);
  const changes=[
    w=>{w.recall.successful_recalls[1].at='not-a-date';},
    w=>{w.recall.successful_recalls[1].at='2024-02-31T12:00:00Z';},
    w=>{w.recall.successful_recalls[1].day='2024-02-31';},
    w=>{w.recall.successful_recalls[1].day=w.recall.successful_recalls[0].day;},
    w=>{w.recall.successful_recalls[1].at=new Date(Date.parse(at(1))+1000).toISOString();},
    w=>{w.recall.attempts=0;},w=>{w.recall.correct=0;},w=>{w.recall.version=999;},
    w=>{w.recall.last_result='wrong';},w=>{w.recall.last_attempt_at='';},
  ];
  for(const change of changes){const w=JSON.parse(JSON.stringify(valid));change(w);assert.equal(Recall.isMastered(w),false);Recall.normalizeWord(w);assert.equal(w.status,'learning');}
});
test('clock rollback does not credit extra recall days',()=>{
  const w=word();correct(w,3);correct(w,1);assert.equal(Recall.count(w),1);
  correct(w,4);assert.equal(Recall.count(w),2);
});
test('manual reset removes qualification but preserves attempts and historical statistics',()=>{
  const w=word();correct(w,1);correct(w,2);correct(w,3);const attempts=w.recall.attempts;
  Recall.reset(w);assert.equal(w.status,'learning');assert.equal(Recall.count(w),0);assert.equal(w.recall.attempts,attempts);
  assert.equal(w.times_seen,3);assert.equal(w.correct_streak,3);assert.equal(w.recall.correct,3);
});
test('local dates are recorded and the explanation states the observable rule',()=>{
  const w=word();const local=new Date(2024,0,1,0,1);
  Recall.record(w,{result:'correct',at:local});assert.equal(w.recall.successful_recalls[0].day,'2024-01-01');
  assert.match(Recall.explain(w),/1\/3/);assert.match(Recall.explain(w),/24 hours/);
});
test('bad attempts are rejected before changing a word and source names cannot mutate prototypes',()=>{
  const w=word();const before=JSON.stringify(w);
  assert.throws(()=>Recall.record(w,{result:'maybe',at:at(1)}));assert.throws(()=>Recall.record(w,{result:'correct',at:'invalid'}));
  assert.equal(JSON.stringify(w),before);
  Recall.recordExposure(w,{source:'__proto__',at:at(1)});assert.equal(w.exposure.sources.other.attempts,1);assert.equal({}.attempts,undefined);
});
