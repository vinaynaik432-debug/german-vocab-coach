"""Build the offline snapshot. Requires Python wordfreq==3.1.1; never runs in the app."""
import importlib.metadata
import json
import re
import subprocess
from pathlib import Path
from wordfreq import zipf_frequency

ROOT = Path(__file__).resolve().parents[1]
words = json.loads(subprocess.check_output(['node', str(ROOT/'scripts/export-frequency-input.cjs')]))

def key(word):
    word = re.sub(r'^(der|die|das|den|dem|des|ein|eine|einen|einem|einer)\s+', '', word.strip(), flags=re.I)
    word = re.sub(r'^sich\s+', '', word, flags=re.I).lower()
    return word if re.fullmatch(r'[a-zäöüß]+', word) else ''

notice = (ROOT/'licenses/wordfreq-NOTICE.md').read_text()
keys = sorted({key(w) for w in words} - {''})
values = {k: (zipf_frequency(k, 'de', wordlist='large') or None) for k in keys}
data = {
    'source': 'wordfreq', 'author': 'Robyn Speer',
    'version': importlib.metadata.version('wordfreq'), 'language': 'de',
    'url': 'https://github.com/rspeer/wordfreq',
    'citation': 'Robyn Speer (2022). rspeer/wordfreq: v3.0. Zenodo. https://doi.org/10.5281/zenodo.7199437',
    'license': 'CC BY-SA 4.0', 'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
    'changes': 'Subset looked up with the original Python library for this app. Article and leading sich removed; multiword/hyphenated entries excluded. No lemma aggregation. Unknown is null.',
    'notice': notice, 'generated': '2026-11-16',
    'scale': 'Zipf: log10 occurrences per billion tokens. Corpus estimate, not an official German rank or a CEFR level.',
    'values': values,
}
(ROOT/'frequency-data.js').write_text('/* Frequency subset: CC BY-SA 4.0. Credits and notices are part of this object; preserve them. */\nconst WORD_FREQUENCIES = '+json.dumps(data, ensure_ascii=False, indent=2)+';\nif (typeof module !== "undefined") module.exports = WORD_FREQUENCIES;\n')
print(f'{len(values)} lookup keys, {sum(v is not None for v in values.values())} estimates')
