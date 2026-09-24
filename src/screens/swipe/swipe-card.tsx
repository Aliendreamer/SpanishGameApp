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
} from '@/screens/swipe/motion';
import { colors, fonts, radii } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';

// Timings from docs/design/swipe-game-ui/README.md ("Interactions & Behavior").
const SPRING_BACK = { duration: 300, easing: Easing.bezier(0.2, 0.7, 0.3, 1) };
const FLY_OUT = { duration: 300 };
const FLIP = { duration: 450, easing: Easing.bezier(0.3, 0.7, 0.3, 1) };

export type SwipeCardHandle = {
  // Flies the card out as if swiped: right for "I know it", left for "Still learning".
  answer: (knowIt: boolean) => void;
};

type Props = {
  word: DeckWord;
  // Called once, when the card has flown out.
  onAnswer: (knowIt: boolean) => void;
  ref?: Ref<SwipeCardHandle>;
};

// One word card: drag to answer, tap to flip. The screen mounts a fresh one per word, so every card
// starts centred and front-side up.
export function SwipeCard({ word, onAnswer, ref }: Props) {
  const t = useT();
  const dx = useSharedValue(0);
  // 0 = front, 1 = back; animates the 3D flip.
  const turn = useSharedValue(0);
  // Set once the card starts flying out: no more drags or answers for this card.
  const leaving = useSharedValue(false);
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    turn.set(withTiming(next ? 1 : 0, FLIP));
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

  useImperativeHandle(ref, () => ({ answer: flyOut }));

  // minDistance 0: the pan starts on touch, so a release under the tap distance can flip the card.
  const pan = Gesture.Pan()
    .minDistance(0)
    .withTestId('swipe-card')
    .onUpdate((event) => {
      if (!leaving.get()) dx.set(event.translationX);
    })
    .onEnd((event, success) => {
      if (leaving.get()) return;
      // A cancelled touch (the system took it) is not a release: spring back, answer nothing.
      const outcome = success ? releaseOutcome(event.translationX, event.translationY) : 'back';
      if (outcome === 'know' || outcome === 'learn') {
        flyOut(outcome === 'know');
        return;
      }
      dx.set(withTiming(0, SPRING_BACK));
      if (outcome === 'tap') scheduleOnRN(flip);
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
    <GestureDetector gesture={pan}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={t.swipe.cardLabel(word.lemma)}
        accessibilityHint={flipped ? t.swipe.showsWord : t.swipe.showsMeaning}
        accessibilityActions={[
          { name: 'activate' },
          { name: 'know', label: t.swipe.know },
          { name: 'learn', label: t.swipe.learn },
        ]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'activate') flip();
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
          <CardBack word={word} />
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
