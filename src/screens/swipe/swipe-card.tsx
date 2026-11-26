import { type Ref, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useT } from '@/i18n';
import { CardBack, CardFront } from '@/screens/swipe/card';
import {
  dragRotation,
  FLY_DISTANCE,
  FLY_ROTATION,
  releaseOutcome,
  stampOpacities,
  TAP_DISTANCE,
} from '@/screens/swipe/motion';
import { colors, fonts, radii } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';

// Timings from docs/design/swipe-game-ui/README.md ("Interactions & Behavior").
const SPRING_BACK = { duration: 300, easing: Easing.bezier(0.2, 0.7, 0.3, 1) };
const FLY_OUT = { duration: 300 };
const FLIP = { duration: 450, easing: Easing.bezier(0.3, 0.7, 0.3, 1) };
// In effect no limit: a slow press flips too (the gesture library's default is 500 ms).
const TAP_MAX_DURATION = 60_000;

export type SwipeCardHandle = {
  // Flies the card out as if swiped: right for "I know it", left for "Still learning".
  answer: (knowIt: boolean) => void;
  // Turns the card over, as a tap does.
  flip: () => void;
};

type Props = {
  word: DeckWord;
  // Called once, when the card has flown out.
  onAnswer: (knowIt: boolean) => void;
  // Called on every flip, with true when the back is now showing.
  onFlip: (flipped: boolean) => void;
  ref?: Ref<SwipeCardHandle>;
};

// One word card: drag to answer, tap to flip, tap the example box for the next sentence. The screen
// mounts a fresh one per word, so every card starts centred, front-side up, at its first sentence.
export function SwipeCard({ word, onAnswer, onFlip, ref }: Props) {
  const t = useT();
  const dx = useSharedValue(0);
  // 0 = front, 1 = back; animates the 3D flip.
  const turn = useSharedValue(0);
  // Set once the card starts flying out: no more drags or answers for this card.
  const leaving = useSharedValue(false);
  const [flipped, setFlipped] = useState(false);
  // Which example sentence the back shows; kept across flips.
  const [example, setExample] = useState(0);
  const browsable = flipped && word.examples.length > 1;

  const nextExample = () => {
    if (browsable) setExample((shown) => (shown + 1) % word.examples.length);
  };

  const flip = () => {
    if (leaving.get()) return;
    const next = !flipped;
    setFlipped(next);
    turn.set(withTiming(next ? 1 : 0, FLIP));
    onFlip(next);
  };

  const flyOut = (knowIt: boolean) => {
    'worklet';
    if (leaving.get()) return;
    leaving.set(true);
    dx.set(
      withTiming(knowIt ? FLY_DISTANCE : -FLY_DISTANCE, FLY_OUT, (finished) => {
        if (finished) scheduleOnRN(onAnswer, knowIt);
      }),
    );
  };

  useImperativeHandle(ref, () => ({ answer: flyOut, flip }));

  const pan = Gesture.Pan()
    .minDistance(TAP_DISTANCE)
    .withTestId('swipe-card')
    .onUpdate((event) => {
      if (!leaving.get()) dx.set(event.translationX);
    })
    .onEnd((event, success) => {
      if (leaving.get()) return;
      // A cancelled touch (the system took it) is not a release: spring back, answer nothing.
      const outcome = success ? releaseOutcome(event.translationX) : 'back';
      if (outcome === 'back') dx.set(withTiming(0, SPRING_BACK));
      else flyOut(outcome === 'know');
    });
  // A gesture of its own: Android ends a pan without calling onEnd when the finger never moves, so
  // the pan can't see a still tap.
  const tap = Gesture.Tap()
    .maxDistance(TAP_DISTANCE)
    .maxDuration(TAP_MAX_DURATION)
    .withTestId('swipe-card-tap')
    .onEnd((_event, success) => {
      if (success) scheduleOnRN(flip);
    });
  // A tap on the example box shows the next sentence instead of flipping. Only the card's tap is
  // blocked, so a drag that starts on the box still swipes.
  const exampleTap = Gesture.Tap()
    .enabled(browsable)
    .maxDistance(TAP_DISTANCE)
    .maxDuration(TAP_MAX_DURATION)
    .blocksExternalGesture(tap)
    .withTestId('swipe-card-example')
    .onEnd((_event, success) => {
      if (success) scheduleOnRN(nextExample);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotation = leaving.get()
      ? (dx.get() / FLY_DISTANCE) * FLY_ROTATION
      : dragRotation(dx.get());
    return { transform: [{ translateX: dx.get() }, { rotate: `${rotation}deg` }] };
  });
  const knowStamp = useAnimatedStyle(() => ({ opacity: stampOpacities(dx.get()).know }));
  const learnStamp = useAnimatedStyle(() => ({ opacity: stampOpacities(dx.get()).learn }));
  const frontFace = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateY: `${interpolate(turn.get(), [0, 1], [0, 180])}deg` },
    ],
  }));
  const backFace = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateY: `${interpolate(turn.get(), [0, 1], [180, 360])}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={t.swipe.cardLabel(word.lemma)}
        accessibilityHint={flipped ? t.swipe.showsWord : t.swipe.showsMeaning}
        accessibilityActions={[
          { name: 'activate' },
          { name: 'know', label: t.swipe.know },
          { name: 'learn', label: t.swipe.learn },
          ...(browsable ? [{ name: 'example', label: t.swipe.nextExample }] : []),
        ]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'activate') flip();
          else if (nativeEvent.actionName === 'example') nextExample();
          else flyOut(nativeEvent.actionName === 'know');
        }}
        style={[styles.card, cardStyle]}
      >
        {/* Both faces stay mounted for the flip; the hidden one is out of the accessibility tree. */}
        <Animated.View
          accessibilityElementsHidden={flipped}
          importantForAccessibility={flipped ? 'no-hide-descendants' : 'auto'}
          style={[styles.face, frontFace]}
        >
          <CardFront word={word} />
        </Animated.View>
        <Animated.View
          accessibilityElementsHidden={!flipped}
          importantForAccessibility={flipped ? 'auto' : 'no-hide-descendants'}
          style={[styles.face, backFace]}
        >
          <CardBack word={word} example={example} exampleTap={exampleTap} />
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.knowStamp, knowStamp]} pointerEvents="none">
          <Text style={styles.stampText}>{t.swipe.know}</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.learnStamp, learnStamp]} pointerEvents="none">
          <Text style={styles.stampText}>{t.swipe.learn}</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  face: {
    ...StyleSheet.absoluteFill,
    backfaceVisibility: 'hidden',
  },
  stamp: {
    position: 'absolute',
    top: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  knowStamp: {
    left: 26,
    backgroundColor: colors.know,
  },
  learnStamp: {
    right: 26,
    backgroundColor: colors.ink,
  },
  stampText: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.surface,
  },
});
