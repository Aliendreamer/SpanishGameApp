import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  title: string;
  body?: string;
  // A small line above the title, e.g. "Hola, Ana" on the launch tutorial.
  greeting?: string;
};

// The title (and optional greeting and explanation) at the top of each step after Welcome.
export function StepHeading({ title, body, greeting }: Props) {
  return (
    <View style={styles.heading}>
      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 8,
  },
  greeting: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.label,
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
