# Six UI/UX proposals for German Vocab Coach

16 November 2026. These are proposed changes, not an implemented redesign. They follow the fixes to mastery evidence and full backup/restore. Example counts below are illustrative, not the user's actual progress.

The aim is to make the next useful action obvious and keep the learning record understandable. Retain the friendly identity and the useful practice formats, while showing fewer competing controls at once.

**Updated after Vinay's feedback on 16 November:** rounds feel like a commitment requiring a block of free time. Continuous, one-question-at-a-time practice is now the default proposal: answer once or twice and leave, or keep going. Each submitted answer must save independently. Fixed rounds remain optional.

## 1. Put today's practice first

**Now:** the greeting, large mascot, and rotating phrase appear before the mission and vocabulary. A learner returning for a short session must move past introductory content.

**Proposed:** use a compact greeting and one prominent action. Show the weekly target as a quiet supporting line. Keep a small mascot and move the phrase into an optional section.

**Example:**

> Hi Vinay. Practise a word whenever you have a moment.
>
> **Marketing German · One word at a time**
>
> **Practise now**
>
> Stop whenever you need. Each answer is saved. · Browse words

Starting should require no fixed word count or duration. “Saved” must reflect a successful write, and any due-review claim must come from real scheduling. The friendly identity can remain compact.

## 2. Use a consistent, smaller navigation structure

**Now:** the home tabs are Marketing, Practice, Learn, and Review. They contain multiple exercise choices. Mobile navigation separately offers Home, Progress, and Missed. The structure mixes subject matter, learning goals, and exercise formats.

**Proposed:** use **Today · Words · Progress**, with a settings button. Today supplies the next useful word. Words contains Marketing and Everyday, plus the category selector. Keep optional stories, multiple choice, sentence practice, tense practice and fixed rounds under **More practice**.

**Example:**

> **Today → Continue CRM practice**
>
> More practice: Read a story · Practise sentences · Multiple choice

The user can begin without choosing a game format first. These proposals retain the existing practice formats; they change how prominently each is presented.

## 3. Make the vocabulary library compact and predictable

**Now:** every marketing entry is a large card with category, stage, status, translations, examples, alternatives, usage notes, and audio. Search filters the cards while the practice button uses the whole selected category.

**Proposed:** show compact rows by default. Opening a word reveals the examples and other useful detail. Make the practice scope explicit beside search results.

**Example collapsed row:**

> **die Conversion-Rate** — conversion rate · Learning

**After opening it:**

> Die Conversion-Rate ist im letzten Monat gestiegen.
>
> The conversion rate increased last month.
>
> Also accepted: die Konversionsrate · Hear German

**Example search actions:**

> Search: conversion · 4 results
>
> **Practise these 4 results** · Practise all KPIs

This supports quick browsing while preserving the examples that make the marketing vocabulary useful. Practice limited to search results would require a behavior change; it is not how the current search works.

## 4. Lead progress with three honest measures

**Now:** the dashboard presents a headline statistics strip, seven best-score tiles, mastery percentage, words seen, overall accuracy, a word-bank split, and recent charts. Several numbers describe overlapping activity, while aggregate accuracy mixes different tasks.

**Proposed:** lead with **Words practised · Confirmed recall · Needs another attempt**. Let the learner open each number to inspect the words. Move best scores, charts, and detailed history into a secondary section.

**Example:**

> **42 practised · 12 confirmed across days · 8 to revisit**
>
> Confirmed recall means three fully correct typed recalls on separate days, at least 24 hours apart. A wrong or half-correct recall resets that evidence.
>
> View words · More detail

Use an understandable explanation for older words that need verification: **Previously marked mastered; recall check needed.** Keep historical activity available without presenting it as new evidence. Do not show **Due today** until the app actually schedules due dates.

## 5. Separate settings and data management from progress

**Now:** Progress also holds name, level, five mode-level overrides, weekly goals, bulk word input, import/export, and reset. Routine progress checking opens a panel containing many unrelated tasks.

**Proposed:** move these controls into **Settings**. Keep the general level and learning priority easy to find; put mode-specific overrides under **Advanced**. Give data protection a clearly labelled area.

**Example:**

> **Settings**
>
> Learning priority: Marketing first · German level: B1
>
> **Your data**
>
> Download full backup · Restore backup
>
> Word-list tools: Export CSV · Import CSV

**Example restore preview:**

> This backup contains 1,216 words, 84 sessions, and your settings.
>
> Restoring replaces this browser's current learning data. A safety copy is saved separately in this browser first. You can use **Download pre-restore backup** afterward to keep a file or restore the previous state.

The reliability update already provides full JSON backup/restore; this proposal concerns its placement and visual hierarchy. The browser safety copy should not be described as a downloaded file. CSV should stay clearly labelled as word-list data, and reset should be visually separated from ordinary export actions.

## 6. Save and teach after every answer

**Now:** results show score, accuracy, streak, best, status changes, and separate correct, partial, and wrong lists. Empty groups can still take space. The learner must interpret this collection to decide what to do next.

**Proposed:** save each submitted answer, show its correction, and offer **Next word** or **Stop for now**. Do not insert compulsory results screens every few questions. Keep the longer summary in Progress or show it optionally when stopping. Explain a newly earned mastery label only when the new rule was met.

**Example:**

> **Saved · Meaning correct. Article needs practice.**
>
> **die Freigabe** — approval.
>
> Wir warten auf die Freigabe der Kampagne.
>
> **Next word** · Stop for now

A same-day correction should say **Corrected in practice; another day's recall is needed**, rather than imply that the correction qualifies for mastery. An activity such as story comprehension should describe its own score without suggesting that every vocabulary item was recalled.

Leaving after one or two answers should retain all submitted evidence and the current draft. Do not grade a draft, repeat saved attempts on reopening, or treat a new visit as another qualifying recall day. Avoid auto-advance and “just one more” pressure. A short visit is legitimate practice; it does not substitute for all listening and speaking work.

## Suggested implementation order

Start with **6 and 1 together**: per-answer saving/resume and a default path with no round commitment. Preserve old history and full-backup compatibility. Then address **2, 4 and 5** for navigation, honest progress and separate Settings, followed by **3** for the word library.

These recommendations come from the current page structure, styles, and rendering functions, the original project review, and Vinay's direct feedback about rounds. They are design judgments, not results of a controlled user study. The relevant source areas are `index.html` (home, dashboard, settings, marketing library), `styles.css` (welcome and mobile navigation), and `app.js` (`renderMarketingWords`, `renderDashboard`, and `renderResults`).
