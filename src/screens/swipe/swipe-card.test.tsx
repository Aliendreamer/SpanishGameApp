import { act, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { State } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';

import { SwipeCard, type SwipeCardHandle } from '@/screens/swipe/swipe-card';
import type { DeckWord } from '@/vocabulary/deck';

// Reanimated's official mock finishes animations at once, so fly-out callbacks run immediately.
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

const casa: DeckWord = {
  key: 'casa|noun',
  lemma: 'casa',
  article: 'la',
  level: 'A1',
  partOfSpeech: 'noun',
  rank: 108,
  meanings: ['house'],
  example: null,
};

async function renderCard() {
  const onAnswer = jest.fn();
  const ref = createRef<SwipeCardHandle>();
  await render(<SwipeCard ref={ref} word={casa} onAnswer={onAnswer} />);
  return { onAnswer, ref };
}

// A drag that ends `dx` dp from where it started (`dy` vertically), released or cancelled.
async function drag(dx: number, { dy = 0, end = State.END }: { dy?: number; end?: State } = {}) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId('swipe-card'), [
      { state: State.BEGAN, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, translationX: dx, translationY: dy },
      { state: end, translationX: dx, translationY: dy },
    ]);
  });
}

describe('<SwipeCard />', () => {
  test('starts front-side up; a tap (under 6 dp) turns it over', async () => {
    const { onAnswer } = await renderCard();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();

    await drag(3);

    expect(screen.getByText('house')).toBeOnTheScreen();
    expect(screen.queryByText('Tap to see the meaning')).toBeNull();
    expect(onAnswer).not.toHaveBeenCalled();
  });

  test('a long drag right answers "I know it"', async () => {
    const { onAnswer } = await renderCard();

    await drag(120);
    expect(onAnswer).toHaveBeenLastCalledWith(true);
  });

  test('a long drag left answers "Still learning"', async () => {
    const { onAnswer } = await renderCard();

    await drag(-120);
    expect(onAnswer).toHaveBeenLastCalledWith(false);
  });

  test('a short drag springs back without answering or flipping', async () => {
    const { onAnswer } = await renderCard();

    await drag(50);

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
  });

  test('a long vertical drag neither flips nor answers', async () => {
    const { onAnswer } = await renderCard();

    await drag(2, { dy: 200 });

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
  });

  test('a cancelled drag springs back instead of answering', async () => {
    const { onAnswer } = await renderCard();

    await drag(120, { end: State.CANCELLED });

    expect(onAnswer).not.toHaveBeenCalled();
  });

  test('answer() from the buttons flies the card out once, however often it is called', async () => {
    const { onAnswer, ref } = await renderCard();

    await act(async () => {
      ref.current?.answer(true);
      ref.current?.answer(false);
    });

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });
});
