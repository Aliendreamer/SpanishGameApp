import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

// The safe-area frame with the onboarding padding (16 top, 24 sides and bottom), shared by the
// onboarding steps and the launch tutorial.
export function ScreenFrame({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.frame}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
    paddingHorizontal: spacing.onboarding,
    paddingBottom: 24,
    gap: 20,
  },
});
