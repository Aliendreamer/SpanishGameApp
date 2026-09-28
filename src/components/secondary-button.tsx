import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii } from '@/theme';

type Props = {
  label: string;
  // Shows this glyph in a round button instead of the label, which still names it for screen
  // readers.
  icon?: string;
  onPress: () => void;
};

// The outlined ink pill for the second choice beside a PrimaryButton
// (docs/design/swipe-game-ui/README.md, "Secondary button").
export function SecondaryButton({ label, icon, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon && label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, icon && styles.round, pressed && styles.pressed]}
    >
      <Text style={[styles.label, icon && styles.icon]}>{icon ?? label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    width: 58,
  },
  pressed: {
    backgroundColor: colors.track,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  icon: {
    fontSize: 24,
  },
});
