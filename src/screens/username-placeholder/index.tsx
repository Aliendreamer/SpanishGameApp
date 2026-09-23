import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/theme';

// Stands in for onboarding step 2 until the Username screen is built.
export function UsernamePlaceholder() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.text}>Username — coming next</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.onboarding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.label,
  },
});
