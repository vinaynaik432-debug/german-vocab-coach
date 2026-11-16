/* Scheduling helpers: role relevance and corpus frequency are separate signals. */
const LearningPriorities = (() => {
  function frequencyKey(german) {
    const key = String(german || '').normalize('NFC').trim()
      .replace(/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer)\s+/i, '')
      .replace(/^sich\s+/i, '').toLowerCase();
    // Do not present token averages or the frequency of an article as phrase frequency.
    return /^[a-zäöüß]+$/i.test(key) ? key : '';
  }
  function frequency(word, data) {
    const value = data?.values?.[frequencyKey(word.word_de)];
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  function band(word, data) {
    const value = frequency(word, data);
    if (value === null) return 'No single-word estimate';
    if (value >= 5) return 'Very frequent';
    if (value >= 4) return 'Frequent';
    if (value >= 3) return 'Less frequent';
    return 'Uncommon';
  }
  function compareNew(a, b, { focus = 'marketing', data, metadata = new Map() } = {}) {
    const am = metadata.get(a.curriculum_id);
    const bm = metadata.get(b.curriculum_id);
    if (focus === 'marketing') {
      const ad = am?.domain === 'marketing' ? 0 : 1;
      const bd = bm?.domain === 'marketing' ? 0 : 1;
      if (ad !== bd) return ad - bd;
      if (ad === 0) return am.priority - bm.priority || am.order - bm.order || String(a.id).localeCompare(String(b.id));
    }
    return (frequency(b, data) ?? -1) - (frequency(a, data) ?? -1)
      || String(a.word_de).localeCompare(String(b.word_de), 'de')
      || String(a.id).localeCompare(String(b.id));
  }
  return { frequencyKey, frequency, band, compareNew };
})();
if (typeof module !== 'undefined') module.exports = LearningPriorities;
