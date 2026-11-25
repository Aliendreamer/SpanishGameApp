# Design

## Context

See proposal.md for motivation. The batch is React state in `src/screens/swipe/index.tsx`, built from
`getDeck` by the route. `swipes` is an append-only log with increasing ids, and a word's state is its
latest swipe. The screen already waits for the last answer's save before dealing the next batch.

## Goals / Non-Goals

**Goals:** resume exactly where the user stopped, with no second record of progress that could
disagree with the swipe log.

**Non-Goals:** see proposal.md.

## Decisions

- **Store the word list and two markers; derive the rest from the log.** Migration 4:

  ```sql
  CREATE TABLE batches (
    deck TEXT PRIMARY KEY,         -- the settings choice, e.g. 'beginner|1|0|all'
    words TEXT NOT NULL,           -- JSON array of word keys, in dealing order
    start_swipe INTEGER NOT NULL,  -- last swipe id when the batch was dealt
    round_swipe INTEGER NOT NULL,  -- last swipe id when the current round started
    number INTEGER NOT NULL,       -- batch number, for "include known words"
    dealt_at INTEGER NOT NULL
  );
  ```

  - *Learned*: a word with a right swipe after `start_swipe`. A later left swipe does not undo it, so
    the batch always moves towards done.
  - *Round*: the batch's words with no right swipe in `(start_swipe, round_swipe]`.
  - *Still to answer*: the round's words with no swipe after `round_swipe`.
  - *Missed this round*: the round's words answered since `round_swipe` but not learned.

  Answering writes nothing beyond the swipe already logged, so batch and log cannot drift apart.
  - *A row per word with a state column*: rejected; a second write per answer that can fail alone.
  - *React state saved to AsyncStorage*: rejected; a second copy of what the log says.
- **One row, one statement.** Dealing is one `INSERT OR REPLACE`, a new round one `UPDATE … SET
  round_swipe = (SELECT coalesce(max(id), 0) FROM swipes)`. No transaction, which `swipes.ts` avoids
  on the shared connection. Word keys are read with SQLite's `json_each`.
- **`deck` key** is `level|includeLower|includeKnown|wordType`; `includeLower` counts as 0 for Full,
  where it is not used.
- **Dictionary updates**: keys are joined to `vocab.vocabulary`; a removed word leaves the batch and
  its size. If none are left, a new batch is dealt.
- **Nothing to deal**: an empty deal shows the empty state and leaves any saved batch as it was, so
  "Next batch" with no new words does not throw away the words left over.
- **`getDeck`** gains loading by keys, sharing the meanings and examples lookup. `dealBatch` takes
  the saved `number` instead of the route's session counter.
- **`queue.ts`** holds a round: cards to answer, round size, batch size, and words learned in the
  batch. It stays pure; the screen's summary and header read from it.
- **Continue** waits for the last save, starts the round in the database, then reloads it. The
  summary buttons go through `singleFlight`, so a double tap starts one round. A word whose save
  failed is not in the log and comes back, the safe direction.
- **On load** a batch whose round is finished opens on the summary.
- **Reset** deletes `batches` before `swipes`. Swipe ids restart after a reset, so a batch kept past
  it would hold markers that are too high; in this order a failure half-way only loses a batch.
- **Header** still counts every answer of the current round (`batch-progress-counter`), so round two
  of a batch with 34 left starts at "0 / 34". The batch total is on the summary.

## Texts

| | English | Bulgarian |
|---|---|---|
| Round title | Round done | Кръгът е готов |
| All learned title | Batch learned! | Серията е научена! |
| Continue | Continue with the {n} left | Продължи с останалите ({n}) |
| How it works, left | It comes back in the next round. | Ще се върне в следващия кръг. |

The body line, tiles, "Next batch" ("Следваща серия"), and "Change settings" keep their texts. The
English round title replaces "Batch done"; "Practise the {y} still learning" goes away.

## Risks / Trade-offs

- [The order is the same every round, so words can be learned by position] → accepted for now;
  shuffling rounds is a small later change in one place.
- [Two choices can share a word, e.g. All words and Nouns] → an answer counts in both; that is right,
  since the word was learned.
- [Batch in progress when the app updates] → cannot be rebuilt; the first launch deals a new batch,
  as a restart does today.
- [A finished round is resumed days later on a summary] → intended; it says what is left.

## Migration Plan

Migration 4 only adds a table. An older build opening the newer database skips migrations above its
own count and ignores the table, so going back is safe.
