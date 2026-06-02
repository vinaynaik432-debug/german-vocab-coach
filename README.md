# Vinay's German Vocab Coach

An offline-first German vocabulary quiz app for English → German practice.

Fastest way to run it:

1. Double-click `START_APP.command`.
2. Keep the Terminal window open.
3. Open `http://127.0.0.1:4173/` in your browser.

Progress is stored locally in that browser using localStorage.

If a browser blocks local storage for direct `file://` pages, the app still runs in temporary mode and will say so at the top. In that case, use CSV export/import as a backup or run it from a local static preview.

## Features

- 20-word rounds with B1/B2 everyday vocabulary
- 5-word quick rounds for short practice
- Multiple-choice mode with 4 answer options and an `I don't know` action
- New / learning / mastered word states
- Correct streaks, misses, half-credit spelling or article slips
- Retry-only mode for hard learning words
- Visual progress dashboard with mastery, practice streak, accuracy, recent rounds, and separate best scores for each quiz type
- 140+ rotating German phrases on the start screen
- Phrase refresh button
- Dashboard and recap panels hidden behind buttons
- Duolingo-style practice-day streak badge on the home screen
- Distraction-free quiz mode while a round is active
- Hardest words list
- Bulk paste, CSV import, and CSV export
- Built-in starter database

## Bulk Add

Paste one word per line:

```text
job posting - die Stellenausschreibung
to negotiate - verhandeln
residence permit - der Aufenthaltstitel
```

You can also paste CSV directly into the bulk box, or use the import button.

## CSV Import Format

Required columns:

```csv
word_en,word_de,part_of_speech,topic,difficulty,notes
job posting,die Stellenausschreibung,noun,arbeit,B2,
to negotiate,verhandeln,verb,arbeit,B2,
```

Exported CSV includes progress columns too, so it can be used as a backup.
