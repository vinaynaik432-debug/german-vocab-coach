# German Vocab Coach
## A clearer app. Faster progress toward useful German.

**UI/UX, learning science, community feedback and the “CIA language learning trick”**

Prepared for Vinay Naik · 16 November 2026

This is an evidence-informed product and learning report. It combines the current local app audit, original expert guidance, research papers, institutional sources and a deliberately balanced sample of Reddit discussions. Recommendations and screen concepts are proposals, not implemented features or measured improvements.

## 1. The decision to make

**Build the app around one repeatable job: help you remember and use German in real marketing work.** The app already has useful ingredients: offline practice, a marketing vocabulary bank, frequency-based ordering, several practice formats, stricter recall evidence and a complete backup format. Its main remaining weakness is that these ingredients compete for attention without forming a clear learning journey.

The recommended journey is: choose a work goal, recall useful language, get a precise correction, use it in a small task, and return to it later. Progress should show evidence from that journey. It should not ask you to interpret a collection of best scores, percentages and activity counters before deciding what to do.

The strongest conclusions are:

- **Reduce navigation effort; preserve productive learning effort.** Finding the right practice should be easy. Remembering a German word can appropriately require effort.
- **Optimize for useful retention per minute, not maximum app activity.** More taps, a perfect round or a longer streak do not by themselves establish learning.
- **Prioritize marketing relevance and common supporting language together.** “Die Freigabe” may matter to your work sooner than a more frequent but less relevant noun. Common verbs and connectors make specialist vocabulary usable.
- **Add genuinely scheduled review before claiming an adaptive learning path.** The current app orders new words and records recall evidence; it does not yet calculate when each word is due.
- **Use the useful parts of intensive language training without adopting its marketing claims.** Goal-specific practice, feedback and substantial exposure are credible. A universal secret formula for fluency is not established.
- **Treat accessibility, honest labels and recovery as part of usability.** They belong ahead of cosmetic changes.

The six main design proposals are a compact Today screen, consistent navigation, a searchable word library, a better practice-and-feedback loop, honest Progress, and a separate Settings/data area. Sections 7-8 give concrete examples. Sections 5-6 explain the language research; section 9 translates it into a four-week personal experiment.

**Design correction from your feedback, 16 November 2026:** you reported that rounds feel like a block of time you must set aside, whereas you want to answer one or two questions whenever possible and continue when time allows. This supersedes the earlier proposed default of an eight-word/five-minute round. The default should be continuous, one-question-at-a-time practice, with each submitted answer saved independently and an easy exit at any point. Fixed rounds remain optional. This is direct evidence about your experience and preference, not a claim that every learner prefers continuous practice.

**What this report does not claim:** that this app can independently deliver B2, that three successful recall days mean permanent mastery, that all gamification is harmful, that Reddit represents all learners, or that the proposed design has already improved learning. The broad principles have evidence; the exact interface and personal schedule still need testing.

## 2. How the research was done

### Sources and evidence quality

The review prioritizes original papers, author or university copies, original expert publications, W3C standards, and official institutional descriptions. It includes both positive findings and limits or contrary findings. It is a focused research synthesis, not a preregistered systematic review of every UI/UX or language-learning publication.

| Evidence type | Appropriate use | What it cannot establish here |
| --- | --- | --- |
| Meta-analysis or systematic review | Identify recurring effects and important variation | Guarantee the same effect in this app or for German |
| Controlled study | Explain a mechanism under stated conditions | Establish a universal fastest method |
| Expert guidance and design systems | Generate practical design decisions and test criteria | Prove that a particular screen improves retention |
| WCAG and WAI guidance | Define accessibility requirements and implementation patterns | Certify the app without a complete audit |
| Official CIA/DLI/CEFR material | Verify what institutions publicly describe | Independently prove comparative learning effectiveness |
| Reddit posts and comments | Discover frustrations, counterviews and testing hypotheses | Estimate prevalence, causality or language outcomes |
| Source inspection and a disposable preview | Identify specific current behavior and interface risks | Replace observation of real learners |

Searches covered retrieval, spacing, multimedia design, feedback, vocabulary learning, language production, pronunciation, intensive study, gamification, dashboards, accessibility, and the source of CIA-related claims. Reddit searches covered r/UXDesign, r/userexperience, r/Anki, r/duolingo and r/languagelearning. Twelve selected threads were opened, including visible comments and opposing experiences. One promising thread that could not be opened was excluded. Search indexing, English-language availability and self-selection limit this sample.

### App baseline and limits

The audit uses the local project as it stood on 16 November 2026, after the marketing/frequency and reliability work. The GitHub repository is `vinaynaik432-debug/german-vocab-coach`; this report does not assume that local changes have been deployed. Source files and a disposable local preview were inspected. The preview excluded analytics and used a research profile, not your real learning history.

The limited browser inspection checked first-run interaction, home/progress presentation and a narrow layout. There was no horizontal overflow at the observed 520-CSS-pixel viewport. Browser zoom meant this was not a 320-CSS-pixel WCAG reflow test. Initial dialog focus was able to reach the document body; a complete keyboard and screen-reader audit remains necessary. Screenshots are supporting observations, not evidence of learner performance.

Your direct feedback about round commitment informs the revised practice design. No formal learner study or delayed-recall experiment was run, and no production analytics were used to infer success. Exact effect sizes are included only where the underlying accessible source supports them. The source register records when only an abstract or preprint was accessible. Recommendations labeled “proposed” are our synthesis rather than findings directly tested by those sources.

## 3. What the app gets right, and where it still fails

### Keep these strengths

**Marketing relevance.** The bank contains 120 marketing entries across CRM, metrics, campaigns, meetings, creative work and strategy. They provide a useful starting curriculum for your goal. General practice also has a frequency snapshot and 90 foundation additions; the combined fresh bank has 1,216 entries after reusing existing matches. These are curriculum counts, not a measure of your knowledge.

**Offline operation and ownership.** Practice can work locally without an AI service. This supports quick, low-friction use. Browser speech availability varies; a speech button is not a guarantee of offline audio on every device.

**The reliability fixes already made.** Direct typed recall now has its own evidence. Full JSON backup includes retained learning state, profile, preferences and session history, with validation, restore preview and a pre-restore safety copy. CSV is correctly a word-list transfer format. Do not redesign away those safeguards.

**Practice variety and a friendly identity.** Stories, examples, recognition practice and a mascot can all have useful roles. The problem is their relative prominence and the claims attached to them, not simply their presence.

### Current problems, with practical consequences

| Priority | Current observation | Why it matters / recommended response |
| --- | --- | --- |
| P1: starting friction | You report postponing practice because a round feels like a time commitment | Make one saved answer the basic unit. Opening for one or two answers should be a normal successful visit. |
| P0: trust | Navigation can clear an active round; the message says “Round parked” | A learner can lose unfinished work while being told it is preserved. Save a resumable draft or state the consequence before leaving. |
| P0: trust | Setup says the name stays only on this device, but name-save code calls analytics identification | Align implementation and promise. Prefer keeping the name local. This is a code-level transmission path; this audit did not observe your name being sent. |
| P0: trust | A later storage-write failure can leave the saved-state indicator unchanged | Keep a persistent “Changes not saved” state and a full-export recovery action. The new restore path has stronger safeguards; ordinary saves need the same clarity. |
| P0: measurement | Returning home can emit a round-completed event, including an exit | Fix event meaning before using completion rates to evaluate a redesign. |
| P1: learning | No per-word due-date scheduler | Frequency ordering cannot substitute for reviewing before forgetting. Implement scheduling as a separate learning feature. |
| P1: clarity | Home combines a large welcome/mascot, daily phrase, mission, weekly activity and mixed mode tabs | The recommended action exists but competes with several other messages. Put it first and reduce secondary prominence. |
| P1: structure | Progress combines statistics, configuration, word management, import/export and reset | A reporting screen also behaves like a control panel. Give these tasks explicit destinations. |
| P1: interpretation | “Mastered,” overall accuracy, best scores and a “70% streak” coexist | The stricter mastery logic is fixed, but the interface can still imply more than the evidence supports. Explain and separate the measures. |
| P1: scope | Marketing search filters the displayed cards; practice uses the selected category | The small explanatory copy is easy to miss. Offer “Practise these results” or explicitly name the full category. |
| P1: access | Incomplete tab semantics, modal behavior concerns, global text-selection blocking | Keyboard and assistive-technology users may struggle; copying German into notes or a dictionary is obstructed. |
| P2: recovery copy | The storage-failure fallback still recommends exporting CSV | Update it to the full backup route, with an explicit warning when persistence is unavailable. The warning was hidden in the inspected working preview. |

P0 means address before relying on the experience or its measurement. It is not a claim that every user encounters the problem. P1 improves the core learning journey; P2 covers refinement. Source locators are in Appendix B.

### Things that look useful but need a clearer job

**Seven best-score tiles:** attractive evidence of activity, weak guidance about what to learn next. Keep optional history if desired; remove their prominence from the main Progress view. Scores from different exercise types are not directly comparable.

**A mastery percentage of the whole bank:** mathematically possible but potentially misleading. Your goal is not necessarily to complete every word. Show recall evidence for your selected track and explain the denominator.

**“Words touched” and the 70% streak:** these can support a habit, but touching a word is not learning it. Label activity as activity. A missing day should not visually erase acquired knowledge.

**Large cards with every detail expanded:** excellent as reference pages, expensive for scanning 120 entries. Put meaning and status in a compact row; open examples, aliases and usage notes when needed.

**A large daily phrase or mascot above the task:** potentially welcoming, but not the main work. Keep a compact version or connect the phrase to the day’s scenario. Do not remove personality merely to imitate minimalist products.

**Many exercise modes presented as equal starting choices:** flexibility becomes a planning burden when the learner must design a lesson before beginning. Recommend a sequence; preserve an obvious way to change it.

## 4. What UI/UX research and experts actually support

### Make the next action visible, with optional depth

Nielsen’s progressive-disclosure guidance recommends prioritizing common tasks and revealing specialized controls when needed. NN/g’s visual-design guidance similarly uses hierarchy and grouping to direct attention. Neither establishes a scientific maximum number of buttons or proves that an empty screen is better. Our application is a clear practice action, visible topic choice, and secondary access to advanced configuration. [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/); [visual hierarchy](https://www.nngroup.com/articles/principles-visual-design/).

Recognition should help you operate the interface: visible names, understandable status and predictable navigation. It should not remove the recall challenge from a vocabulary exercise. A remembered menu location is an unnecessary burden; remembering “die Kennzahl” is part of the educational objective. [Budiu, 2024](https://www.nngroup.com/articles/recognition-and-recall/).

### Avoid simplistic “fewer choices” rules

Scheibehenne, Greifeneder and Todd’s 2010 meta-analysis covered 63 conditions from 50 experiments, with 5,036 participants. The average choice-overload effect was virtually zero, with substantial variation. This does not mean choice architecture never matters. It means “remove options because choice always overwhelms people” is not a sound universal explanation. For Coach, group by learner task, recommend a default, and preserve topic control. [Published paper, university repository](https://archive-ouverte.unige.ch/unige:76440).

The three-click rule is also a poor target. Moving backup to a clearly named Settings destination may add one tap and still improve the experience. Judge success, errors and comprehension across the whole task. [NN/g critique](https://www.nngroup.com/articles/3-click-rule/).

### Put relevant information together

Noetel and colleagues’ 2022 overview combined 29 reviews, 1,189 studies and 78,177 participants. It supported several instructional-design principles, including signaling and keeping related information close together; effects varied by material and delivery. This is not a trial of our home screen. The reasonable inference is to place a correction beside the answer, emphasize the changed article or ending, and disclose long grammar notes when needed. [Institutional abstract](https://portal.findresearcher.sdu.dk/da/publications/multimedia-design-for-learning-an-overview-of-reviews-with-meta-m/).

### Make feedback useful, not merely positive

Shute’s 2008 review supports feedback that helps the learner change an answer or strategy, while emphasizing dependence on task, knowledge and timing. More feedback is not automatically better. Replace a generic “Rough one” as the main message with a correction such as: **“Meaning correct. Article needs practice: die Freigabe.”** A relevant sentence can follow. The precise German feedback design is our proposal. [Author publication record](https://myweb.fsu.edu/vshute/publications.html).

### Keep motivation separate from proof of learning

Sailer and Homner’s 2020 meta-analysis found positive aggregate effects of educational gamification on cognitive, motivational and behavioral outcomes. In stronger-design subsets, cognitive effects remained significant while motivational and behavioral effects did not; those smaller subsets were underpowered. This supports neither blanket enthusiasm nor blanket removal. Keep quiet encouragement if helpful, make habit cues optional, and test whether they support useful practice. [Full article](https://link.springer.com/article/10.1007/s10648-019-09498-w).

Kaliisa and colleagues’ 2024 review of 38 learning-dashboard studies found limited achievement evidence and serious design limitations; participation benefits were more promising. Displaying data does not by itself establish a learning benefit. For Coach, a count should lead to a sensible action, such as reviewing specific weak words. [Published abstract](https://www.saqr.me/publication/2024-kaliisa-learning-analytics-dashboards-lived-hype/).

### Reddit adds useful questions, not scientific verdicts

The selected discussions point to six tensions worth testing:

1. **Guidance versus control.** Some learners appreciated Duolingo’s clear path; others wanted topic choice and easier revisits. Coach should recommend a next step with “Change focus” nearby. [R11](https://www.reddit.com/r/duolingo/comments/ykbprw/dear_duolingo_gasp_a_post_appreciating_the_new/).
2. **Visual simplicity versus understandable behavior.** Anki users both praised its short deck-to-study route and struggled with settings or terminology. White space alone cannot explain learning states. [R3](https://www.reddit.com/r/Anki/comments/1l56142/why_do_a_lot_of_people_think_anki_has_an_outdated/), [R4](https://www.reddit.com/r/Anki/comments/1wi63xj/am_i_an_idiot_or_is_this_app_way_more_complicated/).
3. **Motivation versus obligation.** Streaks and challenges helped some users return; others described anxiety, displaced goals or disengagement after a break. Offer a forgiving restart and optional activity goals. [R7](https://www.reddit.com/r/languagelearning/comments/14a2pze/gamified_language_learning_apps_do_they_truly/).
4. **Useful exercises versus surrounding noise.** Criticism of XP and engagement features sometimes came from people who still liked the exercises. Reduce competing metrics before removing practice variety. [R8](https://www.reddit.com/r/duolingo/comments/1q3ie9j/tired_of_all_the_gamification_engagementgrowth/).
5. **Backup versus sync.** Anki questions revealed fear and uncertainty about where data lived. Coach needs clear explanations of local storage, a downloaded backup and replacement during restore. It does not need cloud sync merely because another product has it. [R6](https://www.reddit.com/r/Anki/comments/1kx5pz9/new_to_anki_from_ankipro_syncing_between_devices/).
6. **Convenient explanations versus correct explanations.** A German feedback thread contained appreciation and a challenge to the grammar explanation. Keep explanations short, but verify their content. [R12](https://www.reddit.com/r/duolingo/comments/1qedvm1/i_like_the_new_duolingo_feature_explain_my/).

These are historical, self-reported experiences across different products and versions. Appendix A lists all 12 threads, including counterviews. No claim of majority preference is made.

## 5. What “learn German quickest” should mean

There is no defensible single fastest method independent of the learner, skill, starting point and target. Three different goals can conflict: minimum calendar time, maximum learning per hour, and durable use after practice stops. An intensive course may compress the calendar by using many more hours; that is not automatically greater efficiency per hour.

For you, the useful target is concrete: **understand and contribute to recurring marketing tasks with less preparation and fewer communication failures.** A memorized word list is one ingredient. Listening to a colleague, asking a clarifying question, describing a KPI and responding to an unexpected follow-up are different performances.

CEFR describes ability through structured “can-do” descriptors across activities. A vocabulary count or an app score cannot establish a CEFR level. Use workplace tasks inspired by that approach, while avoiding a claim that our custom rubric is an official CEFR assessment. [Council of Europe](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors).

### A practical learning loop

**Encounter → retrieve → correct → use → revisit → transfer.**

- Encounter a word in a short, understandable work context with its meaning and sound.
- Retrieve the word or phrase without seeing the answer.
- Compare with a precise correction; distinguish a wrong article from a wrong meaning.
- Use it in a sentence, short spoken update or response to another person.
- Revisit it after a delay, adjusting the next review from actual performance.
- Test it in a different example or situation so success is not tied to one memorized prompt.

This is an evidence-informed synthesis, not a published six-step protocol. The research below supports parts of the loop; no single paper validates the whole proposed app.

### Remembering later is different from performing well now

Roediger and Karpicke’s 2006 experiments found that repeated study could look better after five minutes, whereas retrieval practice improved later recall after two days or a week. Soderstrom and Bjork’s 2015 review develops the broader distinction between learning and temporary performance. These sources concern controlled learning tasks, not a guarantee of conversational fluency. They support keeping first-attempt and delayed performance distinct. [Retrieval study](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/); [learning-versus-performance review](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/11/soderstorm_ra_learningvsperformance.pdf).

### Spacing has strong support; a fixed magic calendar is not

Cepeda and colleagues’ 2008 study of 1,354 participants found that useful study spacing depended on how far into the future retention was tested. It used trivia facts, with attrition at long delays. The implication is to plan delayed review; it does not validate universal intervals or the app’s three-day milestone. [Author-hosted paper](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf).

### Recognition is a support, not the same evidence as production

Butler and Roediger’s 2008 study with 72 undergraduates found that feedback following multiple-choice practice improved later recall and reduced learning of incorrect alternatives. Feedback timing effects were task-specific. Keep recognition practice as an accessible entry point, explain mistakes, and later ask for the German without choices. Do not count the two activities as identical evidence. [Published paper](https://link.springer.com/content/pdf/10.3758/MC.36.3.604.pdf).

### High frequency is useful, but “1,000 words = fluency” is not

The current wordfreq dataset is a historical, mixed-source snapshot; its maintainer describes coverage through roughly 2021. It is not a live measurement of German marketing conversations. Common forms should help order eligible new general-language entries, with uncertain scores treated honestly. [wordfreq documentation](https://github.com/rspeer/wordfreq).

Nation’s 2006 English corpus analysis illustrates why percentage claims need care: estimates for high text coverage vary with reading versus listening and with word-family definitions. Its 98% coverage estimates were much larger than 1,000 families. This was a corpus analysis, not a German fluency trial; do not transfer its exact thresholds to you. Even 80% token coverage leaves approximately one unfamiliar token in five, and token coverage is not the same as understanding 80% of a conversation. [Publisher abstract](https://doi.org/10.3138/cmlr.63.1.59).

For German, learn useful units: **die Kennzahl, die Kennzahlen**; **eine Kampagne auswerten**; **auf eine Freigabe warten**. Word form, meaning, article, plural, sound and typical combinations contribute different knowledge. A general corpus will often rank specialist phrases poorly; your work can still make them urgent. Do not force all function words or all low-frequency compounds into an identical flashcard format.

### Direct second-language evidence

**Spaced practice: relatively strong direct support.** Kim and Webb’s 2022 meta-analysis covered 48 experiments and 3,411 learners. It found a medium-to-large spacing benefit; longer spacing was more advantageous on delayed than immediate tests. It did not establish expanding intervals as universally superior to equal intervals. This strengthens the case for a real review queue while leaving the exact schedule open. Access: publisher abstract. [L1](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479).

**Repeated retrieval: judge gains against time.** Nakata’s 2017 study had 98 Japanese learners study 16 English-Japanese pairs with different numbers of retrievals. More repetitions improved absolute retention, but one retrieval produced the largest gain when time-on-task was controlled. Our design inference is to avoid endless same-session repetition of already-correct words; it does not mean one attempt permanently teaches a word. Access: publisher abstract. [L2](https://doi.org/10.1017/S0272263116000280).

**Deliberate vocabulary study: effective, with substantial forgetting.** Webb, Yanagisawa and Uchihara’s 2020 meta-analysis included 22 studies and 2,202 learners. Mean immediate meaning/form recall gains were about 60%/59%, versus about 39%/25% on delayed tests. Treatments lasted at most one day and tests emphasized form-meaning links. Use selected flashcards and writing tasks, then revisit them; do not equate a trained-word gain with full language competence. Access: full paper. [L3](https://doi.org/10.1111/modl.12671).

**Input: valuable, but exposure does not guarantee word acquisition.** Webb, Uchihara and Yanagisawa’s 2023 synthesis included 24 studies and 2,771 learners. Meaning-focused exposure produced some vocabulary learning, with average target-word gains varying by condition and test. These measures omit many benefits of comprehension practice. Combine a short understandable report or dialogue with deliberate attention to useful words. Do not divide its results into the previous meta-analysis to invent a speed multiplier: the studies were not matched comparisons. Access: full paper. [L4](https://doi.org/10.1017/S0261444822000507).

**Comprehension and production: train both.** Shintani, Li and Ellis’s 2013 meta-analysis of 35 research projects found benefits from both comprehension-based and production-based grammar instruction. Initial receptive and delayed productive outcomes differed by approach. This argues for both understanding a German update and producing a different one, rather than assuming recognition practice covers speaking. It does not specify an ideal input/output ratio. Access: publisher abstract. [L5](https://onlinelibrary.wiley.com/doi/10.1111/lang.12001).

**Corrective interaction: useful, with context.** Lyster and Saito’s 2010 classroom meta-analysis included 15 studies and 827 learners. Oral corrective feedback helped, including on delayed tests. Prompts had some advantages over recasts, but uncertainty and study variation matter. Give yourself opportunities to repair a sentence after feedback; do not interrupt every conversational error or assume automated feedback is always accurate. Access: full paper. [L6](https://kazuyasaito.net/SSLA2010.pdf).

**Pronunciation: requires more than playback.** Lee, Jang and Plonsky’s 2015 meta-analysis of 86 reports found substantial instruction effects, with larger gains on more controlled assessments. Feedback was associated with stronger outcomes. Practice speaking and obtain focused feedback on intelligibility; also assess a fresh response, because controlled and spontaneous performance can differ. No generic speech-recognition score is validated by this research. Access: indexed publisher abstract; full text inaccessible. [L7](https://doi.org/10.1093/applin/amu040).

**Useful phrases: promising, more limited evidence.** Boers and colleagues’ 2006 study involved 32 English-major students over 22 teaching hours. The group encouraged to notice conventional word combinations received better oral-proficiency ratings from two blind judges. The small sample and perceived-proficiency outcome limit broad claims. Teach reusable combinations such as “die Zielgruppe erreichen,” then vary the context; do not replace grammar or comprehension with memorized scripts. Access: publisher abstract. [L8](https://journals.sagepub.com/doi/abs/10.1191/1362168806lr195oa).

**Intensity: distinguish calendar compression from proven superiority.** Serrano and Muñoz’s 2007 study compared course schedules with 110 planned hours across different calendar spans. Among 76 test completers, the manuscript reports no significant program-by-time interaction or between-program posttest differences. Its favorable intensive-course framing therefore should not be treated as decisive comparative proof. Different teachers, attrition and no delayed test further limit inference. More weekly time may suit your goal, but this study does not establish a fastest schedule. Access: author manuscript and publisher abstract. [L9](https://diposit.ub.edu/items/457c4ebe-8087-4511-9f7a-044a352b2fd2/full).

### Which approaches deserve your time?

| Approach | Recommendation for your goal | Confidence and limit |
| --- | --- | --- |
| Spaced, unaided recall with correction | Core of vocabulary retention | Strong general and direct L2 support; exact scheduling needs validation |
| Deliberate study of useful words and phrases | Prioritize marketing tasks plus common supporting German | Good support for trained vocabulary; no automatic conversational transfer |
| Understandable listening/reading plus production | Essential complement to cards | Skill-specific evidence; balance depends on current weakness |
| Speaking with selective feedback and repair | Use regularly for meeting and reporting goals | Supported classroom evidence; teacher quality and task matter |
| Useful phrase patterns and scenario variation | Include alongside words and grammar | Promising; exact marketing curriculum is editorial |
| Massed rereading or repeating easy cards | Limited role for initial familiarization | Immediate ease can hide weak delayed retention |
| Streaks, badges, mascots and timers | Optional supports for a sustainable habit | Not independent proof of language learning |
| A fixed CIA timer, word-count guarantee or fluency deadline | Do not build the plan around it | Not substantiated by the reviewed primary evidence |

Most selected L2 studies concern English learners and structured instruction. None directly establishes the fastest route for an adult marketing professional learning German. The combined recommendation is therefore a well-supported direction with a personal evaluation plan, not a guaranteed formula.

## 6. Investigating the “CIA language learning trick”

**I did not find a single publicly documented, standardized CIA protocol matching that phrase.** A traceable popular source is Andrew Bustamante’s article *Rapid Language Learning*, published on his Everyday Spy site on 5 September 2019. This is an author’s personal/commercial account, not an official CIA syllabus or a controlled experiment. Without the particular clip you saw, it should not be assumed to be your exact reference or the first origin of the phrase. [Original article](https://everydayspy.com/p/rapid-language-learning).

The article mixes sensible themes with stronger claims. It recommends frequent words, communicating despite imperfection, short sessions and varied practice. It also asserts that 1,000 words provide 80% of conversation in any language, connects this to operational readiness, and proposes a fixed 35-45-minute brain cycle. It does not provide research establishing those numerical or neuroscience claims. Treat them as claims to verify, not facts to build into the product.

| Claim | Finding | What to do with it |
| --- | --- | --- |
| Language should serve a concrete purpose | Consistent with official CIA mission-oriented training | Choose marketing tasks and teach the language they require |
| There is one secret trick that replaces a curriculum | Not established by reviewed public sources | Use the broader learning evidence instead |
| A universal small word count establishes readiness or fluency | Not verified; counting unit, domain and skill are unspecified | Track useful performance, not a magic threshold |
| A fixed brain cycle determines the only effective session length | Not substantiated here | Choose manageable sessions and measure fatigue/performance |
| Variation means abandoning a consistent routine | Not justified | Vary examples and tasks within a sustainable routine |
| Intelligence-language results come from a few app minutes | Not supported by the institutional training context | Account for time, teachers, feedback and real use |

### What official sources actually describe

CIA’s 2022 description of its Intelligence Language Institute covers instruction and testing tailored to mission needs, reading, speaking, listening, cultural knowledge and useful phrases. It describes expert educators and technology-supported instruction. It does not publish a universal word threshold, a validated fluency deadline or comparative success rates. It verifies a serious training program, not the efficacy of a viral shortcut. [Official CIA account](https://www.cia.gov/stories/story/language-empowers-mission/).

CIA, the Foreign Service Institute and the Defense Language Institute are distinct institutions. CIA’s history describes early partnerships with FSI and subsequent development of its own courses; shared history does not make them one method. [CIA history](https://www.cia.gov/stories/story/origins-of-foreign-language-at-cia/).

DLI’s current public description gives important workload context: seven classroom hours a day, five days a week, plus two to three homework hours nightly; courses last 36-64 weeks depending on language. These are descriptions of a supported institutional program, not a German-specific personal forecast or a CIA schedule. They show why “months” in a full-time program cannot be compared directly with minutes after work. [DLI](https://www.dliflc.edu/about/).

Current FSI German-hour figures could not be independently verified from the updated official page during this research. The familiar archived 900-hour figure should not be presented as a current universal requirement, and secondary reports of revised figures are not substituted as verified facts. No institutional hour estimate is used to predict your CEFR level.

### The useful adaptation for you

Adopt the practical orientation: **“I need to explain a campaign result and answer a follow-up.”** Select vocabulary, phrases, listening examples and feedback around that task. Combine it with spaced retrieval and later assessment. You can begin communicating imperfectly while still correcting recurring errors; functional communication and accuracy are compatible goals.

In the app, call this **Marketing at work**, not “CIA mode.” A scenario can ask you to explain a KPI change, request creative approval or clarify a CRM handoff. Change the facts on the next attempt. Preserve a regular habit, include actual speaking opportunities and judge whether someone understands you. The claim is a practical, evidence-informed curriculum direction, not CIA endorsement.

## 7. Six UI/UX improvements, with examples

These are proposed designs. They preserve the reliability fixes and the offline-first character of the app. Example counts are illustrative, not your personal results.

### 1. Make Today a useful starting point

**Current:** a large greeting and mascot, phrase of the day, mission, weekly target and mode tabs all ask for attention.

**Proposed:** compact identity at the top and direct access to the next useful word. Remove a required round length or time commitment from the default path. Keep topic choice visible and the daily phrase secondary. Fixed rounds can remain under More practice for someone who explicitly wants a bounded challenge.

**Example:** “Today · Marketing German / Focus: CRM handoff / One word at a time. Stop whenever you need. / Practise now / Change focus.” Returning to practice opens the pending prompt or the next useful word without requiring a new round setup.

**After scheduling exists:** the card may show “6 reviews available,” without requiring all six before progress counts. Until then, say “Suggested practice”; do not invent a due count. Preserve completed answers and a draft of the current prompt so “Continue” has a real saved state behind it.

**Why:** your available time determines how long you continue. **Acceptance:** you can answer once, leave, reopen and see that answer retained; you can also keep answering without a results screen or restart every few words. Test at narrow widths and with enlarged text.

### 2. Use the same three destinations everywhere

**Current:** top-level Progress/Missed controls, mobile Home/Progress/Missed navigation, and Marketing/Practice/Learn/Review sub-tabs mix destinations, subjects and formats.

**Proposed:** **Today / Words / Progress**, with a clearly labeled Settings control. Put “Change focus” inside Today and category/search controls inside Words. Offer other practice formats under “More practice” or in the learning sequence when relevant.

**Example:** to prepare for a meeting, open Words → Meetings → “Practise this topic.” To see improvement, open Progress. To move devices, open Settings → Backup and restore.

**Why:** labels describe the job rather than the implementation. Three destinations are a proposal, not a universal UX rule. **Acceptance:** desktop and mobile use the same names; selected state is clear; Back returns predictably; navigation preserves submitted answers and the current draft without treating a pause as an abandoned round.

### 3. Turn the vocabulary bank into a usable library

**Current:** large repeated cards display category, stage, status, translation, examples, aliases and notes. Search and the practice button can refer to different scopes.

**Proposed:** visible search, topic filter and learning-state filter; compact rows with expandable details. Keep pronunciation accessible. Allow selecting a few words for a personal work set without mutating their evidence status.

**Example row:** “die Freigabe · approval · Recall: 1 qualifying day.” Open it for plural, sound, “Wir brauchen die Freigabe für die Kampagne,” usage notes and accepted alternatives.

**Example scope:** “Conversion · 4 results” → “Practise these 4.” If only category practice exists, label the button “Practise all 20 KPI words” and keep that scope beside it.

**Why:** quick scanning and honest practice selection. **Acceptance:** finding a term, hearing it and starting practice have visible paths; unknown frequency is not labeled rare; users can copy German text into notes.

### 4. Make the practice loop teach one thing clearly

**Current:** several independent modes and score-oriented results; some retry behavior can overwrite an earlier error in exercise results.

**Proposed:** one focused prompt, a hint/reveal route and concise corrective feedback. Save each submitted answer immediately, including first attempt, hint use and later correction separately. A reveal is a learning action, not a correct unaided recall. After feedback, offer “Next word” and an obvious “Stop for now.” Do not auto-advance or insert a compulsory results screen after a fixed number.

**Example:** prompt “approval” → answer “der Freigabe” → “Meaning correct. Use **die Freigabe**.” Then an optional explanation and a short task: “Say that the campaign still needs approval.” The app should not show the full target answer in the prompt before the recall attempt.

**After one answer:** “Saved · Meaning correct; article needs practice.” Then “Next word” or “Stop for now.” If you stop after two answers, an optional quiet summary can say “2 words practised”; it must not become a required step before progress is saved. Progress holds the longer correction list. Keep successful corrections visible as learning, without erasing the first error.

**Why:** feedback changes what you do next, and stopping stays easy. **Acceptance:** the learner can explain the error and produce a new appropriate example; score denominators and treatment of hints are clear; closing after a saved answer never requires replaying it to finish a batch. Repeating a word in a new short visit on the same day must not earn another qualifying mastery day.

### 5. Show progress as evidence you can understand

**Current:** whole-bank mastery percentage, best scores, overall accuracy, rounds and a 70% streak compete.

**Proposed:** a small evidence summary for the selected learning track, an actionable weak-word list and optional history. Keep activity separate from recall. Prefer **“Recall verified”** over the broader “Mastered,” with a plain explanation.

**Example:** “Recall verified: 18 words. Each has 3 fully correct typed recalls on separate days, at least 24 hours apart. This does not measure speaking ability or guarantee permanent retention.” A recent error should guide review; it need not imply that every dimension of word knowledge was lost.

**Activity example:** “Practised on 4 days this week.” **Learning example:** “Recalled 12 of 16 tested words without hints after a delay.” Only show the second statement if the app actually records that test and denominator.

**Why:** confidence should follow the evidence. **Acceptance:** you can explain each count, identify what needs practice, and distinguish exposure, recognition, productive recall and communicative use. Do not manufacture a single “German fluency %.”

### 6. Make Settings and data recovery calm and explicit

**Current:** level overrides, profile, imports, backup controls and reset sit in the long Progress panel.

**Proposed:** Settings groups learning preferences, accessibility/audio, privacy, and data. The data section leads with “Download full backup,” then “Restore backup,” with CSV under “Word list transfer.” Put reset separately with consequences.

**Example copy:** “Progress is stored in this browser. A full backup is a file you download; it does not automatically sync devices.” Restore should show backup date, counts and replacement implications, and preserve the implemented safety-copy route.

**Why:** maintenance becomes findable without crowding daily practice. **Acceptance:** a learner can save and restore a disposable profile, explain what is included, and cancel safely. A failure message directs to a complete backup and never implies unsaved progress is safely stored.

## 8. One combined experience, from first use to return

### Proposed screen sequence

**Today:** default to the last selected marketing focus, with an easy way to change it. Name is optional and genuinely local. “Practise now” leads to one question without a round-size selection or countdown.

**Practice:** present one question at a time. Start with learning support when a word is new; later ask for unaided recall. Save the answer before showing a saved confirmation, show its correction, then let the learner continue or stop. A sentence-use task can be offered without making it compulsory before a word answer counts. Speaking and longer scenarios remain available when time allows.

**Pause and return:** leaving after one or two answers is a normal use case. Keep a pause summary optional, retain the current draft without grading it, and resume without replaying saved items. “Next word” is a deliberate choice; avoid automatic loading, escalating rewards or “just one more” pressure. Schedule a future review only when that capability exists.

**Progress:** track changes in delayed recall and work-task ability. Make evidence and uncertainty visible. The current three-day rule remains an understandable milestone, not the endpoint of learning.

### Edge states that the redesign must handle

| Situation | Proposed behavior |
| --- | --- |
| First visit | Short optional setup, then useful practice; explain unfamiliar labels when encountered |
| Returning after a break | Welcome back; offer a manageable review set; do not equate a broken habit with lost knowledge |
| Too many reviews | Offer one item at a time, allow pausing new words, and preserve the remaining queue without a requirement to clear it now |
| No review items | Say so and offer new words or a scenario; do not fill a fake due queue |
| Search has no results | Preserve the query, explain the result and offer clear filters/reset |
| Leaving after one answer | Retain the submitted result immediately; preserve any next-answer draft and make return easy |
| Offline / audio unavailable | Text practice continues; identify unavailable audio without blocking the task |
| Browser cannot save | Persistent visible warning, full backup action, and no success claim for an unsuccessful save |
| Wrong or future backup format | Reject without changing current data; explain how to recover |
| Keyboard or screen-reader use | Logical focus, clear control names, concise status announcements and no hidden interactive background |

### Learning priorities and review scheduling are separate decisions

For a new item, ask: Is this relevant to the selected work goal? Is its supporting language suitable? Is it common enough to recur? For an encountered item, ask: When was it attempted, with what help, and what happened? Do not continually promote easy high-frequency words while postponing difficult but due specialist words.

A future scheduler should persist review state, survive backup/restore and migrations, handle time-zone/day boundaries, and explain why a word appears. Start with a transparent rule or a well-tested existing approach, then validate against your data. Avoid an unexplained “AI says you are ready” label. No scheduling algorithm or exact interval series is selected by this report.

### Continuous practice needs a real save-and-resume model

This is more than changing the name of a round. Each submitted answer needs its own saved record; a pause or browser reload must not duplicate it or erase its first attempt. Preserve the word, result, time and help used together, and include these records and resumable drafts in full backups. A draft is not a graded attempt. If saving fails, show “Not saved” with recovery options rather than quietly moving on. Existing round history should remain readable after this change.

Review timing and mastery remain word-specific across visits. Opening the app ten times in one day does not create ten spaced recall days. Stop introducing new items when the learner chooses, but allow further useful review without a forced restart. One or two answers are legitimate practice; they do not provide the same total exposure or speaking experience as a longer varied session. Assess cumulative practice and later recall, not visit length alone.

## 9. A four-week personal learning experiment

The plan below is a starting experiment for your work goal, not a fluency guarantee or a research-validated dose. Adjust for your present skill and available time. If an item is already easy, test it and move on; do not repeat beginner content merely to fill a quota.

### A flexible menu for whatever time you have

| Activity | Smallest useful starting point | What success looks like |
| --- | --- | --- |
| Recall an earlier word | One answer | Try without hints; save the attempt and show a specific correction |
| Learn useful new language | One new word or phrase | Understand its meaning and use; limit new items if review accumulates |
| Understand a relevant example | One short paragraph or audio excerpt | Explain its main message; extend the task if you have more time |
| Speak or write a work response | One sentence | Use the language with changed facts and feedback where available |
| Revisit a correction | One improved attempt | Repair the error, retaining the first attempt and help used as separate evidence |

There is no required 25-minute block or daily checklist. Answer one or two questions when an opportunity appears, or keep going when you have time. Over the week, include understanding and using German as well as recalling words. When practical, arrange a longer conversation with a competent German speaker or teacher who can respond and correct selectively. Reading aloud helps rehearsal; it does not replace unpredictable interaction. The weekly work goals below provide direction, not compulsory batch sizes.

### Weekly work goals

| Week | Work situation | Example performance to record |
| --- | --- | --- |
| 1 | CRM and handoff | Explain where a lead came from, its status and the next action in a short update |
| 2 | KPIs and campaign reporting | Describe a change, distinguish the metric from its cause, and ask a clarification question |
| 3 | Briefs, creative work and approval | Request a change to copy or a creative, explain the purpose and confirm approval/deadline |
| 4 | A mixed marketing meeting | Give a 60-90-second update, answer two follow-ups and send a short recap |

Use general German as connective tissue: “weil,” “deshalb,” “im Vergleich zu,” “bis Freitag,” “Könnten Sie …?” Specialist nouns alone do not create usable speech. Practice asking for repetition or clarification rather than pretending to understand.

### Example mini-scenario: reporting results

“Die Klickrate ist gestiegen, aber die Conversion-Rate ist gesunken. Wir sollten die Landingpage prüfen.”

Then change the numbers or situation and ask for a new explanation. For example, a conversion rate moving from 2% to 3% increases by **one percentage point**, or **50% relative to the initial rate**. State the denominator and time window. Learning the German phrase should not teach a misleading KPI interpretation.

For CRM, pair vocabulary with action: “Können Sie den Lead dem Vertrieb zuweisen?” For approvals: “Wir brauchen die Freigabe bis Freitag.” For meetings: “Könnten Sie das bitte kurz erläutern?” These are proposed teaching examples, not extracts from a workplace corpus.

### What to measure personally

Before the plan, record a short marketing update and attempt a small sample of relevant words without hints. At the end of each week, use a different prompt and some previously studied words after a delay. Keep conditions reasonably comparable. Ask a proficient speaker to judge whether the main message is clear, the language is appropriate, and clarification is needed.

Track retained items and task success alongside minutes invested. Do not judge the plan only by the number of new cards. A four-week comparison for one person is useful self-observation, not proof of causality; work exposure, motivation and task differences can influence results.

## 10. Accessibility and interaction requirements

Aim for WCAG 2.2 AA across complete tasks. This report identifies risks and test targets; it is not a conformance statement. WCAG is a standard, while WAI-ARIA APG provides interaction-pattern guidance. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

**Keyboard and dialogs.** Test setup, practice, filters, result actions and restore without a pointer. If an overlay is modal, focus must enter it, remain appropriately contained, and return on close; the background must not remain interactive. Choose clear semantics for tabs or ordinary navigation and implement the corresponding behavior. Source inspection found a tablist with incomplete tab relationships and no matching arrow-key behavior. [Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/); [modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**Readable language and feedback.** Mark German passages appropriately for assistive technology. Do not rely on color alone; use clear text, with icons where helpful. Announce concise answer/save feedback rather than an entire long result panel. Allow text selection/copy as a practical usability improvement; it is not a standalone AA criterion. Preserve natural text wrapping for German compounds.

**Targets and focus.** WCAG 2.2 AA’s target-size criterion is 24 × 24 CSS pixels with defined exceptions; 44 × 44 is the enhanced AAA criterion. Aim for comfortable larger targets for frequent touch actions. AA requires focus not to be entirely hidden by author-created content; avoiding any obscuration is a stronger design target. [Target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); [focus criterion](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum).

**Contrast.** Ordinary text generally requires 4.5:1 and qualifying large text 3:1, with stated exceptions; do not round a failing ratio up. A token-level calculation against the nominal #fffaf6 panel gave muted gray about 4.68:1, amber about 3.62:1, red about 4.49:1 and green about 5.11:1. Amber and red combinations deserve attention for normal text. Actual rendered backgrounds and states must be measured before declaring a failure or pass. [Contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

**Reflow and zoom.** Test at 320 CSS pixels, enlarged text, zoom, long answers and the mobile keyboard; a wider screenshot is insufficient. A smaller visual footprint must not shrink controls or remove explanatory text users need. [Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

**Reduced motion.** Respect motion preferences for smooth scrolling and celebrations. This is an additional product recommendation: interaction-animation criterion 2.3.3 is AAA, and using `prefers-reduced-motion` is a documented technique rather than a mandatory universal AA implementation. [W3C technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).

## 11. What to build first

| Sequence | Scope | Completion condition |
| --- | --- | --- |
| 1. Protect trust | Per-answer save/resume design, name/privacy behavior, storage warning, accurate answer records | A saved answer survives leaving; saving failure is visible; no duplicate attempts on return |
| 2. Simplify the core | Continuous practice, Today, consistent navigation, separate Settings, accessible interaction foundations | One answer or many both work; fixed rounds are optional; existing history and backups remain valid |
| 3. Improve learning feedback | First-attempt evidence, hints/reveals, correction quality, compact results | Errors remain visible as evidence; corrected attempts are recorded separately |
| 4. Add scheduled review | Due state, queue limits, migrations and full-backup coverage | Reviews actually follow a persisted schedule and survive restore |
| 5. Strengthen transfer | Marketing scenarios, usable phrases, listening/production and human feedback workflow | Improvement assessed with fresh tasks, not just repeated cards |
| 6. Refine from observation | Library density, optional habit cues, visual personality | Changes address observed problems without reducing findability or access |

These are implementation dependencies, not calendar estimates. Exact effort depends on whether the current single-file application is refactored and how much scheduling or speech functionality is introduced. A small prototype of the main screens should precede broad UI implementation.

Defer leaderboards, more badges, a public social layer, cloud sync, an AI chat feature, an elaborate animated learning map and a larger dashboard. They add scope without resolving the central problem. This is a prioritization decision for this project, not a claim that those features are always ineffective.

## 12. How to know the redesign worked

### Test usability and learning separately

Use Vinay first, because this is his work tool. If the app is intended for others, conduct two small formative rounds with roughly 6-8 relevant learners per round, including differing German levels and access needs. This is a practical discovery plan, not a statistical guarantee. Faulkner’s 2003 study of 60 users found substantial variation in the issues discovered by five-user subsets; “five users find everything” is not defensible. [Publisher abstract](https://link.springer.com/article/10.3758/BF03195514).

Give task prompts without navigation hints: answer one question before a meeting, leave and return; continue for several more answers without restarting; find an earlier CRM word; explain a progress label; understand an article correction; and transfer a disposable profile safely. Observe saved answers, wrong turns, misunderstood labels, recovery and perceived ease. Record whether the learner finds the right action, not just whether they prefer a screenshot. Leaving after two saved answers is success, not abandonment.

Use the same important tasks before and after changes. The HEART work provides a useful goals-to-metrics approach; it does not supply a universal target percentage. [Rodden, Hutchinson and Fu, 2010](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/); [NN/g benchmarking guidance](https://www.nngroup.com/articles/product-ux-benchmarks/).

| Goal | Useful measurement | Guardrail |
| --- | --- | --- |
| Begin relevant practice | Time and success from opening Today to first intended question | Do not optimize taps at the expense of choosing the wrong topic |
| Understand progress | Learner explains the label, evidence and denominator | A pretty chart is not understanding |
| Retain vocabulary | Unaided recall after a stated delay, with hints tracked | Compare similar item difficulty and exposure; retain first attempts |
| Use language at work | Fresh scenario response, comprehension and follow-up handling | Repeating a memorized model answer is not transfer |
| Recover safely | Complete backup/restore with matching state in disposable data | No real learner data used for destructive testing |
| Sustain practice | Voluntary return, saved attempts and later recall | Completed-round counts must not penalize short visits; longer use can also indicate confusion |

For a stronger learning comparison, randomize matched vocabulary sets within a learner or use appropriately allocated groups, keep study time comparable, counterbalance order, and test delayed recall plus a fresh use task. Decide the primary outcome and analysis before collecting data. A study intended to estimate an effect needs a sample-size rationale; this report does not invent one.

Do not collect names, answer text or sensitive work examples merely to measure navigation. Prefer local or anonymous events with clear definitions. Correct the current completion-event bug before benchmarking. The safest first evaluation can be direct observation and a small local learning log.

**Recommended product direction:** a dependable marketing German practice loop with clear evidence, rather than an expanding collection of loosely connected learning widgets. The next design should help you answer three questions: What should I practise? What did I actually remember? Where can I use it?

## Appendix A. Source register and reading limits

The register contains **53 sources: 21 scholarly papers/reviews, 13 expert or accessibility sources, 7 institutional/popular/data sources, and 12 Reddit threads**. All were checked for this report on 16 November 2026. Access level is explicit: an abstract-only source is not presented as a full-methods review. Linked titles open the original source or the stated author/university copy. Dates refer to publication or the stated edition, not search-engine crawl dates.

### A1. Learning and UX scholarship

**P1 · Michael Noetel; Shantell Griffith; Oscar Delaney; Nicola Rose Harris; Taren Sanders; Philip Parker; Borja del Pozo Cruz; Chris Lonsdale (2022).** [Multimedia Design for Learning: An Overview of Reviews With Meta-Meta-Analysis](https://doi.org/10.3102/00346543211052329). University-hosted abstract and bibliographic record; full manuscript inaccessible.

**P2 · Henry L. Roediger III; Jeffrey D. Karpicke (2006).** [Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention](https://doi.org/10.1111/j.1467-9280.2006.01693.x). Primary journal abstract; author PDF timed out.

**P3 · Nicholas J. Cepeda; Edward Vul; Doug Rohrer; John T. Wixted; Harold Pashler (2008).** [Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention](https://doi.org/10.1111/j.1467-9280.2008.02209.x). Author-hosted full paper; methods and limitations inspected.

**P4 · Andrew C. Butler; Henry L. Roediger III (2008).** [Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing](https://doi.org/10.3758/MC.36.3.604). Publisher full paper; methods and results inspected.

**P5 · Valerie J. Shute (2008).** [Focus on Formative Feedback](https://doi.org/10.3102/0034654307313795). Full published paper read through a mirror; metadata checked against the author's publication list. [Accessible paper](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).

**P6 · Michael Sailer; Lisa Homner (2020).** [The Gamification of Learning: a Meta-analysis](https://doi.org/10.1007/s10648-019-09498-w). Full publisher article; subgroup results and limitations inspected.

**P7 · Rogers Kaliisa; Kamila Misiejuk; Sonsoles López-Pernas; Mohammad Khalil; Mohammed Saqr (2024).** [Have Learning Analytics Dashboards Lived Up to the Hype? A Systematic Review of Impact on Students’ Achievement, Motivation, Participation and Attitude](https://doi.org/10.1145/3636555.3636884). Published abstract and metadata verified; open preprint accessed, without detailed study-level extraction. [Preprint](https://arxiv.org/abs/2312.15042).

**L1 · Su Kyung Kim; Stuart Webb (2022).** [The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis](https://doi.org/10.1111/lang.12479). Primary publisher abstract; detailed subgroup estimates not extracted.

**L2 · Tatsuya Nakata (2017).** [Does repeated practice make perfect? The effects of within-session repeated retrieval on second language vocabulary learning](https://doi.org/10.1017/S0272263116000280). Primary publisher abstract and metadata; efficiency calculations not independently extracted.

**L3 · Stuart Webb; Akifumi Yanagisawa; Takumi Uchihara (2020).** [How Effective Are Intentional Vocabulary-Learning Activities? A Meta-Analysis](https://doi.org/10.1111/modl.12671). Author-hosted full paper; methods and limitations inspected.

**L4 · Stuart Webb; Takumi Uchihara; Akifumi Yanagisawa (2023).** [How effective is second language incidental vocabulary learning? A meta-analysis](https://doi.org/10.1017/S0261444822000507). Author-hosted full paper; methods context and limitations inspected.

**L5 · Natsuko Shintani; Shaofeng Li; Rod Ellis (2013).** [Comprehension-Based Versus Production-Based Grammar Instruction: A Meta-Analysis of Comparative Studies](https://doi.org/10.1111/lang.12001). Primary publisher abstract and metadata; detailed subgroup analyses not extracted.

**L6 · Roy Lyster; Kazuya Saito (2010).** [Oral Feedback in Classroom SLA: A Meta-Analysis](https://doi.org/10.1017/S0272263109990520). Author-hosted full paper; classroom-only selection and limitations inspected.

**L7 · Junkyu Lee; Juhyun Jang; Luke Plonsky (2015).** [The Effectiveness of Second Language Pronunciation Instruction: A Meta-Analysis](https://doi.org/10.1093/applin/amu040). Indexed primary publisher abstract inspected; direct full-text access failed.

**L8 · Frank Boers; June Eyckmans; Jenny Kappel; Hélène Stengers; Murielle Demecheleer (2006).** [Formulaic sequences and perceived oral proficiency: putting a Lexical Approach to the test](https://doi.org/10.1191/1362168806lr195oa). Primary publisher abstract; restricted full text.

**L9 · Raquel Serrano; Carme Muñoz (2007).** [Same hours, different time distribution: Any difference in EFL?](https://doi.org/10.1016/j.system.2007.02.001). University-hosted author manuscript methods/results inspected; final publisher abstract checked.

**S1 · Soderstrom, N. C.; Bjork, R. A. (2015).** [Learning Versus Performance: An Integrative Review](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/11/soderstorm_ra_learningvsperformance.pdf). Author-hosted published PDF; abstract and review scope inspected. Integrative review, not an app trial.

**S2 · Scheibehenne, B.; Greifeneder, R.; Todd, P. M. (2010).** [Can There Ever Be Too Many Options? A Meta-Analytic Review of Choice Overload](https://archive-ouverte.unige.ch/unige:76440). University-hosted published PDF; abstract reviewed. 50 experiments, 63 conditions, N=5,036.

**S3 · Rodden, K.; Hutchinson, H.; Fu, X. (2010).** [Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/). Google Research publication abstract; linked PDF could not be retrieved. Framework and product examples, not a controlled learning experiment.

**S4 · Faulkner, L. (2003).** [Beyond the five-user assumption: Benefits of increased sample sizes in usability testing](https://link.springer.com/article/10.3758/BF03195514). Publisher abstract. 60-user dataset and sampled subsets; no universal sample guarantee.

**S5 · Nation, I. S. P. (2006).** [How Large a Vocabulary Is Needed for Reading and Listening?](https://openaccess.wgtn.ac.nz/articles/journal_contribution/How_large_a_vocabulary_is_needed_for_reading_and_listening_/12552221/1). University abstract/metadata and indexed publisher abstract. English corpus coverage, not German learner proficiency; publisher page returned 403.

### A2. Expert and accessibility sources

**E01 · Jakob Nielsen / Nielsen Norman Group (2006-12-03).** [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/). Full article opened; accessed 2026-11-16.

**E02 · Raluca Budiu / Nielsen Norman Group (2024-01-15).** [Memory Recognition and Recall in User Interfaces](https://www.nngroup.com/articles/recognition-and-recall/). Full article opened; accessed 2026-11-16.

**E03 · Kelley Gordon / Nielsen Norman Group (2020-03-01; last reviewed 2026-09-01).** [5 Principles of Visual Design in UX](https://www.nngroup.com/articles/principles-visual-design/). Full article opened; accessed 2026-11-16.

**E04 · Alita Kendrick / Nielsen Norman Group (2020-09-13).** [7 Steps to Benchmark Your Product’s UX](https://www.nngroup.com/articles/product-ux-benchmarks/). Full article opened; accessed 2026-11-16.

**E05 · Page Laubheimer / Nielsen Norman Group (2019-08-11).** [The 3-Click Rule for Navigation Is False](https://www.nngroup.com/articles/3-click-rule/). Full article opened; accessed 2026-11-16.

**E06 · GOV.UK Design System (Undated living guidance).** [Button](https://design-system.service.gov.uk/components/button/). Full component guidance opened; accessed 2026-11-16.

**E07 · W3C Accessibility Guidelines Working Group (2024-12-12 current Recommendation edition).** [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/). Normative standard opened and relevant criteria checked; accessed 2026-11-16.

**E08 · W3C Web Accessibility Initiative (Undated living explanatory guidance).** [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Full explanation opened; accessed 2026-11-16.

**E09 · W3C Web Accessibility Initiative (Undated living explanatory guidance).** [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Full explanation opened; accessed 2026-11-16.

**E10 · W3C Web Accessibility Initiative (Undated living explanatory guidance).** [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Full explanation opened; accessed 2026-11-16.

**E11 · W3C Web Accessibility Initiative, ARIA Authoring Practices Guide (Undated living implementation guidance).** [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Full pattern opened; accessed 2026-11-16.

**E12 · W3C Web Accessibility Initiative, ARIA Authoring Practices Guide (Undated living implementation guidance).** [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Full pattern opened; accessed 2026-11-16.

**E13 · W3C WAI (Updated 2026-01-12).** [Technique C39: Using prefers-reduced-motion to prevent motion](https://www.w3.org/WAI/WCAG22/Techniques/css/C39). Full technique read. Informative implementation guidance related to AAA interaction animation..

### A3. CIA claim provenance, institutions and language resources

**C01 · Andrew Bustamante / Everyday Spy (2019-09-05).** [Rapid Language Learning](https://everydayspy.com/p/rapid-language-learning). Full article opened; accessed 2026-11-16. Original popular personal/commercial account; source of claims, not institutional or experimental verification.

**C02 · Central Intelligence Agency (2022-06-22).** [Language Empowers Mission: The Intelligence Language Institute](https://www.cia.gov/stories/story/language-empowers-mission/). Full article opened; accessed 2026-11-16. Official institutional description; not independent comparative-effectiveness evidence.

**C03 · Central Intelligence Agency (Undated current careers page).** [Intelligence Language Institute](https://www.cia.gov/careers/language-opportunities/intelligence-language-institute/). Full page opened; accessed 2026-11-16. Official institutional description confirming ILI and instructor languages.

**C04 · Central Intelligence Agency (2022-06-08).** [The Origins of Foreign Language at CIA: Carrying Out the Work of a Nation, One Word at a Time](https://www.cia.gov/stories/story/origins-of-foreign-language-at-cia/). Full article opened; accessed 2026-11-16. Official institutional history; distinguishes early partnerships from CIA's own courses.

**C05 · Defense Language Institute Foreign Language Center (Undated current institutional page).** [About](https://www.dliflc.edu/about/). Full page opened; accessed 2026-11-16. Official program description of intensive instruction, homework, course duration and immersion.

**D1 · Robyn Speer (Living documentation; data through approximately 2021).** [wordfreq documentation](https://github.com/rspeer/wordfreq). Original repository documentation opened. Historical frequency data and stated maintenance limits..

**D2 · Council of Europe (Current resource referring to the 2020 Companion Volume).** [CEFR Descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors). Official page opened. Describes structured can-do descriptors; not a vocabulary-to-level conversion..

**Excluded as a current numeric authority:** the updated State Department language-training page could not be fully retrieved. Archived and secondary hour estimates are discussed only as an access limitation. Inaccessible videos and declassified documents that redirected elsewhere were not used to establish a CIA learning protocol.

### A4. Reddit qualitative source ledger

Original posts and visible comments were opened for all 12 threads below. Not every nested comment was expanded. Dates came from indexed thread results; relative age displays can reflect cached pages. Images were not independently inspected, deleted/anonymized comments were excluded, and no vote count was used as a correctness measure. These are experiences and hypotheses, not current-product instructions or outcome studies.

**R1 · r/UXDesign; 14 September 2026.** [How do you break out of the “minimalism trap” as a designer?](https://www.reddit.com/r/UXDesign/comments/1wfxcll/how_do_you_break_out_of_the_minimalism_trap_as_a/). the author feels trapped in generic neutral cards; replies distinguish brand identity from the task flow, and ask whether greater expression supports usability. Others defend restrained design. Access: original post and visible comments, including disagreement about minimalism and intentional brand expression; no images required. A comment explicitly marked AI-assisted was not treated as expert evidence.

**R2 · r/userexperience; 18 September 2020.** [What is the correct way to implement an onboarding tutorial?](https://www.reddit.com/r/userexperience/comments/ivczyq/what_is_the_correct_way_to_implement_an/). several participants dislike mandatory tours; others emphasize testing the actual context instead of treating Reddit advice as a prescription. Access: original dashboard-tour question plus visible comments about testable prototypes, skippable help, value demonstration and contextual explanations.

**R3 · r/Anki; 6 June 2025.** [Why do a lot of people think Anki has an outdated looking UI](https://www.reddit.com/r/Anki/comments/1l56142/why_do_a_lot_of_people_think_anki_has_an_outdated/). the author values a direct deck-to-study workflow; respondents describe a difficult learning model or too many actions. Others warn that hiding controls can increase navigation effort. Access: original post and visible comments debating deck lists, settings, terminology, mobile menus and introductory help.

**R4 · r/Anki; 16 September 2026.** [Am I an idiot or is this app way more complicated than Quizlet?](https://www.reddit.com/r/Anki/comments/1wi63xj/am_i_an_idiot_or_is_this_app_way_more_complicated/). author cannot understand known/remaining/imported counts; other users find the basic flow intuitive or explain that scheduling changes which cards appear today. Some describe frustration at the beginning. Access: original post and visible responses explaining study counts, card browsing and the retention model.

**R5 · r/Anki; 22 August 2023.** [What are your frustrations with Anki?](https://www.reddit.com/r/Anki/comments/15y5uce/what_are_your_frustrations_with_anki/). comments describe unexpected manual sync, confusing browsing/editing and hard-to-reach undo, while appreciating the simple study core. Other contributors want more variety or gamification and describe workflows that already work for them. Access: original question and visible comments; deleted/anonymized text excluded.

**R6 · r/Anki; 28 May 2025.** [New to Anki from AnkiPro - Syncing between devices](https://www.reddit.com/r/Anki/comments/1kx5pz9/new_to_anki_from_ankipro_syncing_between_devices/). author fears data loss while alternating creation/review between devices; respondents explain merge versus one-way sync and recovery. Actual data loss was not established. Access: original post, explanations in replies, and the author's acknowledgement that the explanation helped.

**R7 · r/languagelearning; 15 June 2023.** [Gamified Language Learning Apps: Do They Truly Motivate You?](https://www.reddit.com/r/languagelearning/comments/14a2pze/gamified_language_learning_apps_do_they_truly/). broken streaks can feel demoralizing; competitive goals can displace useful practice. Other participants describe reminders, long streaks, colors, sounds, challenges or social participation as useful ways to start and continue. Access: original questions and visible comments, including targeted reading of positive streak experiences and comments about animations.

**R8 · r/duolingo; 4 January 2026.** [Tired of all the gamification & engagement/growth hacks](https://www.reddit.com/r/duolingo/comments/1q3ie9j/tired_of_all_the_gamification_engagementgrowth/). author wants less XP/streak noise and more relevant progress; some replies regard game elements as core or personally motivating, and others simply ignore them. Access: original post and visible exchange; the author clarifies they still prefer Duolingo's exercises.

**R9 · r/duolingo; 17 November 2024.** [How does Duolingo keep you motivated?](https://www.reddit.com/r/duolingo/comments/1gtghzh/how_does_duolingo_keep_you_motivated/). some value streaks and challenges; others emphasize personally chosen learning goals and supplementary learning. Reported ability and motivation are self-assessments. Access: original question plus visible comments about achievements, goals, lesson variety, language switching and studying with a partner.

**R10 · r/duolingo; 27 June 2026.** [Does anyone else feel like Duolingo is actively discouraging them from studying languages?](https://www.reddit.com/r/duolingo/comments/1uh6kui/does_anyone_else_feel_like_duolingo_is_actively/). a learner who likes gamification objects to quests requiring unwanted subjects despite doing many lessons; another notes this multi-course routine is unusual and that quests fit their own routine more often. Access: original description and visible exchange about daily quests and different study patterns.

**R11 · r/duolingo; 2 November 2022.** [Dear Duolingo (*gasp*, a post appreciating the new layout)](https://www.reddit.com/r/duolingo/comments/ykbprw/dear_duolingo_gasp_a_post_appreciating_the_new/). author values a clear sequence and integrated stories; others miss selecting topics or report disruptive migration and long scrolling. Another user values the sense of forward movement. Access: original appreciation post and visible comments about guidance, browsing, returning to older content, disruption and choice.

**R12 · r/duolingo; 16 January 2026.** [I like the new Duolingo feature “Explain my mistakes”](https://www.reddit.com/r/duolingo/comments/1qedvm1/i_like_the_new_duolingo_feature_explain_my/). author finds in-session explanation convenient and a useful memory aid; another participant says it misses the relevant grammatical distinction. The exchange illustrates perceived usefulness versus explanatory accuracy. Access: original text and visible discussion about a German explanation; screenshot itself not independently inspected.

## Appendix B. Local audit locators

These locators refer to the local 16 November 2026 research snapshot. They help a future implementation return to the owning code. They are not a claim that GitHub main or the hosted app has the same revision. The research did not alter application code.

| Observation | Local source | Verification limit |
| --- | --- | --- |
| Local-only name promise versus analytics identification | index.html:521; app.js:4652 and 4664; index.html:18 | Code path confirmed; actual network delivery not captured |
| Unfinished round cleared while message says parked | app.js:5162; navigation handlers at 7853, 7863 and 7872 | Applies to unfinished state, not already saved history |
| Later write failure does not change persistent save flags | app.js:4631; dashboard status at 6620 | Code risk; no induced production data loss |
| Temporary-mode warning still directs to CSV | app.js:6625 | Hidden in the inspected working preview |
| Status/oldest-first selection without due dates | app.js:4916; recall-evidence.js:174 | Current recall milestone does not expire merely with time |
| Pooled scores and a session-based 70% streak | app.js:4824, 4840 and 6650; index.html:71 | Counts have real definitions; retention interpretation is the concern |
| Text-selection blocking | styles.css:33; editable-field exception at 60 | Browser-specific gestures require validation |
| Progress combines settings, management and data | index.html:48, 160, 223 and 242 | Source grouping and preview inspected; no learner task data |
| Completion event tied to returning home | app.js:5144 | External analytics path, separate from local saved-session counts |
| Required first-run name and limited modal behavior | index.html:517; app.js:4764 and 5264 | Source and limited focus inspection; complete access audit outstanding |
| Already fixed: separate typed recall evidence | recall-evidence.js:99; app.js:6365 | Three-day product milestone; not a fluency assessment |
| Already fixed: full JSON export and safe restore path | app.js:7535 and 7581; backup-data.js:149 | Manual backup, not automatic device synchronization |

**Snapshot integrity:** SHA-256 digests were recorded for app.js, index.html, styles.css, recall-evidence.js and backup-data.js before research. Final checks compare those files to the snapshot so the report can be delivered without silently implementing the proposed redesign.
