import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { colors, fonts, spacing } from '@/theme';

// Full-screen error when the app's data (progress.db, the dictionary) can't be opened or read
// (roadmap: bad data → full-screen error). There is nothing to retry in-app; reopening is the way
// out.
export function StartupError() {
  const t = useT();

  return (
    <SafeAreaView style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        {t.startupError.title}
      </Text>
      <Text style={styles.body}>{t.startupError.body}</Text>
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
