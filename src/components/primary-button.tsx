import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
};

// The full-width rose pill used for every main action.
export function PrimaryButton({ label, onPress }: Props) {
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
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.rosePressed,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.surface,
  },
});
