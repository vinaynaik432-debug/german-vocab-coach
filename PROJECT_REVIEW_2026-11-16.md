# German Vocab Coach: project review

Reviewed and updated on 16 November 2026. This is a code, content, and functional review, not a study of real learners or a measurement of learning outcomes.

The findings below preserve the original review and first marketing/frequency update. A [same-day reliability follow-up](#follow-up-mastery-and-full-backups--16-november-2026) at the end records the later fixes to mastery and full backups. Earlier “still open” labels and validation results describe the earlier state.

## Main finding

The biggest weakness is the reliability of the learning record. The app has plenty of content and a friendly interface, but its scores and “mastered” status can overstate what someone can recall. More stories, badges, and modes will not solve that problem. For a marketing professional, the most valuable loop is: learn a relevant expression, recall it without hints, use it in a work sentence, and recall it again on a later day.

The update accompanying this review adds marketing priorities and a general-frequency order. It does not claim to have repaired the entire learning model.

## What was inspected

- GitHub repository: [vinaynaik432-debug/german-vocab-coach](https://github.com/vinaynaik432-debug/german-vocab-coach), main at `c787737c2272fcd3cd3a8609f760ec31cdd2c3a5`.
- Local working project: the current repository checkout. All 15 tracked files matched GitHub before this work. The existing untracked `scratch/inject.js` was inspected and left untouched.
- An older duplicate local project folder has divergent app, page, styles, and cache files. It was not updated. Keep one authoritative working folder to avoid accidentally launching the older copy.
- Read the application logic, word banks, stories, exercises, CSV handling, profile and dashboard logic, local storage, service worker, launch script, and project documentation. Ran isolated reproductions of the scoring and selection behavior and exercised the updated app in a separate local browser origin.
- Changes are on local branch `codex/marketing-frequency-practice`. GitHub and the published app have not been changed. Source-file edits do not themselves migrate a user's existing browser database; migration runs when that browser loads the updated application.

Original inventory: **1,044 word records, 119 stories, 142 rotating phrases, 48 sentence items, 36 tense items, and 12 context drills**. Of the stories, 71 come from the template-generation path. The original word labels were A1: 48, A2: 11, B1: 603, B2: 382. These are content counts, not independent measures of curriculum quality.

## Problems that matter most

### 1. “Mastered” can mean exposure rather than recall — high priority, still open

The story handler applies the overall story score to all linked vocabulary. In an isolated reproduction, three 75% story exposures marked **die Zielgruppe** mastered, without a typed recall attempt for that word. Sentence practice likewise spreads an aggregate score across its linked words. Ordinary vocabulary also awards mastery after three correct answers without requiring separation across days.

This is especially damaging because the dashboard and future selection depend on that status. A word can appear learned and receive less attention before recall has been demonstrated.

**Recommended change:** separate “seen in context,” recognition, typed recall, and delayed recall. Only direct evidence should update an individual word's recall strength. Keep story comprehension scores separate. Existing progress should be preserved as historical activity rather than silently reinterpreted as verified mastery.

Evidence: [story exposure](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L7047), [sentence exposure](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L5756), [vocabulary results](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L6256).

### 2. The review loop does not schedule by elapsed time — high priority, still open

Selection uses word status, mistake counts, quotas, and the last few sessions. There is no next-review date or retention estimate. Five rounds today can affect selection like five rounds spread across weeks. Frequency ordering answers “which new word next”; it does not answer “which learned word is due now.”

**Recommended change:** add a transparent due-date scheduler, with failed recall returning sooner and successful delayed recall extending the interval. Report “due today,” “recalled after a delay,” and “needs work” separately from activity streaks. Avoid presenting any one fixed interval schedule as scientifically optimal for every learner.

Evidence: [original round selection](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L4826). The new priority implementation deliberately retains the old learning/review buckets.

### 3. Some exercises are easy to game — high priority, still open

- In 11 of 12 context drills, selecting the first three options gives a perfect answer. Rendering preserves that option order. This measures a layout pattern as well as German knowledge.
- Choosing the longest answer in each story question produces **341 correct answers out of 480 (71%)** in the current content bank. That is a deterministic content check, not a claim about how real users behave or what they learn.
- Sentence retry removes the previous wrong result before accepting the correction. A corrected attempt can therefore finish with a perfect score that hides the initial error.

**Recommended change:** shuffle context choices; balance the length, plausibility, and grammar of story distractors; preserve first-attempt and eventual-correction scores separately. Correcting an error is useful practice, but it should not erase the error from the learning evidence.

Evidence: [context selection/rendering](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L5241), [sentence retry](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L5641).

### 4. The original level control was unreliable — partly fixed

Choosing A1 during first setup left all five mode levels at B1. Vocabulary scoring also read the context-drill level. Both are fixed in this update and covered by regression checks.

The underlying content gaps remain: A1 has no matching context drills, sentence and tense practice fall back to A2 material at A1, and those banks have no B2 material. A level button cannot create content at that level. The new marketing path is intentionally accessible at every general level; specialist vocabulary is useful to the user even when the sentence around it is more demanding.

Evidence: [original profile setup](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L4568).

### 5. Grading can punish valid answers or reward different words — partly fixed

The original grader rejected **das Meeting** for **die Besprechung**. It also gives half credit to **der Tee** for **das Ei**, and **die Maus** for **das Haus**, because its spelling allowance is too generous for short words. Several English prompts are ambiguous: “the ticket” can point to Fahrkarte or Fahrschein, and “to assume” to vermuten or annehmen.

The new curriculum accepts explicitly listed alternatives, including Meeting, Creative, CTA, and Konversionsrate. Multiple-choice distractors now avoid duplicate displayed answers and listed alternatives to the correct answer. General synonym coverage and the short-word typo rule still need revision. Do not solve ambiguity by accepting every vaguely related word: add a sentence or meaning cue where the senses differ.

Related issue: sentence-to-vocabulary matching uses substring matches. “bezahlen” can update “bar bezahlen,” and “Gericht” can update “das Hauptgericht.” Replace this with explicit word IDs.

Evidence: [original grading](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L6190), [sentence mapping](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L5741).

### 6. Backup and storage need clearer guarantees — partly fixed

CSV is useful word-record portability, but does not back up the profile, learning preference, or session history. Importing an older export can replace newer word progress. Saving retains only the last 200 sessions, so statistics derived from those sessions are not lifetime records.

The original load error path could replace problematic saved data with a fresh bank, including when saving an upgrade failed. This update keeps the original stored value untouched and displays a temporary-session warning instead. Migration checks cover existing IDs, progress, custom entries, sessions, and repeat loads.

**Recommended change:** add a versioned full backup/restore, preview import conflicts, and maintain lifetime aggregates independently of a capped recent-session list. The new CSV fields preserve curriculum links and accepted alternatives, but do not turn CSV into a full backup.

Evidence: [load behavior](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L4365), [200-session cap](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L4537).

### 7. The “name only on this device” promise conflicts with analytics code — high priority before sharing more widely, still open

The page says the name is saved only on the device, but profile saving calls `posthog.identify(name)` and the page initializes an external PostHog endpoint. That code path can send the entered name as an analytics identifier when analytics is available. The review did not inspect production analytics records or make a legal-compliance determination.

**Recommended change:** remove name-based identification and make the actual analytics behavior clear. Completion analytics also fire from the home-transition function, so exiting a round can be counted as completion. This update does not change production analytics; analytics were disabled in the isolated test preview.

Evidence: [onboarding wording](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/index.html#L456), [name identification](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L4561), [completion event](https://github.com/vinaynaik432-debug/german-vocab-coach/blob/c787737c2272fcd3cd3a8609f760ec31cdd2c3a5/app.js#L5050).

## What looks good but currently contributes little

| Feature | Current limitation | Better use of the space or effort |
| --- | --- | --- |
| Best-score tiles, overall accuracy, and a 70% streak | Recognition, typed recall, stories, and corrected attempts are different tasks. A single aggregate looks precise but does not describe one learning ability. | Show first-attempt recall and delayed recall by mode, plus words due. |
| 142 rotating phrases | Pleasant exposure, but refreshing them is not connected to saving, recall, or later review. | Let a useful phrase enter the learner's practice queue. |
| Large welcome mascot and greeting | Friendly visual identity, but on a phone it pushes useful practice below the first screen. | Keep a compact identity area and put the next useful action near the top. |
| 119-story count | Seventy-one stories use a template-generation path; volume can disguise repetition and predictable questions. | Fewer reviewed workplace scenarios with stronger questions and explicit vocabulary links. |
| Generic memory tips | Some article/compound cues help, but generic “make a picture” advice is not evidence that the app understands a person's error. | Show the exact error, article, distinction, and an example; keep a mnemonic only when it adds something. |
| Many learning modes | Breadth without a shared evidence model fragments progress. Some modes cannot supply the chosen level. | Connect a smaller set of modes to the same carefully measured word record. |

These features are not inherently useless. Their value is limited by how they are connected to learning now. The visual identity, quick typed rounds, explicit noun articles, local operation, CSV portability, and contextual reading are useful foundations worth retaining.

## What this update adds

- **120 marketing words and phrases**, 20 in each of CRM & lifecycle, KPIs & reporting, campaigns & channels, meetings & teamwork, creative & content, and research & strategy.
- Original German workplace examples with English explanations, articles, usage notes, curated accepted alternatives, search, category filtering, and focused five-word recall rounds.
- A default **Marketing first** priority. The syllabus introduces essentials before deeper terms and phrases; categories are interleaved in the combined queue.
- **Everyday frequency first** for general new vocabulary, plus a dedicated common-German practice button. This uses a reproducible wordfreq snapshot and stays within the eligible level and current bank. Learning/review places remain reserved.
- **90 everyday foundation entries**. Reusing 38 existing matches means 172 new records, for a fresh total of **1,216**, while preserving existing record IDs and progress.
- Offline data and source explanations, safe migration fallback, fixed A1 setup and vocabulary-level dependency, duplicate-choice prevention, and preserved mobile zoom.

Marketing relevance and general frequency are intentionally separate. “Conversion-Rate” can be more useful to this learner than a generally frequent word even if it has no single-word corpus estimate. See [the research](VOCABULARY_RESEARCH.md) for source selection, licensing, limits, and regeneration.

## Validation and limits

Seventeen automated checks pass, covering migration and recovery, profile level, category boundaries, priority order, retained review quotas, accepted alternatives, word-result persistence, CSV round trips, and offline asset coverage. Browser checks completed two marketing rounds using accepted alternatives, verified category-specific repeat practice, searched the cards, opened everyday practice, and confirmed progress after reload.

The temporary preview server was stopped. The app still reloaded, displayed saved progress, started a marketing round, and opened the cached source-explanation page. The mobile viewport was inspected at 425 pixels without horizontal overflow. Browser speech availability is device-dependent and was not aurally validated. No claim is made about production deployment, cross-device sync, learner retention, or every legacy mode being fixed.

## Recommended order from here

1. Make learning evidence honest: word-specific recall, retained first attempts, fair distractors, explicit vocabulary mapping.
2. Add due-date review and a full backup; correct the analytics/privacy mismatch before broader distribution.
3. Build a small set of marketing work tasks: explain a KPI change, request creative feedback, hand a lead to sales, and summarize a campaign result. Score the language actually produced.
4. Then simplify the dashboard and home screen around those tasks. Expand the content bank only where a real learning gap remains.

## Follow-up: mastery and full backups — 16 November 2026

This follow-up addresses the two issues selected after the original review. It preserves the original findings above as historical evidence rather than rewriting what was observed.

### Mastery now requires direct typed recall across days

A word earns **Mastered** only after three fully correct direct typed recalls on distinct local calendar days, with at least 24 hours between qualifying recalls. A wrong or half-correct typed recall resets the qualifying evidence. A correction on the same day does not qualify, and repeatedly answering correctly in one sitting cannot satisfy the rule.

Stories, sentence and tense activities, context drills, and multiple choice record exposure or recognition. Overall activity scores never grant mastery to their linked words. The manual **Mark mastered** action is replaced by **Practise recall**.

Legacy mastered words move to **Learning** and need recall verification. Their historical activity counters are retained. This is intentionally visible: the old label did not contain sufficient evidence to certify the new rule. The new criterion does not claim permanent retention or fluency, and a complete spaced-repetition scheduler with due dates remains future work.

### Full JSON backup replaces CSV as the complete backup route

**Download full backup** includes the complete saved database: vocabulary and progress, recall evidence, profile, settings, and all sessions still retained. **Restore backup** validates the file and previews the backup date, profile, and counts before replacement. It first saves a full pre-restore safety copy separately in the browser and does not proceed if that copy cannot be saved. **Download pre-restore backup** remains available after restoration and reload so the earlier state can be downloaded and restored. The safety copy is not an automatic file download. Invalid or unsupported future files are rejected. A storage-write failure leaves the current database unchanged.

The former 200-session trim has been removed for future saves. History already discarded by older app versions cannot be reconstructed from remaining records. This provides a manual full-state transfer between browsers, not automatic sync.

CSV remains available for word-list editing and portability. It is now explicitly described as a partial format rather than a full backup.

### Interface work remains a proposal

The broader decluttering ideas are recorded in [six UI/UX proposals](UX_PROPOSALS_2026-11-16.md), with concrete before-and-after examples. They are not an implemented redesign. The recommended first changes are a more useful home screen, a smaller set of honest progress measures, and settings/data controls separated from progress.

The earlier validation paragraph applies to the first marketing/frequency update. This follow-up does not assert a new test count or browser-verification result; run the current automated suite with `node --test tests/*.test.cjs` and consult the implementation handoff for the completed checks.

### Follow-up verification

All 50 automated checks pass, including actual app handlers, legacy migration, same-day correction rules, complete backup round trips, older CSV protection, failed writes, async selection races, and changes saved by another tab. In an isolated browser, a 1,217-word / 223-session test backup restored settings and verified recall correctly; the legacy mastery record returned to Learning. The downloaded full backup and pre-restore copy were inspected. Reloading offline retained the restored data and a subsequent typed attempt at 1/3 verified recall days. Mobile backup controls were checked for overlap with navigation. No production browser data or GitHub deployment was changed.
