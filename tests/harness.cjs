const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function makeElement() {
  return {textContent:'',innerHTML:'',value:'',hidden:false,disabled:false,dataset:{},style:{},
    classList:{toggle(){},add(){},remove(){},contains(){return false;}},setAttribute(){},
    querySelectorAll(){return[];},querySelector(){return makeElement();},focus(){}};
}
function appHarness(initialDb, options = {}) {
  const root=path.join(__dirname,'..');
  const stored=new Map(initialDb ? [['vinay_german_vocab_coach_v1',JSON.stringify(initialDb)]] : []);
  if(options.raw !== undefined)stored.set('vinay_german_vocab_coach_v1',options.raw);
  const elements=new Map();
  let now=options.now || null;
  class TestDate extends Date {
    constructor(...args){super(...(args.length ? args : now ? [now] : []));}
    static now(){return now ? Date.parse(now) : Date.now();}
  }
  const context=vm.createContext({console,Date:TestDate,navigator:{},window:{
    localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>{if(options.failWrites&&k==='vinay_german_vocab_coach_v1')throw new Error('quota');stored.set(k,v);},removeItem:k=>stored.delete(k)},
    crypto:require('node:crypto').webcrypto,scrollTo(){},setTimeout(){}
  },document:{querySelector(s){if(!elements.has(s))elements.set(s,makeElement());return elements.get(s);},querySelectorAll:()=>[]}});
  for(const file of ['curriculum-data.js','frequency-data.js','learning-priorities.js','recall-evidence.js','backup-data.js','app.js']) {
    let code=fs.readFileSync(path.join(root,file),'utf8');
    if(file==='app.js')code=code.slice(0,code.indexOf('els.quickRoundBtn.addEventListener'));
    vm.runInContext(code,context,{filename:file});
  }
  return {run:code=>vm.runInContext(code,context),stored,elements,setNow:at=>{now=at;}};
}
module.exports={appHarness};
