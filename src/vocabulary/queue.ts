import type { DeckWord } from '@/vocabulary/deck';

// One batch of the swipe game (roadmap: "Right removes the card, left re-queues it ~4 cards
// later"; docs/design/swipe-game-ui/README.md, "Queue rules"). Pure, so the rules are unit-tested.

// A "Still learning" card comes back after this many others.
const REQUEUE_AFTER = 3;

export type Batch = {
  // Cards still to answer; the first is on screen.
  queue: DeckWord[];
  // How many words the batch started with.
  size: number;
  // Words answered "I know it" so far.
  known: number;
  // Keys answered "Still learning" at least once in this batch.
  retried: ReadonlySet<string>;
};

export function startBatch(words: DeckWord[]): Batch {
  return { queue: words, size: words.length, known: 0, retried: new Set() };
}

export function answerCard(batch: Batch, knowIt: boolean): Batch {
  const [card, ...rest] = batch.queue;
  if (!card) return batch;
  if (knowIt) return { ...batch, queue: rest, known: batch.known + 1 };

  const at = Math.min(REQUEUE_AFTER, rest.length);
  return {
    ...batch,
    queue: [...rest.slice(0, at), card, ...rest.slice(at)],
    retried: new Set(batch.retried).add(card.key),
  };
}

// The numbers on the "Batch done" screen.
export function batchSummary({ size, retried }: Batch) {
  return { size, firstTry: size - retried.size, fewTries: retried.size };
}
