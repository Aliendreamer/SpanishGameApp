import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/theme';

// Full-screen error when the app's own data (progress.db) can't be opened at startup (roadmap:
// bad data → full-screen error). There is nothing to retry in-app; reopening is the way out.
export function StartupError() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Something went wrong
      </Text>
      <Text style={styles.body}>
        The app couldn’t open its data on this phone. Close the app and open it again.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.onboarding,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: colors.bodyMuted,
  },
});
