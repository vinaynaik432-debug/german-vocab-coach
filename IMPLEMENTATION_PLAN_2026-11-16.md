# German Vocab Coach: implementation and design approvals

16 November 2026 · Based on the combined research report and Vinay's feedback about continuous practice.

## Outcome

Make useful marketing German available one question at a time. Each submitted answer is saved independently. Vinay can stop after one answer or continue without round boundaries. Useful review, specific corrections, real work scenarios and honest progress support that loop. Preserve offline operation, current vocabulary, history, recall safeguards and full backups.

## Authorization and design decisions

The earlier per-screen approval process is preserved in `design-approvals.json`. After reviewing the visual directions and practice prototype, Vinay explicitly authorized completion: “I think you got the gist. You can go ahead and finish everything off now.” This supersedes the remaining per-screen gates. It does not imply publication or deployment.

The implementation retains the approved Today / Words / Progress navigation, separate Settings, immediate question, continuous practice, Cobalt & sunshine and Tangerine studio themes, and theme selector. Vinay additionally requested retaining the original logo; the original robot reading the German-flag book is used in the header and the original app icons remain in place.

Remaining screens and interactions are implemented under this completion authorization. They are not recorded as having received individual screen-by-screen approval.

## Starting baseline

Local branch: `codex/marketing-frequency-practice`. Existing local modifications include marketing/frequency work and the mastery/full-backup fixes. Preserve these and the unrelated `scratch/inject.js`. No reset, force push or broad cleanup.

The existing suite contains 50 passing checks at the start of this implementation. A fresh bank has 1,216 words, including 120 marketing entries. General-frequency ranking is a historical corpus signal within the current bank. Three qualifying typed-recall days are a product milestone, not proof of permanent mastery or speaking proficiency.

## Work packages and dependencies

| Package | Concrete work | Required checks | Implementation dependency |
| --- | --- | --- | --- |
| F1. Dependable saving | Standalone persistence layer; corrupt-data protection; visible-state-ready success/failure results; retain pending data; detect stale storage | Failed write, corrupt input, another-tab conflict, successful retry, no input mutation, no silent overwrite | Integrated with U05/U16 |
| F2. Answer-level history | Standalone practice engine; stable attempt IDs; drafts; hint/reveal tracking; immutable first attempt; correction records; pause/resume | One answer survives JSON round trip; repeated submit cannot double count; altered replay conflicts; unsubmitted drafts never grade | U03-U05 |
| F3. Scheduled review | Word-specific next review; transparent versioned intervals; separate new-word priority; no interval inflation from repeated same-day success | Time boundaries, clock rollback, assisted answers, wrong/partial recall, unknown legacy schedule, restore | U09 |
| F4. Migration and backups | Extend full-backup validation for attempts, drafts and review state; retain legacy sessions; migration once; safety copy; larger-history limits | Old and new fixtures; no evidence promotion; reject malformed future state; export/restore equality; failed write leaves original intact | U14/U16 before new state is activated |
| F5. Queue and evidence views | Due reviews first where appropriate; marketing or everyday scope; user-selected word pool; independent first-attempt/assisted metrics | Scope never leaks; unknown frequency honest; no starvation; no false due count; exact denominators | U06/U08/U09 |
| F6. Privacy and measurement | Remove name identification; optional name stays local; no raw answers in telemetry; completion recorded at successful answer save, not home navigation | Analytics payload inspection; no name or answer text; stop after two answers is not abandonment | U13 and disclosed measurement decision |
| F7. Learning content | Work scenarios for CRM, KPI reporting, campaigns, meetings, creative feedback and strategy; short input, useful phrases, production and repair | Natural German, grammar and terminology review; metric denominators; accepted alternatives; distinguish reference/recognition/recall/use | U10-U12 |
| F8. Interface and access | Approved Today/Words/Progress/Settings; semantic navigation; visible focus; readable contrast; copyable German; reduced motion; responsive touch controls | Complete keyboard tasks; 320 CSS px; enlarged text; mobile keyboard; assistive-tech labels/status; no trapped or lost focus | Integrated with V01/U01 and the completion authorization |
| F9. Legacy modes and release | Keep fixed rounds and existing modes optional; preserve first errors on retries; clear exposure labels; offline assets and versioned cache; rollback | Existing 50 checks plus additions; browser/restore/offline workflows; old/new histories coexist | U15, integrated review, release decision |

## How the research becomes product decisions

The combined report is the evidence record. Its recommendations are testable design decisions, not a requirement to implement every conflicting opinion from the sources.

| Learning or observation | Implementation decision | Evidence of success / approval |
| --- | --- | --- |
| Vinay postpones round-based practice because it feels like a ten-minute commitment | Open with one available question; save each answer; stop and resume independently of rounds | One-answer and interrupted-draft scenarios; U02-U05 |
| Retrieval and delayed retention differ from immediate recognition | Preserve unaided first responses and separate recognition, hints and corrections | No assistance earns recall credit; F2 / U04 / U08 |
| Spacing helps, but research supplies no universally optimal interval sequence | Versioned candidate review schedule with clear due dates; tune after real use | Boundary, clock and restore tests; U09 |
| High frequency helps general usefulness; job relevance changes personal value | Marketing remains the default priority; general frequency orders appropriate new words; review urgency is separate | Inspect queue explanations and exact scope; U06 / U09 |
| Mission-oriented language use is useful; a standardized “CIA trick” was not verified | Original marketing work tasks, realistic variations and repair practice | Fresh scenario performance is separate from card accuracy; U10-U12 |
| Feedback should explain the specific problem | Distinguish article mistakes, missing meaning and supported answers; keep the useful correction near the answer | User can explain the correction and continue; U04 |
| Progressive disclosure can reduce competing tasks | A small navigation structure, compact word rows, details on demand and data tools in Settings | Find a word, practise a selected pool and export without guidance; U01 / U06-U07 / U14 |
| Reddit opinions are varied and self-selected | Treat comments as usability hypotheses; keep optional modes and test with Vinay | Approval plus observed task completion, not a popularity claim; U15 |
| Game features may help some people but activity is not proficiency | Optional habit cues; no mandatory round boundary, streak pressure or composite fluency score | Useful delayed recall and work-task evidence; U08 / U13 / U15 |
| Language competence includes input, production and interaction | Add optional short reading/listening and speaking/writing tasks without making them prerequisites for one vocabulary answer | Clear task labels and honest limits of automated/self feedback; U10-U12 |
| Control, accessibility and honest system status support trust | Keyboard access, readable reflow, explicit save failure and full backups | Keyboard, 320px, failure/retry and restore workflows; U05 / U14 / U16 |

Research acceptance is separate from UI approval. For example, support for retrieval practice does not approve a particular hint button, feedback layout or progress label.

## Delivery phases

### Phase 1: foundations and first visual review

Build F1-F3 as isolated browser/CommonJS modules with no DOM or analytics dependencies. This isolation phase is complete; the modern app now loads them. Create the approval register and a working preview using disposable sample words. Offer two coherent starting flows: **Answer immediately** and **Calm start**. Both allow one answer or many. V01, U01 and U02 were reviewed first; the later completion authorization covers the remaining practice states.

### Phase 2: approve and implement the smallest complete practice path

Review U03-U05 with correct, partial, wrong, hinted, revealed, paused and failed-save examples. Complete F4 before connecting new records to the live database. Integrate only approved visual and behavior choices. Save a candidate answer before displaying Saved; retain the first attempt, help used and timestamp. Offer explicit Next word and Stop for now. Do not auto-advance. Preserve current input as a draft when appropriate and never count it as an answer. Require no final results screen for persistence.

Stopping is a normal successful visit. There is no compulsory word quota, countdown, round-completion badge or guilt message. Continue can restore a real pending item, not recreate a lost round. Same-day visits cannot create extra spaced-recall days. Optional practice repetition is distinct from qualifying evidence.

### Phase 3: library, scheduling and understandable progress

Implement U06-U09 under the completion authorization. Implement compact rows and expandable detail, exact search-result practice scope, topic/focus choices, due-review information and a small evidence summary. Keep corpus frequency subordinate to the chosen marketing goal and separate from review timing. New-item limits can reduce workload without preventing further voluntary review.

The scheduler is a transparent first version, not a claim of optimal neuroscience. Candidate independent-success intervals are product defaults to review and tune; learning research does not mandate a universal 1/3/7/14/30-day series. Wrong, partial and assisted answers receive appropriate shorter review without being labeled unaided success. Older words without schedule metadata remain unscheduled, not falsely overdue.

Progress separates unique words, attempts, qualifying recall days, assisted practice and work-task performance. Counts state scope and timeframe. Do not pool unrelated mode scores into a fluency percentage. Historical best scores can remain in optional history after review.

### Phase 4: real marketing use

Implement U10-U12 under the completion authorization. Organize original learning content around work tasks: explain a campaign change, ask for creative approval, clarify a handoff, request a revision, summarize a meeting. Reuse existing vocabulary and meaningful high-frequency supporting language. Pair nouns with articles/plurals, verbs with typical complements and useful sentence patterns.

Introduce input, recall, correction and a fresh use task as distinct activities. A word answer can count without completing an optional longer scenario. Avoid revealing the target before an unaided check. Audio playback does not prove speaking ability. Begin with browser-supported audio and an explicit unavailable state; any bundled audio or recording requires its own approved UX and storage decision. Do not add microphone upload, automatic AI grading or new third-party services implicitly. Human feedback/self-review must be labeled as such.

### Phase 5: settings, data tools and optional formats

Implement U13-U16 under the completion authorization. Make profile name optional and truly local, level/focus editable, habit cues optional, and data ownership explicit. Put full backup and restore ahead of CSV. Preserve restore preview, replacement warning and safety-copy recovery. Reset stays separate from export and requires an explicit consequence-aware action. Update the storage-failure message to the full backup route only after the failure-state presentation is approved.

Retain existing rounds, stories, recognition, grammar and sentence modes as optional choices. First errors must not disappear after a correction. Recognition and exposure must not grant direct typed-recall mastery. Avoid mandatory tours, leaderboards, new game economies, public social features and unnecessary cloud synchronization.

### Phase 6: integrated acceptance and release

Run regression tests and inspect every approved screen in the actual app. Verify keyboard operation, contrast, reflow, long German words, errors, empty states, offline use, storage failure, backup/restore, reload, interrupted practice and retained legacy history. Show a final working preview with the approval register. Deployment or publishing is a separate final action; this plan does not infer approval to publish an unreviewed redesign.

## UI/UX implementation register

The historical approval sequence is in the JSON register. All units below are now authorized by the explicit completion instruction; initial gates are retained as traceability identifiers.

| ID | Unit | Implemented behavior |
| --- | --- | --- |
| V01 | Shared visual language | Both approved themes; original logo retained |
| U01 | Navigation | Today, Words, Progress, separate Settings; phone bottom navigation |
| U02 | Immediate practice | A real saved question opens immediately |
| U03 | Question and help | Typed answer, recognition, explicit saved hint/reveal, blank validation |
| U04 | Feedback and correction | Specific feedback; original first answer preserved; optional correction |
| U05 | Stop, resume and recovery | Saved drafts, pause/reload, exact retry, competing-copy recovery |
| U06 | Library and scope | Search, topics, learning states, exact results and selected-word practice |
| U07 | Word details and audio | Examples, notes, recall days, local German voice or honest fallback |
| U08 | Progress | Separate independent/supported/correction totals and activity history |
| U09 | Scheduling | Due reviews first, legacy unscheduled queue, transparent fixed intervals |
| U10 | Work scenarios | 12 original tasks across six marketing categories |
| U11 | Reading and listening | Short input, translations, phrases and local-voice playback |
| U12 | Writing and speaking | Saved writing drafts, variants and clearly labelled self-review |
| U13 | Settings | Both themes, optional local name, level, optional gentle cue |
| U14 | Backup, restore and reset | Full JSON v2, v1 imports, CSV word lists, preview/safety/repair/reset safeguards |
| U15 | Optional formats | Recognition, 5/20 prompts, stories, context, sentences and tenses |
| U16 | Access and failure states | Keyboard flow, phone layout, save failures, no audio, offline updates |

## Acceptance scenarios

1. Open, answer once, stop and reload. The result remains; no round must be completed.
2. Answer twice, pause on a partially typed third word, return and continue without re-counting the earlier answers.
3. Double-click submit or replay the same saved attempt. It is counted once. A changed replay cannot silently rewrite it.
4. Give a wrong article, inspect the correction and answer again. Preserve the first error and mark assisted practice appropriately.
5. Use a hint or reveal. Do not grant unaided recall credit. Opening a second visit today does not create another qualifying day.
6. Simulate a failed write and an external storage change with disposable data. Never claim Saved or overwrite silently; recovery remains possible.
7. Restore an old full backup and a new backup containing attempts, drafts and schedules. Preserve all supported fields and retained history.
8. Search a marketing term and practise the displayed results. No hidden change to category-wide scope.
9. Use the app without network, with keyboard only, at 320 CSS pixels, enlarged text and with reduced motion.
10. Try a fresh marketing scenario after a delay. Keep communication evidence separate from card accuracy and activity.

## Definition of done

The authorized design is connected to real data, meaningful automated checks pass, the app is inspected in a browser, and interruption/restore paths retain recoverable state. No test result is a claim that the design has proven learning efficacy or meets every accessibility standard. Publication remains a separate release action.

## Final implementation record

- The modern entry is `index.html` → `coach-app.js` and `coach.css`, supported by focused storage, practice, scheduling, migration, vocabulary, activity and CSV modules. The original `app.js` remains for retained content and regression fixtures; it is not loaded by the new entry.
- Every durable change uses a single serialized storage path with an exclusive browser lock. Failed writes retain their exact candidate. Newer drafts are kept separately and flushed after retry; neither a correction nor another settings change can replace an unresolved first answer.
- Migration uses a new canonical storage key and retains the exact original legacy data. An old app tab cannot overwrite the modern key; changes to the old key block further writes until explicitly reconciled. Invalid or newer data is preserved for recovery, not silently reset.
- Full backups include words, original and new history, drafts, scheduling, preferences and activity records. Restores validate first, preview replacement, check for stale data, save an exact safety copy and then replace. Explicit unreadable-data repair preserves raw bytes. Reset checks the source snapshot so it cannot silently roll back another tab's newer words or preferences.
- Continuous practice is the default. Help and recognition are supported practice; first answers and corrections are immutable separate records. Optional 5/20-prompt formats do not restart automatically after completion.
- Marketing work priorities and historical everyday frequency guide new words separately from due reviews. Invalid/future evidence is kept out of practice rather than being normalized into apparent success.
- Twelve marketing scenarios reuse practical CRM, KPI, campaign, meeting, creative and strategy language. Writing examples and speaking self-review do not claim automatic language assessment. All original optional learning collections remain accessible.
- The modern app sends no telemetry, names, answers or microphone data. Audio uses only an available local German voice.
- The offline worker serves a complete versioned release. Updates wait for old tabs to close; they do not force an in-progress tab onto mixed versions.
- Browser acceptance covers the real first-answer/correction flow, hints, pause/reload draft recovery, exact selected scope, work drafts, full backup download and restore, both themes, narrow reflow and keyboard focus. Fault injection and concurrent-write cases are covered by automated integration tests.
- Final automated suite: **298 passed, zero failures**. The detailed run is in `work/release-test-results.txt`. Browser checks additionally verified saved article feedback and correction, hint separation, draft pause/reload, exact scopes, scenario drafts, a real JSON download/restore, both themes, original logo, 320 CSS-pixel reflow, retained keyboard focus, and an offline reload plus answer save with the server stopped. The final local entry was opened and left ready at `http://127.0.0.1:4173/`.
- Validation limits: this is not a formal accessibility certification or a measured learning-outcomes study. Local German audio depends on available device voices. Different browser profiles/origins retain separate data and need explicit full-backup transfer.
- Publication is now explicitly authorized. The release updates the existing GitHub Pages URL from `main`, retains the installed-app identity and preserves browser-local originals during migration. A release check against data generated by the original c787737 app covers custom words, counters, sessions, profile and unknown fields, quota failures, retry and read-only browsers. Browser data remains specific to the browser and origin used to open it.

## Published release verification

The update was merged in [PR #1](https://github.com/vinaynaik432-debug/german-vocab-coach/pull/1) and published to [the existing live app](https://vinaynaik432-debug.github.io/german-vocab-coach/). GitHub Verify passed on the feature and main branches; the [Pages deployment](https://github.com/vinaynaik432-debug/german-vocab-coach/actions/runs/43958634443) succeeded. All 26 checked published runtime assets matched the tested source bytes.

The existing live-browser session upgraded from the original app, retained its profile and level, and expanded the 1,044-word bank to 1,216 entries. Reopening completed the waiting offline-worker update. This browser verification is separate from the owner’s iPhone storage, which cannot be inspected remotely; original-version fixtures cover custom words, nonzero counters, fractional scores, session history and failed writes.

The historical personal CSV is no longer served by the current site (verified 404); its local bytes are unchanged. No browser data was reset, and repository history was not rewritten. Keep using the same installed app/browser and URL; close and reopen to update, then download a full JSON backup from Settings.
