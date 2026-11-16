/* Word-list exchange only: never import IDs, progress, recall, schedules or history.
 * Exported formula-like values and leading apostrophes receive one protective apostrophe.
 * The explicit _coach_csv_encoding=apostrophe-v1 column enables lossless decoding by this
 * parser. Unmarked external files are never unescaped; unknown encoding markers are rejected.
 * accepted_answers, when present, is a JSON array of nonempty strings, not a delimiter list.
 */
const CoachCSV = (() => {
  const MAX_BYTES = 20 * 1024 * 1024, MAX_ROWS = 50000;
  const ENCODING_FIELD = '_coach_csv_encoding', ENCODING = 'apostrophe-v1';
  const FIELDS = Object.freeze(['word_en', 'word_de', 'part_of_speech', 'topic', 'difficulty', 'notes', 'accepted_answers']);
  const POS = new Set(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'pronoun', 'preposition', 'conjunction', 'article', 'numeral', 'interjection', 'determiner', 'particle']);
  const ALIASES = new Map(Object.entries({
    word_en: 'word_en', english: 'word_en', en: 'word_en', englisch: 'word_en', english_word: 'word_en', word_english: 'word_en',
    word_de: 'word_de', german: 'word_de', de: 'word_de', deutsch: 'word_de', german_word: 'word_de', word_german: 'word_de',
    part_of_speech: 'part_of_speech', pos: 'part_of_speech', word_type: 'part_of_speech', wortart: 'part_of_speech',
    topic: 'topic', thema: 'topic', category: 'topic',
    difficulty: 'difficulty', level: 'difficulty', cefr: 'difficulty', niveau: 'difficulty',
    notes: 'notes', note: 'notes', notizen: 'notes',
    accepted_answers: 'accepted_answers', alternative_answers: 'accepted_answers', alternatives: 'accepted_answers',
    [ENCODING_FIELD]: ENCODING_FIELD
  }));
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const fail = message => { throw new Error(message); };
  function byteLength(text) {
    let size = 0;
    for (const char of text) { const point = char.codePointAt(0); size += point < 128 ? 1 : point < 2048 ? 2 : point < 65536 ? 3 : 4; }
    return size;
  }
  function checkSize(text) {
    if (text.length > MAX_BYTES || byteLength(text) > MAX_BYTES) fail('CSV exceeds the 20 MiB UTF-8 file limit. Use a smaller word list.');
  }
  function needsProtection(value) { return value.startsWith("'") || /^[\t\r\n]/.test(value) || /^[\s\uFEFF]*[=+@\-＝＋＠－]/u.test(value); }
  function encode(value) { return needsProtection(value) ? "'" + value : value; }
  function decode(value, label) {
    if (!value.startsWith("'")) return value;
    const original = value.slice(1);
    if (!needsProtection(original)) fail(`${label}: the spreadsheet text-encoding marker does not match this value. Remove the marker column only if this is an ordinary external CSV.`);
    return original;
  }
  function safeText(value, label) {
    if (typeof value !== 'string') fail(`${label} must be text.`);
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) fail(`${label} contains an unsupported control character.`);
    return value;
  }
  function validate(values, label) {
    const output = {};
    for (const field of FIELDS.slice(0, -1)) output[field] = safeText(values[field] === undefined ? '' : values[field], `${label}, ${field}`);
    for (const field of ['word_en', 'word_de']) if (!output[field].trim()) fail(`${label}: ${field} is empty. Every word needs English and German text.`);
    if (output.difficulty && !['A1', 'A2', 'B1', 'B2'].includes(output.difficulty)) fail(`${label}: difficulty must be A1, A2, B1 or B2, or left empty.`);
    if (output.part_of_speech && !POS.has(output.part_of_speech)) fail(`${label}: part_of_speech must be a recognised English type such as noun, verb, adjective or phrase, or left empty.`);
    if (values.accepted_answers !== undefined && values.accepted_answers !== '') {
      let answers = values.accepted_answers;
      if (typeof answers === 'string') {
        try { answers = JSON.parse(answers); } catch { fail(`${label}: accepted_answers must be a JSON array, for example ["die Konversionsrate"].`); }
      }
      if (!Array.isArray(answers)) fail(`${label}: accepted_answers must be a JSON array of text alternatives.`);
      output.accepted_answers = [];
      for (let i = 0; i < answers.length; i++) {
        if (!own(answers, i) || typeof answers[i] !== 'string' || !answers[i].trim()) fail(`${label}: accepted_answers contains an empty or non-text alternative at position ${i + 1}.`);
        output.accepted_answers.push(safeText(answers[i], `${label}, accepted_answers[${i}]`));
      }
    }
    return output;
  }

  function tokenize(text) {
    const records = [];
    let cells = [], cell = '', state = 'start', line = 1, recordLine = 1, hasContent = false;
    function finishCell() { cells.push(cell); cell = ''; state = 'start'; }
    function finishRecord() {
      if (hasContent || cells.length || cell) {
        finishCell(); records.push({ cells, line: recordLine });
        if (records.length > MAX_ROWS + 1) fail(`CSV exceeds the ${MAX_ROWS.toLocaleString('en-US')}-row word limit. No rows were imported.`);
      }
      cells = []; cell = ''; state = 'start'; hasContent = false;
    }
    for (let i = 0; i < text.length; i++) {
      const char = text[i], next = text[i + 1];
      if (state === 'quoted') {
        if (char === '"') {
          if (next === '"') { cell += '"'; i++; } else state = 'closed';
        } else if (char === '\r' || char === '\n') {
          if (char === '\r' && next === '\n') { cell += '\r\n'; i++; } else cell += char;
          line++;
        } else cell += char;
        continue;
      }
      if (char === ',' ) { finishCell(); hasContent = true; continue; }
      if (char === '\r' || char === '\n') {
        finishRecord(); if (char === '\r' && next === '\n') i++;
        line++; recordLine = line; continue;
      }
      if (state === 'closed') fail(`CSV line ${line}: unexpected text after a closing quote. Put the whole value inside quotes.`);
      if (char === '"') {
        if (state !== 'start') fail(`CSV line ${line}: a quote inside an unquoted value must be escaped inside a quoted field.`);
        state = 'quoted'; hasContent = true; continue;
      }
      cell += char; state = 'plain'; hasContent = true;
    }
    if (state === 'quoted') fail(`CSV line ${recordLine}: an opening quote has no closing quote.`);
    finishRecord(); return records;
  }

  function parse(text) {
    if (typeof text !== 'string') fail('CSV input must be text.');
    checkSize(text);
    const records = tokenize(text.replace(/^\uFEFF/, ''));
    if (!records.length) fail('CSV is empty. Include a header with word_en and word_de.');
    const rawHeaders = records[0].cells;
    const seenRaw = new Set(), seenFields = new Set();
    const headers = rawHeaders.map((header, index) => {
      const name = header.trim().toLowerCase().replace(/[\s-]+/g, '_');
      if (!name) fail(`CSV header ${index + 1} is empty.`);
      if (seenRaw.has(name)) fail(`CSV has a duplicate header: ${header}.`);
      seenRaw.add(name);
      const field = ALIASES.get(name) || null;
      if (field && seenFields.has(field)) fail(`CSV contains more than one header for ${field}. Keep only one.`);
      if (field) seenFields.add(field);
      return field;
    });
    if (!seenFields.has('word_en') || !seenFields.has('word_de')) fail('CSV needs word_en and word_de headers. English/German or Englisch/Deutsch are also accepted.');
    const output = [];
    for (let i = 1; i < records.length; i++) {
      const { cells, line } = records[i], label = `CSV row ${i + 1} (line ${line})`;
      if (cells.length !== headers.length) fail(`${label}: expected ${headers.length} columns but found ${cells.length}. Quote values that contain commas or line breaks.`);
      const values = {};
      headers.forEach((field, column) => { if (field) values[field] = cells[column]; });
      const encoding = values[ENCODING_FIELD];
      if (encoding && encoding !== ENCODING) fail(`${label}: unsupported spreadsheet text encoding ${encoding}.`);
      if (encoding === ENCODING) for (const field of FIELDS) if (own(values, field)) values[field] = decode(values[field], `${label}, ${field}`);
      output.push(validate(values, label));
    }
    return output;
  }

  function stringify(words) {
    if (!Array.isArray(words)) fail('CSV export needs an array of words.');
    if (words.length > MAX_ROWS) fail(`CSV exceeds the ${MAX_ROWS.toLocaleString('en-US')}-row word limit. Use a smaller word list.`);
    const quote = value => `"${value.replace(/"/g, '""')}"`;
    const lines = [[...FIELDS, ENCODING_FIELD].map(quote).join(',')];
    let bytes = byteLength(lines[0]);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!own(words, i) || !word || typeof word !== 'object' || Array.isArray(word)) fail(`Word ${i + 1} must be a word record.`);
      const values = {};
      for (const field of FIELDS) {
        const descriptor = Object.getOwnPropertyDescriptor(word, field);
        if (descriptor && !own(descriptor, 'value')) fail(`Word ${i + 1}, ${field} cannot be an accessor.`);
        if (descriptor) values[field] = descriptor.value;
      }
      const checked = validate(values, `Word ${i + 1}`);
      const row = [...FIELDS.map(field => field === 'accepted_answers' ? checked[field] === undefined ? '' : JSON.stringify(checked[field]) : checked[field]), ENCODING];
      const line = row.map(value => quote(encode(value))).join(',');
      bytes += 2 + byteLength(line);
      if (bytes > MAX_BYTES) fail('CSV export exceeds the 20 MiB UTF-8 file limit. Use a smaller word list.');
      lines.push(line);
    }
    return lines.join('\r\n');
  }
  return Object.freeze({ parse, stringify, MAX_BYTES, MAX_ROWS, FIELDS, ENCODING_FIELD, ENCODING });
})();
if (typeof module !== 'undefined') module.exports = CoachCSV;
