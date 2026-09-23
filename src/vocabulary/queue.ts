import type { Swipe } from '@/storage/swipes';
import type { DeckWord } from '@/vocabulary/deck';

// One batch of the swipe game: a single pass over its cards. "Still learning" doesn't bring a card
// back; it records the word for an optional practise round after the batch. Pure, so the rules are
// unit-tested.

export type Batch = {
  // Cards still to answer; the first is on screen.
  queue: DeckWord[];
  // How many words the batch started with.
  size: number;
  // Words answered "I know it".
  known: number;
  // Words answered "Still learning", in order: the practise round.
  learning: DeckWord[];
};

export function startBatch(words: DeckWord[]): Batch {
  return { queue: words, size: words.length, known: 0, learning: [] };
}

export function answerCard(batch: Batch, knowIt: boolean): Batch {
  const [card, ...rest] = batch.queue;
  if (!card) return batch;
  return knowIt
    ? { ...batch, queue: rest, known: batch.known + 1 }
    : { ...batch, queue: rest, learning: [...batch.learning, card] };
}

// The numbers on the "Batch done" screen.
export function batchSummary({ size, known, learning }: Batch) {
  return { size, known, learning: learning.length };
}

// "It's a match!": a right answer on a word whose previous swipe was "Still learning" from before
// this batch was dealt. Misses in this batch or its practise round don't count, so the moment marks
// a word that finally clicked rather than one missed a minute ago.
export function isMatch(knowIt: boolean, previous: Swipe | null, batchDealtAt: number): boolean {
  return knowIt && previous?.direction === 'left' && previous.at < batchDealtAt;
}
