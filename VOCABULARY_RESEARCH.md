# Frequency and marketing vocabulary research

Research and implementation date: 16 November 2026.

## Decision

Use two explicit priorities. Marketing-first practice follows an editorial syllabus for the user's actual work. General German orders new eligible words by an openly attributed, offline frequency snapshot. Neither corpus frequency nor a successful exercise is presented as proof of fluency.

The app now includes 120 marketing entries and 90 everyday foundation entries; 38 reuse matching original records, producing a fresh total of 1,216. Old IDs and recorded activity are retained. Existing records are enriched by a curriculum identifier rather than replaced. The later reliability update moves legacy mastered labels to Learning until direct recall is verified; it preserves their historical counters.

## What “frequent German” means

There is no universal list independent of corpus, date, text type, spelling, and unit of counting. Duden explicitly distinguishes frequency in its corpus from familiarity and frequency across all language use. Its documentation describes a corpus spanning multiple written text types. [Duden frequency documentation](https://www.duden.de/hilfe/haeufigkeit)

Counting `ist`, `war`, and `sein` separately gives word-form frequencies; aggregating them gives a lemma frequency. Articles and conjunctions occupy many top positions, while compounds and specialist terms can have low general frequency. For a marketing professional, frequency should therefore be subordinate to job relevance in the marketing path. This is our curriculum design judgment, not a finding from a measured marketing corpus.

## Sources considered

| Source | Useful for | Limitations and decision |
| --- | --- | --- |
| wordfreq 3.1.1, Robyn Speer | A reproducible mixed-source German estimate with an offline Python lookup | Selected. Its German data combines multiple text domains. It is a historical snapshot, not current 2026 usage. Original library normalization is used during generation. |
| SUBTLEX-DE, Brysbaert and colleagues | Film/TV subtitle vocabulary, closer to dialogue than a newspaper-only source | Helpful evidence for everyday usage, but scripted dialogue does not represent marketing meetings. Used indirectly through wordfreq. |
| Leipzig Corpora Collection | Corpus-specific word-form frequency and optional base-form data | Useful for comparing genres and dates. Download documentation specifies frequency-ordered forms; not chosen as the sole general-language signal. |
| Duden | Understanding corpus-frequency interpretation and limits | Reference, not a downloadable app dataset used here. |
| Goethe B1 word list | Understanding the level and role of an examination reference vocabulary | Not a frequency ranking. Goethe describes about 2,400 lexical units and cautions that the list itself is less suited to practising vocabulary. The list has not been copied into the app. |

Sources:
- [wordfreq documentation](https://github.com/rspeer/wordfreq), [upstream notices](https://github.com/rspeer/wordfreq/blob/master/NOTICE.md), [release citation](https://doi.org/10.5281/zenodo.7199437).
- [Brysbaert et al. (2011), German frequency paper, publisher DOI](https://doi.org/10.1027/1618-3169/a000123), cited by wordfreq. The implementation uses wordfreq, not a separately downloaded SUBTLEX file.
- [Leipzig download format](https://wortschatz.informatik.uni-leipzig.de/documents/Format_Download_File-eng.pdf).
- [Goethe B1 reference list, introductory pages](https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf).

## Implementation of general frequency

The snapshot uses wordfreq's German large list and Zipf score: log10 of occurrences per billion tokens. A value of 5 corresponds to roughly 100 per million; 4 to 10 per million. The app sorts descending without pretending that small score differences are meaningful learning-level differences.

Lookup preparation removes a leading German article or `sich`, preserves German letters, and only looks up a single alphabetic word. It does not aggregate inflections, distinguish noun/verb homographs, or estimate whole-phrase frequency from the word `die`. Multiword and hyphenated entries have no estimate. A missing entry is unknown, not proven rare. The bundled snapshot has 1,393 keys and 1,363 nonzero estimates; 1,093 of the 1,216 fresh bank entries receive an estimate. Repeated forms may share an estimate.

Priority applies **within the current word bank**, not to every German word in the language. The 90 foundation entries fill practical gaps in the existing bank; this is not advertised as a complete top-1,000 list. Already encountered words move into the existing learning/review buckets. Unknown-frequency words remain available and follow known estimates in the general new-word queue.

Regular round quotas still reserve learning and familiar-word review slots. The first few rounds may have no learning or review words, so unused slots become new words. No automatic due dates have been introduced. Marketing's dedicated category selector is strict; filling a short round cannot leak words from unrelated categories.

## Recall evidence is separate from frequency

The reliability follow-up on 16 November 2026 changes how the app grants mastery. Three fully correct direct typed recalls must occur on distinct local calendar days, at least 24 hours apart. Wrong or half-correct typed recall resets the qualifying evidence; a same-day correction cannot qualify. This is an explicit product rule for this app, not a frequency-corpus finding, an externally validated mastery threshold, or a guarantee of long-term retention.

Story, sentence, tense, context, and multiple-choice activities record exposure or recognition, never vocabulary mastery from an overall score. Historical counters remain, but older mastered labels move to Learning for verification. The manual mastery shortcut is replaced by recall practice.

The roles are distinct: the corpus helps order **new vocabulary**; word-specific recall evidence supports the **mastery label**. A full due-date scheduler remains outside this update.

## Marketing curriculum

There are six categories with 20 entries each:

1. CRM & lifecycle: CRM-System, Kundenbeziehungsmanagement, Lead, Kundenbindung, Segmentierung, Workflow, Automatisierung, Bestandskunde, Lead-Nurturing, Einwilligung, handoff phrases.
2. KPIs & reporting: Kennzahl, KPI, Conversion-Rate, Klickrate, Umsatz, Budget, Öffnungsrate, acquisition costs, ROAS, CLV, attribution, reporting phrases.
3. Campaigns & channels: Kampagne, E-Mail-Marketing, Werbekanal, Werbeanzeige, Landingpage, Newsletter, Betreffzeile, A/B-Test, SEO/SEA, tracking, launch phrases.
4. Meetings & teamwork: Besprechung, Abstimmung, Freigabe, Feedback, Frist, Verantwortung, Tagesordnung, Protokoll, Zeitplan, coordination phrases.
5. Creative & content: Werbemittel/Creative, Entwurf, Anzeigentext, Überschrift, Handlungsaufforderung, Briefing, Tonalität, Layout, Korrekturschleife, Redaktionsplan.
6. Research & strategy: Zielgruppe, Kundenbedürfnis, Nutzenversprechen, Wettbewerber, Marktforschung, Positionierung, Umfrage, Hypothese, Alleinstellungsmerkmal.

Each category introduces ten essentials, eight deeper terms, and two usable workplace phrases. The all-category queue interleaves categories so that CRM does not consume the whole first stage. Stages and A1–B2 metadata are editorial estimates, not official CEFR certifications or frequency measured inside marketing companies. Dedicated marketing practice is available regardless of the general level.

Marketing terminology is checked against usage in these primary industry sources. Original examples and teaching translations are written for this app, not copied from their text:

- [Microsoft Dynamics: CRM](https://www.microsoft.com/de-de/dynamics-365/resources/what-is-crm) — Kundenbeziehungsmanagement and CRM-System.
- [Salesforce: B2C CRM](https://www.salesforce.com/de/crm/b2c-crm/) — customer data and customer relationship terminology.
- [HubSpot: Lead nurturing](https://www.hubspot.de/use-case/lead-nurturing) — segmentation, workflows, lifecycle, and handoff to sales.
- [Google Ads: CTR](https://support.google.com/google-ads/answer/2615875?hl=de), [conversion rate](https://support.google.com/google-ads/answer/2684489?hl=de), [conversion reporting](https://support.google.com/google-ads/answer/6270625?hl=de) — official German interface terms. Denominators and definitions should always be stated; an ads conversion rate is not automatically a website session conversion rate.
- [Tableau: Marketing KPIs](https://www.tableau.com/de-de/learn/articles/marketing-kpi-and-sales-kpi) — KPI, Leistungskennzahl, reporting vocabulary.
- [IHK München: Marketingkonzept](https://www.ihk-muenchen.de/ratgeber/unternehmensfuehrung/marketing-vertrieb/marketingkonzept/) — target group, channels, strategy, and measures.

Natural workplace loanwords are retained. Typed alternatives are explicitly curated; the app does not claim to accept all possible German paraphrases. Speech is an optional browser capability, not a bundled offline audio library.

## Offline operation and maintenance

The vocabulary and frequency files are local: curriculum-data.js, frequency-data.js, and learning-priorities.js. The service worker precaches them, the reliability helpers, and the source-explanation page. No corpus API or AI service is needed during practice. Existing analytics in index.html is separate from this offline vocabulary feature; isolated test previews disable analytics.

To regenerate frequency data after changing vocabulary:

```sh
python3 -m venv .frequency-env
.frequency-env/bin/pip install wordfreq==3.1.1
.frequency-env/bin/python scripts/build_frequency.py
node --test tests/*.test.cjs
```

Frequency data is adapted under CC BY-SA 4.0, with attribution inside the generated object and in licenses/wordfreq-NOTICE.md. The original library's Apache license is retained. These data-license notices do not assign a new license to unrelated original application code. Do not export a detached frequency CSV without its attribution.

The source-data snapshot is deterministic for this release. New CSV words not already in the lookup snapshot retain an unknown frequency until the snapshot is rebuilt. CSV is word-list portability, not complete learning-state backup.

Full JSON backup/restore now includes the database, word progress and recall evidence, profile, settings, and all retained sessions. Restore validates the file and previews the backup date/profile/counts. Before replacement, it saves a full safety copy separately in the browser; failure to save that copy stops restoration. The Download pre-restore backup action remains available after restoration and reload, allowing the previous state to be downloaded and restored. This is not an automatic file download. Invalid or unsupported future files are rejected, and a failed storage write leaves the current database unchanged. Future saves no longer impose the former 200-session cap; already-pruned history cannot be reconstructed. Backups transfer the saved state manually rather than synchronizing devices automatically.
