const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
// Declarations are evaluated without starting the app, storage, or DOM rendering.
const dataCode = source.slice(0, source.indexOf('let db = loadDb();'))
  .replace('const storage = createStorageAdapter();', '');
const context = vm.createContext({ VOCAB_CURRICULUM: require('../curriculum-data.js') });
// This exact normalizer is only needed to construct the existing generated story data.
vm.runInContext(`function normalizeAnswer(value) { return value.toLowerCase().normalize('NFKD').replace(/\\u0308/g,'e').replace(/[\\u0301\\u0300\\u0302]/g,'').replace(/ß/g,'ss').replace(/[.,!?;:()[\\]{}"']/g,' ').replace(/\\s+/g,' ').trim(); }`, context);
vm.runInContext(dataCode, context);
const existing = vm.runInContext(`[
  ...starterWords.map(w=>w[1]), ...supplementalStarterWords.map(w=>w[1]),
  ...storyBank.flatMap(s=>s.vocab.map(v=>v[1])),
  ...contextDrills.flatMap(d=>d.options.filter(o=>o.fits).map(o=>o.word_de))
]`, context);
const curriculum = require('../curriculum-data.js');
console.log(JSON.stringify([...existing, ...curriculum.words.map(w=>w.word_de)]));
