# German Vocab Coach

Useful German for marketing work, one question at a time. This local, offline-capable app opens directly on practice, saves each submitted answer separately, and lets you stop without finishing a round. There is no account, analytics, automatic cloud synchronization, or microphone recording.

The original robot-and-German-book logo and app icons are retained in both approved themes.

The continuous-practice interface is implemented in `index.html`, `coach.css`, and `coach-app.js`. The original `app.js` and `styles.css` remain as source material and regression fixtures; the modern interface does not load them or link to a live legacy writer. The live release is hosted at https://vinaynaik432-debug.github.io/german-vocab-coach/ and updates from the `main` branch.

## Run locally

1. Double-click `START_APP.command` and keep its Terminal window open.
2. Open **http://127.0.0.1:4173/**.
3. Use the same browser profile and address for subsequent visits.

Alternatively, run `python3 -m http.server 4173 --bind 127.0.0.1` in this folder. There is no build step or package installation. Automated checks use Node 22+: `node --test tests/*.test.cjs`.

Use a recent browser supporting Web Locks, localStorage and service workers. Localhost/loopback HTTP is suitable for local development; an installed hosted version needs HTTPS. Opening `index.html` directly with `file://` is not the supported saved-practice path. If safe locking or storage is unavailable, the app blocks writes and offers available data for export rather than claiming progress was saved.

## What the app includes

- **Today:** a direct question, optional hint or answer reveal, specific feedback, optional correction, and explicit Next word or Stop for now. An unfinished draft can be resumed. A correction retains the first response and is recorded as supported practice.
- **Words:** compact searchable vocabulary, topic and learning-state filters, expandable details, selected-word practice, and practice limited to the displayed search results.
- **Progress:** separate activity, recall evidence and review information. Recognition, hints and corrections do not become unaided recall. Older records without a schedule are not labelled overdue.
- **Settings:** Cobalt & sunshine or Tangerine studio; optional local name and preferences; full backups, restore, word-list tools and recovery.
- **Marketing at work:** 12 original scenarios across CRM, KPIs, campaigns, meetings, creative feedback and strategy. Short reading/listening and writing/speaking tasks include model answers and variations. Self-review is labelled as such; there is no automatic claim of speaking proficiency.
- **Other ways to practise:** recognition choices, optional 5/20-prompt sets, stories, words in context, sentence writing and verb tenses. These use the modern save path and retain their separate assessment meaning.

German speech uses a voice available through the browser. Whether a suitable voice is available offline depends on the device; the written activity remains usable when audio is unavailable. The app does not record your microphone.

## Which words come first

The fresh bank contains 1,216 entries, including 120 marketing words and phrases in six work areas. Marketing order follows practical job priorities. New everyday words use the bundled historical `wordfreq` estimates, with higher-frequency eligible words introduced first. Frequency is neither a current measurement of all German nor a marketing-industry corpus ranking.

Due reviews have priority within the chosen practice scope. Learning and new words remain available; repeats require a deliberate choice. Review timing is separate from new-word frequency. The initial scheduler uses transparent 1/3/7/14/30-day intervals, with shorter review after mistakes or assisted answers. These are product defaults, not a claim of an optimal schedule for every learner.

**Recall verified** requires three fully correct unaided typed recalls on different local calendar days, at least 24 hours apart. Wrong or partial unaided responses reset that qualifying evidence. Same-day corrections, recognition and hints do not add recall days. The label is a practical learning milestone, not permanent mastery or a fluency certificate. Historical activity is retained when older mastery labels need verification.

See [vocabulary research and attribution](VOCABULARY_RESEARCH.md), the [combined UX and learning report](UI_UX_RESEARCH_REPORT_2026-11-16.md), and the [implementation plan](IMPLEMENTATION_PLAN_2026-11-16.md).

## Local data and migration

Browser storage belongs to an **origin and browser profile**. `127.0.0.1:4173`, `localhost:4173`, another port, another browser and a hosted site have separate data. Use full JSON backup/restore to transfer between them. The app cannot discover or migrate a different origin's storage automatically.

The original `vinay_german_vocab_coach_v1` key stays untouched. Supported data is validated and copied into `vinay_german_vocab_coach_v1_continuous_v1`; an additional original-source copy retains the exact legacy bytes. Migration preserves supported custom words, IDs, settings and retained history. Invalid or future data is not silently reset.

All modern writes use an exclusive Web Lock, complete-snapshot validation and exact stale-data checks. If an old tab changes the legacy key, modern saves stop for explicit recovery. If another modern tab changes progress, a stale candidate cannot overwrite it. A failed first response remains pending; changing the answer cannot replace it before retry/recovery. Close older app tabs when using the redesigned app.

Storage may still be cleared by browser settings, private browsing, device loss or eviction. A browser-local copy is not an external backup. Download full backups regularly; the app does not create automatic cross-device copies.

## Full backup, restore and repair

**Settings → Your data → Download full backup** exports v2 JSON containing vocabulary, recall and review evidence, answer-level history, drafts, preferences, profile, activities and retained legacy sessions. Supported v1 full backups can be imported. CSV carries word-list data and is not a substitute for a complete backup. History already discarded by older app versions cannot be reconstructed.

Restore previews the file before replacing anything and requires explicit confirmation. It checks that the current saved data still matches that preview, then writes and verifies a browser-local pre-restore safety copy before replacement. Download that copy separately to keep it outside the browser or restore it later.

An unresolved save can be exported as an **unsaved full backup** or a **recovery copy**. A recovery copy retains competing, original and damaged snapshots; it is deliberately distinct from an ordinary backup and is not silently merged or imported as one.

Replacing corrupt/future current data with a supported backup requires an additional explicit confirmation. The old raw bytes are preserved first in a `german-vocab-coach-raw-recovery` file, rather than incorrectly labelling damaged data a validated backup. The legacy source remains untouched. If a safety copy or save fails, keep the page open, export recovery data, and use the displayed retry/recovery actions. Never assume a save completed unless the app confirms it.

## Offline installation and updates

The first successful online visit installs a complete versioned app cache. Once the service worker controls the app, it serves the same cached page, scripts and styles together; all vocabulary, optional activity content and scenarios are bundled. External attribution links still require a connection, and speech availability depends on installed voices.

To install an already hosted HTTPS copy, use Safari's **Share → Add to Home Screen** on iPhone, or the browser's **Install app / Add to Home screen** action on Android. Use the existing live URL above; this update preserves its address and installed-app identity.

An update downloads its entire new asset set before it can install. It waits while older app tabs are open, rather than swapping a worker under an old page. **After saving your work, close every tab/window of this app and reopen it to finish an update.** Opening another tab while an old one remains open may continue the older release. Reconnect if files have been evicted or an update could not finish.

For a future release, change the cache version in `service-worker.js` and all versioned entry-asset URLs together. Keep the precache list in sync with `index.html`. The worker caches only its listed same-origin files; it does not cache arbitrary requests, backup files, or telemetry. Run the offline tests as well as browser acceptance checks before publishing.

## Upgrading the existing phone app

Keep using the same installed app or browser profile and URL. Save any open practice, close all coach windows, then reopen so the waiting update can activate. Do not clear website data or delete the installed app to update it. Original words, counters, sessions and profile data are retained; older mastery labels need the new recall evidence without losing their historical record. After opening the update, download a full JSON backup from Settings.

Personal CSV/JSON backups are local data and are excluded from source control and the published site. A historical CSV removed from the current repository remains on the original local disk; Git history has not been rewritten.
