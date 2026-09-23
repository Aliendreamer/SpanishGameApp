import { fireEvent, render, screen } from '@testing-library/react-native';

import { MatchOverlay } from '@/screens/swipe/match';
import type { DeckWord } from '@/vocabulary/deck';

jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

const casa: DeckWord = {
  key: 'casa|noun',
  lemma: 'casa',
  article: 'la',
  level: 'A1',
  partOfSpeech: 'noun',
  rank: 108,
  meanings: ['house', 'home'],
  example: null,
};

describe('<MatchOverlay />', () => {
  test('celebrates the word with its article, lemma, and meanings', async () => {
    await render(<MatchOverlay word={casa} onClose={() => {}} />);

    expect(screen.getByRole('header', { name: "It's a match!" })).toBeOnTheScreen();
    expect(
      screen.getByText('You were still learning this one. Now you know it.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('la')).toBeOnTheScreen();
    expect(screen.getByText('casa')).toBeOnTheScreen();
    expect(screen.getByText('house, home')).toBeOnTheScreen();
  });

  test('shows the part of speech when the word has no article', async () => {
    await render(
      <MatchOverlay
        word={{ ...casa, lemma: 'hablar', article: null, partOfSpeech: 'verb' }}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText('verb')).toBeOnTheScreen();
  });

  test('"Keep swiping" closes it', async () => {
    const onClose = jest.fn();
    await render(<MatchOverlay word={casa} onClose={onClose} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Keep swiping' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
