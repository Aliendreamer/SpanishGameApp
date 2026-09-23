import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  title: string;
  body: string;
};

// The title and short explanation at the top of each onboarding step after Welcome.
export function StepHeading({ title, body }: Props) {
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 8,
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
