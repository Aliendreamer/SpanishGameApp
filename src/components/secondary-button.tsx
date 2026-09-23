import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
};

// The outlined ink pill for the second choice beside a PrimaryButton
// (docs/design/swipe-game-ui/README.md, "Secondary button").
export function SecondaryButton({ label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
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
  pressed: {
    backgroundColor: colors.track,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
});
