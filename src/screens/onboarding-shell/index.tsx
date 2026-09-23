import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenFrame } from '@/components/screen-frame';
import { StepDots } from '@/components/step-dots';
import { colors, fonts } from '@/theme';

type Props = {
  // Zero-based index of the current step, out of `count`.
  step: number;
  count: number;
  showBack: boolean;
  onBack: () => void;
  children: ReactNode;
};

// The frame every onboarding step shares: padding, step dots, and Back where the step allows it.
// The route layout mounts it once, so the dots stay put and animate between steps.
export function OnboardingShell({ step, count, showBack, onBack, children }: Props) {
  return (
    <ScreenFrame>
      <View style={styles.topRow}>
        <StepDots count={count} active={step} />
        {showBack && (
          <Pressable accessibilityRole="button" onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  topRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.label,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
  },
});
