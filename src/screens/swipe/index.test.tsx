import { fireEvent, render, screen } from '@testing-library/react-native';

import { Swipe } from '@/screens/swipe';
import type { DeckWord } from '@/vocabulary/deck';

const word = (lemma: string, meaning: string): DeckWord => ({
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

async function renderSwipe(deck = words) {
  await render(<Swipe levelLine="Beginner · A1, A2" username="Ana" words={deck} />);
}
const card = () => screen.getByRole('button', { name: /^Card:/ });
const progress = () => screen.getByRole('progressbar');

describe('<Swipe />', () => {
  test('shows the header with level, greeting, and progress', async () => {
    await renderSwipe();

    expect(screen.getByText('Beginner · A1, A2')).toBeOnTheScreen();
    expect(screen.getByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByText('0 / 3')).toBeOnTheScreen();
    expect(progress()).toHaveAccessibilityValue({ now: 0, max: 3 });
  });

  test('shows the first card front-side up, and a tap flips it', async () => {
    await renderSwipe();

    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
    await fireEvent.press(card());

    expect(screen.getByText('house')).toBeOnTheScreen();
    expect(screen.queryByText('Tap to see the meaning')).toBeNull();
  });

  test('"I know it" counts the word and shows the next card front-side up', async () => {
    await renderSwipe();

    await fireEvent.press(card());
    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));

    expect(screen.getByText('mesa')).toBeOnTheScreen();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
    expect(screen.getByText('1 / 3')).toBeOnTheScreen();
  });

  test('"Still learning" moves on without counting', async () => {
    await renderSwipe();

    await fireEvent.press(screen.getByRole('button', { name: 'Still learning' }));

    expect(screen.getByText('mesa')).toBeOnTheScreen();
    expect(screen.getByText('0 / 3')).toBeOnTheScreen();
  });

  test('shows the next-card hint only while more than one card is left', async () => {
    await renderSwipe();
    expect(screen.getByTestId('next-card')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));

    expect(screen.getByText('silla')).toBeOnTheScreen();
    expect(screen.queryByTestId('next-card')).toBeNull();
  });

  test('says "Batch done" after the last card', async () => {
    await renderSwipe([word('casa', 'house')]);

    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));

    expect(screen.getByText('Batch done')).toBeOnTheScreen();
  });
});
