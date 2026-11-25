# Design

## Context

See proposal.md. `getDeck` leaves out every swiped key; a word is known when its latest swipe is right
(`KNOWN_KEYS` in `swipes.ts`).

## Goals / Non-Goals

**Goals:** one query that deals new words, then still-learning ones.

**Non-Goals:** see proposal.md.

## Decisions

- **Leave out `KNOWN_KEYS` and sort swiped words after new ones**, each part in the usual order (level,
  then frequency). The top-up then needs no second query.
- **The empty state needs no new check**: an empty deal now means every word is known.
- **`dealNextBatch` still keeps the saved batch on an empty deal**; its words are then all known.

## Texts

| | English | Bulgarian |
|---|---|---|
| Title | You know all these words! | Знаеш всички тези думи! |
| Body | You know every word for these settings. Try another level or word type, or include known words. | Знаеш всички думи за тези настройки. Опитай друго ниво или вид думи, или включи познатите думи. |

## Risks / Trade-offs

- [A batch of only still-learning words can show "It's a match!" on most cards] → the agreed rule; if
  it is too much on the phone, change the rule on its own.
- [Skipped words wait until the level's new words run out] → agreed; "include known words" brings them
  back sooner.
