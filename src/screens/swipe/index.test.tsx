import { fireEvent, render, screen } from '@testing-library/react-native';

import { Swipe } from '@/screens/swipe';
import type { DeckWord } from '@/vocabulary/deck';

const word = (lemma: string, meaning = lemma): DeckWord => ({
  key: `${lemma}|noun`,
  lemma,
  article: 'la',
  level: 'A1',
  partOfSpeech: 'noun',
  rank: 1,
  meanings: [meaning],
  example: null,
});
const words = [word('casa', 'house'), word('mesa', 'table'), word('silla', 'chair')];

// Reanimated's official mock finishes animations at once, so answers land immediately.
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

async function renderSwipe({
  deck = words,
  onAnswer = jest.fn(async () => false),
  onNextBatch = jest.fn(async () => [word('perro')]),
  onOpenSettings = jest.fn(),
}: {
  deck?: DeckWord[];
  onAnswer?: (word: DeckWord, knowIt: boolean) => Promise<boolean>;
  onNextBatch?: () => Promise<DeckWord[]>;
  onOpenSettings?: () => void;
} = {}) {
  await render(
    <Swipe
      levelLine="Beginner · A1, A2"
      username="Ana"
      initialWords={deck}
      onAnswer={onAnswer}
      onNextBatch={onNextBatch}
      onOpenSettings={onOpenSettings}
    />,
  );
  return { onAnswer, onNextBatch, onOpenSettings };
}
const card = () => screen.getByRole('button', { name: /^Card:/ });
// A tap on the card, through the accessibility action the gesture's tap mirrors.
const tapCard = () =>
  fireEvent(card(), 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
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
    expect(screen.getByRole('header', { name: 'Batch done' })).toBeOnTheScreen();
  });

  test('shows the next-card hint only while more than one card is left', async () => {
    await renderSwipe();
    expect(screen.getByTestId('next-card')).toBeOnTheScreen();

    await know();
    await know();

    expect(screen.getByText('silla')).toBeOnTheScreen();
    expect(screen.queryByTestId('next-card')).toBeNull();
  });

  test('after one pass, shows the summary; Practise replays the misses, Next batch deals more', async () => {
    const { onNextBatch } = await renderSwipe();

    await learn(); // casa
    await know(); // mesa
    await know(); // silla

    expect(screen.getByText('3 / 3')).toBeOnTheScreen();
    expect(screen.getByText('You know 2 of 3 words in this batch.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Practise the 1 still learning' }));

    expect(screen.getByText('casa')).toBeOnTheScreen();
    expect(screen.getByText('0 / 1')).toBeOnTheScreen();
    await know(); // casa

    expect(screen.getByText('You know 1 of 1 words in this batch.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));

    expect(onNextBatch).toHaveBeenCalledTimes(1);
    expect(screen.getByText('perro')).toBeOnTheScreen();
    expect(screen.getByText('0 / 1')).toBeOnTheScreen();
  });

  test('Next batch waits until the last answer is saved', async () => {
    let finishSave = () => {};
    const onAnswer = jest.fn(
      () => new Promise<boolean>((resolve) => (finishSave = () => resolve(false))),
    );
    const onNextBatch = jest.fn(async () => [word('perro')]);
    await renderSwipe({ deck: [word('casa')], onAnswer, onNextBatch });

    await know();
    // Without the wait, onNextBatch would run at once, inside this press.
    const next = fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));
    expect(onNextBatch).not.toHaveBeenCalled();

    finishSave();
    await next;
    expect(onNextBatch).toHaveBeenCalledTimes(1);
  });

  test('the empty state opens the settings', async () => {
    const { onOpenSettings } = await renderSwipe({ deck: [] });

    expect(screen.getByRole('header', { name: 'No words match your settings' })).toBeOnTheScreen();
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
});
