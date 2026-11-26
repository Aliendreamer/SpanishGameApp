import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { State } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';

import { TAP_DISTANCE } from '@/screens/swipe/motion';
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
  examples: [],
};

const EXAMPLES = [
  { spanish: 'No voy a mi casa.', english: "I'm not going home." },
  { spanish: 'Me voy a mi casa.', english: "I'm going to my house." },
  { spanish: 'No voy a tu casa.', english: "I'm not going to your house." },
];

async function renderCard(word: DeckWord = casa) {
  const onAnswer = jest.fn();
  const onFlip = jest.fn();
  const ref = createRef<SwipeCardHandle>();
  await render(<SwipeCard ref={ref} word={word} onAnswer={onAnswer} onFlip={onFlip} />);
  return { onAnswer, onFlip, ref };
}

// A drag that ends `dx` dp from where it started, released or cancelled.
async function drag(dx: number, end: State = State.END) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId('swipe-card'), [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: dx },
      { state: end, translationX: dx },
    ]);
  });
}

// A tap as the phone's own recogniser reports it: no movement involved.
async function tap(end: State = State.END, testId = 'swipe-card-tap') {
  await act(async () => {
    fireGestureHandler(getByGestureTestId(testId), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: end },
    ]);
  });
}

describe('<SwipeCard />', () => {
  test('starts front-side up; a tap turns it over', async () => {
    const { onAnswer } = await renderCard();
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();

    await tap();

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

  test('a drag that ends where it started neither flips nor answers', async () => {
    const { onAnswer, onFlip } = await renderCard();

    await drag(0);

    expect(onAnswer).not.toHaveBeenCalled();
    expect(onFlip).not.toHaveBeenCalled();
  });

  test('a cancelled tap does not flip', async () => {
    const { onFlip } = await renderCard();

    await tap(State.CANCELLED);

    expect(onFlip).not.toHaveBeenCalled();
  });

  test('a touch is a tap up to the distance where it becomes a drag', async () => {
    await renderCard();

    expect(getByGestureTestId('swipe-card-tap').config).toMatchObject({ maxDist: TAP_DISTANCE });
    expect(getByGestureTestId('swipe-card').config).toMatchObject({ minDist: TAP_DISTANCE });
  });

  test('a cancelled drag springs back instead of answering', async () => {
    const { onAnswer } = await renderCard();

    await drag(120, State.CANCELLED);

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

  test('flip() from the button turns the card over and back, reporting each side', async () => {
    const { onAnswer, onFlip, ref } = await renderCard();

    await act(async () => ref.current?.flip());
    expect(screen.getByText('house')).toBeOnTheScreen();
    expect(onFlip).toHaveBeenLastCalledWith(true);

    await act(async () => ref.current?.flip());
    expect(screen.getByText('Tap to see the meaning')).toBeOnTheScreen();
    expect(onFlip).toHaveBeenLastCalledWith(false);
    expect(onAnswer).not.toHaveBeenCalled();
  });

  test('a tap reports the flip too', async () => {
    const { onFlip } = await renderCard();

    await tap();

    expect(onFlip).toHaveBeenCalledWith(true);
  });

  test('a tap does nothing once the card is flying out', async () => {
    const { onFlip, ref } = await renderCard();

    await act(async () => ref.current?.answer(true));
    await tap();

    expect(onFlip).not.toHaveBeenCalled();
  });

  test('flip() does nothing once the card is flying out', async () => {
    const { onFlip, ref } = await renderCard();

    await act(async () => {
      ref.current?.answer(true);
      ref.current?.flip();
    });

    expect(onFlip).not.toHaveBeenCalled();
  });

  describe('example sentences', () => {
    const tapExample = () => tap(State.END, 'swipe-card-example');
    const actionsOfCard = () =>
      (screen.getByLabelText('Card: casa').props.accessibilityActions as { name: string }[]).map(
        (action) => action.name,
      );

    test('a tap on the box shows the next sentence and leaves the card flipped', async () => {
      const { onFlip } = await renderCard({ ...casa, examples: EXAMPLES });
      await tap();

      await tapExample();

      expect(screen.getByText('Me voy a mi casa.')).toBeOnTheScreen();
      expect(screen.getByText("I'm going to my house.")).toBeOnTheScreen();
      expect(screen.getByText('2 / 3')).toBeOnTheScreen();
      expect(onFlip).toHaveBeenCalledTimes(1);
    });

    test('returns to the first sentence after the last', async () => {
      await renderCard({ ...casa, examples: EXAMPLES });
      await tap();

      await tapExample();
      await tapExample();
      await tapExample();

      expect(screen.getByText('No voy a mi casa.')).toBeOnTheScreen();
      expect(screen.getByText('1 / 3')).toBeOnTheScreen();
    });

    test('flipping to the front and back keeps the place', async () => {
      await renderCard({ ...casa, examples: EXAMPLES });
      await tap();
      await tapExample();

      await tap();
      await tap();

      expect(screen.getByText('2 / 3')).toBeOnTheScreen();
    });

    test('a tap on the box does nothing while the front is showing', async () => {
      await renderCard({ ...casa, examples: EXAMPLES });

      await tapExample();
      await tap();

      expect(screen.getByText('1 / 3')).toBeOnTheScreen();
    });

    test('a single sentence has no gesture of its own, so a tap there flips', async () => {
      await renderCard({ ...casa, examples: EXAMPLES.slice(0, 1) });

      expect(() => getByGestureTestId('swipe-card-example')).toThrow();
    });

    test('screen readers get "Next example" on a flipped card with more than one sentence', async () => {
      await renderCard({ ...casa, examples: EXAMPLES });
      expect(actionsOfCard()).not.toContain('example');

      await tap();
      expect(actionsOfCard()).toContain('example');

      await act(async () => {
        fireEvent(screen.getByLabelText('Card: casa'), 'accessibilityAction', {
          nativeEvent: { actionName: 'example' },
        });
      });
      expect(screen.getByText('2 / 3')).toBeOnTheScreen();
    });

    test('no "Next example" with one sentence or none', async () => {
      await renderCard({ ...casa, examples: EXAMPLES.slice(0, 1) });
      await tap();

      expect(actionsOfCard()).not.toContain('example');
    });
  });
});
