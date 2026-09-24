import { render, screen } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
import { CardBack, CardFront, lemmaSize, meaningSize } from '@/screens/swipe/card';
import type { DeckWord } from '@/vocabulary/deck';

const casa: DeckWord = {
  key: 'casa|noun',
  lemma: 'casa',
  article: 'la',
  level: 'A1',
  partOfSpeech: 'noun',
  rank: 108,
  meanings: ['house', 'home'],
  example: { spanish: 'No voy a mi casa.', english: "I'm not going home." },
};

describe('card front', () => {
  test('shows the level, article, lemma, and the tap hint', async () => {
    await render(<CardFront word={casa} />);

    expect(screen.getByText('A1')).toBeOnTheScreen();
    expect(screen.getByText('la')).toBeOnTheScreen();
    expect(screen.getByText('casa')).toBeOnTheScreen();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
  });

  test('uses the smaller lemma size above 9 characters', () => {
    expect(lemmaSize('casa')).toBe(72);
    expect(lemmaSize('desarrollar')).toBe(54);
  });
});

describe('card back', () => {
  test('shows the word, its part of speech, the meanings, and the example', async () => {
    await render(<CardBack word={casa} />);

    expect(screen.getByText('la casa')).toBeOnTheScreen();
    expect(screen.getByText('noun')).toBeOnTheScreen();
    expect(screen.getByText('house')).toBeOnTheScreen();
    expect(screen.getByText('home')).toBeOnTheScreen();
    expect(screen.getByText('No voy a mi casa.')).toBeOnTheScreen();
    expect(screen.getByText("I'm not going home.")).toBeOnTheScreen();
  });

  test('leaves out the example box when the word has no example', async () => {
    await render(<CardBack word={{ ...casa, example: null }} />);

    expect(screen.queryByText('No voy a mi casa.')).toBeNull();
  });

  test('shrinks the meaning text as the longest meaning grows', () => {
    expect(meaningSize(['house', 'home'])).toBe(36);
    expect(meaningSize(['to talk; to speak; to chat'])).toBe(28);
    expect(meaningSize(['to talk; to speak; to communicate using words'])).toBe(22);
  });
});

describe('card in Bulgarian', () => {
  test('translates the tap hint and the part of speech, not the word or its meanings', async () => {
    await render(
      <>
        <CardFront word={casa} />
        <CardBack word={casa} />
      </>,
      { wrapper: InBulgarian },
    );

    expect(screen.getByText('Докосни за значението')).toBeOnTheScreen();
    expect(screen.getByText('съществително')).toBeOnTheScreen();
    expect(screen.getByText('house')).toBeOnTheScreen();
  });

  test('shows an unknown part of speech as it is', async () => {
    await render(<CardBack word={{ ...casa, partOfSpeech: 'suffix' }} />, {
      wrapper: InBulgarian,
    });

    expect(screen.getByText('suffix')).toBeOnTheScreen();
  });
});
