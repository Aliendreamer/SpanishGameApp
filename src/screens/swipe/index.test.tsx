import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';

import { InBulgarian } from '@/i18n/testing';
import { Swipe } from '@/screens/swipe';
import type { DeckWord } from '@/vocabulary/deck';
import type { Round } from '@/vocabulary/queue';

const word = (lemma: string, meaning = lemma): DeckWord => ({
  key: `${lemma}|noun`,
  lemma,
  article: 'la',
  level: 'A1',
  partOfSpeech: 'noun',
  rank: 1,
  meanings: [meaning],
  examples: [],
});
// A batch's first round of these words.
const roundOf = (queue: DeckWord[]): Round => ({
  queue,
  size: queue.length,
  batchSize: queue.length,
  learned: 0,
});
const words = [word('casa', 'house'), word('mesa', 'table'), word('silla', 'chair')];

// Reanimated's official mock finishes animations at once, so answers land immediately.
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

async function renderSwipe({
  round = roundOf(words),
  onAnswer = jest.fn(async () => false),
  onNextRound = jest.fn(async () => roundOf([])),
  onNextBatch = jest.fn(async () => roundOf([word('perro')])),
  onOpenSettings = jest.fn(),
}: {
  round?: Round;
  onAnswer?: (word: DeckWord, knowIt: boolean) => Promise<boolean>;
  onNextRound?: () => Promise<Round>;
  onNextBatch?: () => Promise<Round>;
  onOpenSettings?: () => void;
} = {}) {
  await render(
    <Swipe
      levelLine="Beginner · A1, A2"
      username="Ana"
      initialRound={round}
      onAnswer={onAnswer}
      onNextRound={onNextRound}
      onNextBatch={onNextBatch}
      onOpenSettings={onOpenSettings}
    />,
    // Gesture Handler 3 needs its root view above every detector, as the app's root layout has.
    { wrapper: GestureHandlerRootView },
  );
  return { onAnswer, onNextRound, onNextBatch, onOpenSettings };
}
const tapCard = () =>
  act(async () => {
    fireGestureHandler(getByGestureTestId('swipe-card-tap'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);
  });
const know = () => fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
const learn = () => fireEvent.press(screen.getByRole('button', { name: 'Still learning' }));

describe('<Swipe />', () => {
  test('shows the header with level, greeting, and progress', async () => {
    await renderSwipe();

    expect(screen.getByText('Beginner · A1, A2')).toBeOnTheScreen();
    expect(screen.getByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByText('0 / 3')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0, max: 3 });
  });

  test('shows the first card front-side up, and a tap flips it', async () => {
    await renderSwipe();

    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
    await tapCard();

    expect(screen.getByText('house')).toBeOnTheScreen();
    expect(screen.queryByText('Tap to see the meaning')).toBeNull();
  });

  test('the ↻ button sits between the answer buttons and flips the card both ways', async () => {
    const { onAnswer } = await renderSwipe();
    const inOrder = screen.getAllByRole('button', {
      name: /^(Still learning|Show meaning|I know it)$/,
    });
    expect(inOrder).toEqual([
      screen.getByRole('button', { name: 'Still learning' }),
      screen.getByRole('button', { name: 'Show meaning' }),
      screen.getByRole('button', { name: 'I know it' }),
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Show meaning' }));
    expect(screen.getByText('house')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Show word' }));
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Show meaning' })).toBeOnTheScreen();
    expect(onAnswer).not.toHaveBeenCalled();
  });

  test('a tap on the card relabels the ↻ button, and the next card resets it', async () => {
    await renderSwipe();

    await tapCard();
    expect(screen.getByRole('button', { name: 'Show word' })).toBeOnTheScreen();

    await know();
    expect(screen.getByRole('button', { name: 'Show meaning' })).toBeOnTheScreen();
  });

  test('the next card starts at its first example sentence', async () => {
    const examples = (lemma: string) =>
      [1, 2, 3].map((n) => ({ spanish: `${lemma} ${n}`, english: `${lemma} ${n} en` }));
    await renderSwipe({
      round: roundOf([
        { ...word('casa', 'house'), examples: examples('casa') },
        { ...word('mesa', 'table'), examples: examples('mesa') },
      ]),
    });
    await tapCard();
    await act(async () => {
      fireGestureHandler(getByGestureTestId('swipe-card-example'), [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { state: State.END },
      ]);
    });
    expect(screen.getByText('casa 2')).toBeOnTheScreen();

    await know();
    await tapCard();

    expect(screen.getByText('mesa 1')).toBeOnTheScreen();
    expect(screen.getByText('1 / 3')).toBeOnTheScreen();
  });

  test('"I know it" reports the answer, counts it, and shows the next card', async () => {
    const { onAnswer } = await renderSwipe();

    await tapCard();
    await know();

    expect(onAnswer).toHaveBeenCalledWith(words[0], true);
    expect(screen.getByText('mesa')).toBeOnTheScreen();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
    expect(screen.getByText('1 / 3')).toBeOnTheScreen();
  });

  test('"Still learning" reports the answer and moves on; the word does not come back', async () => {
    const { onAnswer } = await renderSwipe();

    await learn();
    expect(onAnswer).toHaveBeenCalledWith(words[0], false);
    // Every answer counts toward the batch, not only "I know it".
    expect(screen.getByText('1 / 3')).toBeOnTheScreen();

    await know(); // mesa
    await know(); // silla
    expect(screen.getByRole('header', { name: 'Round done' })).toBeOnTheScreen();
  });

  test('shows the next-card hint only while more than one card is left', async () => {
    await renderSwipe();
    expect(screen.getByTestId('next-card')).toBeOnTheScreen();

    await know();
    await know();

    expect(screen.getByText('silla')).toBeOnTheScreen();
    expect(screen.queryByTestId('next-card')).toBeNull();
  });

  test('after one pass, continues with the words left until the batch is learned', async () => {
    const onNextRound = jest.fn(async () => ({
      queue: [words[0]],
      size: 1,
      batchSize: 3,
      learned: 2,
    }));
    const { onNextBatch } = await renderSwipe({ onNextRound });

    await learn(); // casa
    await know(); // mesa
    await know(); // silla

    expect(screen.getByText('3 / 3')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Round done' })).toBeOnTheScreen();
    expect(screen.getByText('You know 2 of 3 words in this batch.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continue with the 1 left' }));

    expect(onNextRound).toHaveBeenCalledTimes(1);
    expect(screen.getByText('casa')).toBeOnTheScreen();
    expect(screen.getByText('0 / 1')).toBeOnTheScreen();
    await know(); // casa

    expect(screen.getByRole('header', { name: 'Batch learned!' })).toBeOnTheScreen();
    expect(screen.getByText('You know 3 of 3 words in this batch.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));

    expect(onNextBatch).toHaveBeenCalledTimes(1);
    expect(screen.getByText('perro')).toBeOnTheScreen();
    expect(screen.getByText('0 / 1')).toBeOnTheScreen();
  });

  test('starts where the round was left', async () => {
    await renderSwipe({ round: { queue: words.slice(1), size: 3, batchSize: 10, learned: 8 } });

    expect(screen.getByText('mesa')).toBeOnTheScreen();
    expect(screen.getByText('1 / 3')).toBeOnTheScreen();
  });

  test('opens on the summary when the round was finished', async () => {
    await renderSwipe({ round: { queue: [], size: 100, batchSize: 100, learned: 66 } });

    expect(screen.getByText('100 / 100')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Continue with the 34 left' })).toBeOnTheScreen();
  });

  test('Continue waits until the last answer is saved', async () => {
    let finishSave = () => {};
    const onAnswer = jest.fn(
      () => new Promise<boolean>((resolve) => (finishSave = () => resolve(false))),
    );
    const { onNextRound } = await renderSwipe({ round: roundOf([word('casa')]), onAnswer });

    await learn();
    const next = fireEvent.press(screen.getByRole('button', { name: 'Continue with the 1 left' }));
    expect(onNextRound).not.toHaveBeenCalled();

    finishSave();
    await next;
    expect(onNextRound).toHaveBeenCalledTimes(1);
  });

  test('Next batch waits until the last answer is saved', async () => {
    let finishSave = () => {};
    const onAnswer = jest.fn(
      () => new Promise<boolean>((resolve) => (finishSave = () => resolve(false))),
    );
    const { onNextBatch } = await renderSwipe({ round: roundOf([word('casa')]), onAnswer });

    await know();
    // Without the wait, onNextBatch would run at once, inside this press.
    const next = fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));
    expect(onNextBatch).not.toHaveBeenCalled();

    finishSave();
    await next;
    expect(onNextBatch).toHaveBeenCalledTimes(1);
  });

  test('the empty state opens the settings', async () => {
    const { onOpenSettings } = await renderSwipe({ round: roundOf([]) });

    expect(screen.getByRole('header', { name: 'You know all these words!' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  test('a failed save shows a banner, keeps the game going, and clears on the next save', async () => {
    const onAnswer = jest
      .fn<Promise<boolean>, [DeckWord, boolean]>()
      .mockRejectedValueOnce(new Error('disk full'))
      .mockResolvedValue(false);
    await renderSwipe({ onAnswer });

    await know();
    expect(await screen.findByText("Couldn't save your last answer.")).toBeOnTheScreen();
    expect(screen.getByText('mesa')).toBeOnTheScreen();

    await know();
    expect(screen.queryByText("Couldn't save your last answer.")).toBeNull();
  });

  test('shows the match overlay when an answer resolves as a match, and "Keep swiping" closes it', async () => {
    const onAnswer = jest.fn(async (_word: DeckWord, knowIt: boolean) => knowIt);
    await renderSwipe({ onAnswer });

    await know();

    expect(await screen.findByRole('header', { name: "It's a match!" })).toBeOnTheScreen();
    expect(screen.getByText('house')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Keep swiping' }));

    expect(screen.queryByRole('header', { name: "It's a match!" })).toBeNull();
    expect(screen.getByText('mesa')).toBeOnTheScreen();
  });

  test('shows no match overlay for an ordinary answer', async () => {
    await renderSwipe();

    await know();

    expect(screen.queryByRole('header', { name: "It's a match!" })).toBeNull();
  });

  test('shows its text in Bulgarian, with the greeting still in Spanish', async () => {
    const onAnswer = jest.fn(async () => {
      throw new Error('disk full');
    });
    await render(
      <GestureHandlerRootView>
        <Swipe
          levelLine="Начинаещ · A1, A2"
          username="Ana"
          initialRound={roundOf(words)}
          onAnswer={onAnswer}
          onNextRound={jest.fn()}
          onNextBatch={jest.fn()}
          onOpenSettings={jest.fn()}
        />
      </GestureHandlerRootView>,
      { wrapper: InBulgarian },
    );

    expect(screen.getByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByText('Докосни за значението')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Карта: casa' })).toHaveProp(
      'accessibilityHint',
      'Показва значението',
    );
    expect(screen.getByRole('button', { name: 'Още я уча' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Покажи значението' }));
    expect(screen.getByRole('button', { name: 'Покажи думата' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Знам я' }));

    expect(await screen.findByText('Последният отговор не се запази.')).toBeOnTheScreen();
  });
});
