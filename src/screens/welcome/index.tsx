import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts, radii, shadows } from '@/theme';

type Props = {
  onGetStarted: () => void | Promise<void>;
};

// Onboarding step 1 of 4 (docs/design/swipe-game-ui/README.md, "Welcome"); OnboardingShell
// supplies the padding and step dots.
export function Welcome({ onGetStarted }: Props) {
  return (
    <View style={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.heroCard, styles.backCard]} />
        <View style={[styles.heroCard, styles.frontCard]}>
          <View style={styles.frame}>
            <View style={styles.circle} />
            <Text style={styles.word}>hola</Text>
          </View>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Learn Spanish one swipe at a time</Text>
        <Text style={styles.body}>
          See a Spanish word, tap for the English meaning, and swipe to sort it.
        </Text>
      </View>
      <PrimaryButton label="Get started" onPress={onGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 28,
  },
  hero: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    position: 'absolute',
    width: 230,
    height: 300,
    borderRadius: radii.hero,
  },
  backCard: {
    backgroundColor: colors.roseLight,
    transform: [{ rotate: '-9deg' }, { translateX: -30 }],
  },
  frontCard: {
    backgroundColor: colors.rose,
    padding: 11,
    transform: [{ rotate: '5deg' }, { translateX: 18 }],
    boxShadow: shadows.card,
  },
  frame: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.frameOnRose,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.cardCircle,
  },
  word: {
    fontFamily: fonts.extraBold,
    fontSize: 52,
    letterSpacing: -1,
    color: colors.surface,
  },
  copy: {
    gap: 10,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 25,
    color: colors.bodyMuted,
  },
});
