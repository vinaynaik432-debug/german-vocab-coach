# Vinay's German Vocab Coach

An offline-first German vocabulary quiz app for English → German practice.

Fastest way to run it:

1. Double-click `START_APP.command`.
2. Keep the Terminal window open.
3. Open `http://127.0.0.1:4173/` in your browser.

Progress is stored locally in that browser using localStorage.

If a browser blocks local storage for direct `file://` pages, the app still runs in temporary mode and will say so at the top. In that case, use CSV export/import as a backup or run it from a local static preview.

## Features

- Installable PWA with app icons and offline caching after first load
- 20-word rounds with B1/B2 everyday vocabulary
- 5-word quick rounds for short practice
- Multiple-choice mode with 4 answer options and an `I don't know` action
- New / learning / mastered word states
- Correct streaks, misses, half-credit spelling or article slips
- Retry-only mode for hard learning words
- Visual progress dashboard with mastery, practice streak, accuracy, recent rounds, and separate best scores for each quiz type
- Dashboard word-status lists for new, learning, and mastered words, with visual manual move controls
- 140+ rotating German phrases on the start screen
- Phrase refresh button
- Dashboard and recap panels hidden behind buttons
- Duolingo-style practice-day streak badge on the home screen
- Distraction-free quiz mode while a round is active
- Hardest words list
- Bulk paste, CSV import, and CSV export
- Built-in starter database with 1000+ everyday B1/B2 words

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

## Install On Phone

Host the folder on GitHub Pages, then open the HTTPS GitHub Pages link on your phone.

On iPhone:

1. Open the app link in Safari.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Launch it from the new Home Screen icon.

On Android:

1. Open the app link in Chrome.
2. Tap the browser menu.
3. Tap `Install app` or `Add to Home screen`.

The app caches itself after the first load, so it can open offline. Progress is still stored on each device separately unless you export/import CSV.
