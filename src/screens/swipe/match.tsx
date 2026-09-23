import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts, radii, shadows, spacing } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';

// The card springs in: tilted and small, overshooting to a slight counter-tilt
// (docs/design/swipe-game-ui/README.md, "It's a match!" animation).
const cardEntering = new Keyframe({
  0: { transform: [{ rotate: '8deg' }, { scale: 0.6 }] },
  100: {
    transform: [{ rotate: '-4deg' }, { scale: 1 }],
    easing: Easing.bezier(0.2, 1.4, 0.4, 1),
  },
}).duration(500);

type Props = {
  word: DeckWord;
  onClose: () => void;
};

// Shown when a word the user was still learning is answered "I know it".
export function MatchOverlay({ word, onClose }: Props) {
  return (
    <Modal transparent statusBarTranslucent visible onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(350)}
        accessibilityViewIsModal
        style={styles.backdrop}
      >
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            It&apos;s a match!
          </Text>
          <Text style={styles.line}>You were still learning this one. Now you know it.</Text>
        </View>
        <Animated.View entering={cardEntering} style={styles.card}>
          <Text style={styles.article}>{word.article ?? word.partOfSpeech}</Text>
          <Text style={styles.lemma}>{word.lemma}</Text>
          <Text style={styles.meanings}>{word.meanings.join(', ')}</Text>
        </Animated.View>
        <PrimaryButton label="Keep swiping" tone="light" onPress={onClose} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    gap: 30,
    padding: spacing.onboarding,
    backgroundColor: colors.rose,
  },
  copy: {
    gap: 10,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 46,
    lineHeight: 48,
    letterSpacing: -0.9,
    color: colors.surface,
  },
  line: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: colors.onRoseSoft,
  },
  card: {
    alignSelf: 'center',
    width: 250,
    gap: 10,
    paddingVertical: 26,
    paddingHorizontal: 24,
    borderRadius: radii.hero,
    backgroundColor: colors.surface,
    boxShadow: shadows.match,
  },
  article: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.rose,
  },
  lemma: {
    fontFamily: fonts.extraBold,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -0.9,
    color: colors.ink,
  },
  meanings: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
