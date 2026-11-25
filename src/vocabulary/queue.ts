import type { Swipe } from '@/storage/swipes';
import type { DeckWord } from '@/vocabulary/deck';

// One round of a batch: a single pass over its cards. "Still learning" doesn't bring a card back in
// the round; the next round is the batch's words not learned yet. Pure, so the rules are unit-tested.

export type Round = {
  // Cards still to answer; the first is on screen.
  queue: DeckWord[];
  // How many words the round started with.
  size: number;
  // How many words the whole batch has, and how many are learned: answered "I know it" in it.
  batchSize: number;
  learned: number;
};

export function answerCard(round: Round, knowIt: boolean): Round {
  const [card, ...rest] = round.queue;
  if (!card) return round;
  return { ...round, queue: rest, learned: round.learned + (knowIt ? 1 : 0) };
}

// How many of the round's cards are answered, either way.
export function answeredCount({ size, queue }: Round): number {
  return size - queue.length;
}

// The numbers at the end of a round, over the whole batch.
export function batchSummary({ batchSize, learned }: Round) {
  return { size: batchSize, known: learned, learning: batchSize - learned };
}

// "It's a match!": a right answer on a word whose previous swipe was "Still learning" from before
// this batch was dealt. Misses in this batch, whatever the round, don't count, so the moment marks
// a word that finally clicked rather than one missed a minute ago.
export function isMatch(knowIt: boolean, previous: Swipe | null, batchDealtAt: number): boolean {
  return knowIt && previous?.direction === 'left' && previous.at < batchDealtAt;
}
