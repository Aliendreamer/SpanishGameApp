## Context

User feedback after `game-rules` and `match-overlay`: re-queueing after 4 cards is too frequent,
batches never finish, and matches fire too often. Agreed: one pass per batch; at the end, next batch
or practise the missed words; next batches deal only never-swiped words.

## Goals / Non-Goals

**Goals:** a batch is a fixed, finishable pass; missed words get a focused second chance on demand;
matches are rare and meaningful.

**Non-Goals:** a "practise all still learning" entry (e.g. from the Words tab) — possible later;
spaced repetition.

## Decisions

- **Queue** keeps `{ queue, size, known, learning }`: "I know it" counts the card; "Still learning"
  records it in `learning`; both remove it. Done when the queue is empty.
- **Practise round** is local to the screen: `startBatch(batch.learning)` — the missed words, one
  pass, same summary afterwards.
- **Deck exclusion**: without "include known words", `getDeck` leaves out every swiped key
  (`key NOT IN (SELECT key FROM swipes)`); with it, nothing is excluded and `dealBatch` walks the
  level as before.
- **Match rule**: `logSwipe` returns the previous swipe's `{ direction, at }`. The route records
  when the current batch was dealt (first deal and each "Next batch", not practise rounds); a right
  answer is a match only if the previous swipe was left and happened before that time.
- **Summary**: "Batch done"; "You know {x} of {n} words in this batch."; tiles "{x} known" (rose)
  and "{y} still learning"; buttons "Next batch" (primary), "Practise the {y} still learning"
  (secondary, only when y > 0), "Change settings" (secondary).

## Risks / Trade-offs

- [Missed words not practised don't return by themselves] → agreed with the user; they stay listed
  on the Words tab and return in review mode ("include known words").
- [Matches become rare] → intended; they now mark a word missed in an earlier batch.
