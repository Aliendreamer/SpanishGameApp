import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts, radii } from '@/theme';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// The rose square checkbox with a label, from the onboarding design.
export function Checkbox({ label, checked, onToggle, disabled = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={[styles.row, disabled && styles.disabled, style]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  disabled: {
    opacity: 0.4,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radii.checkbox,
    borderWidth: 2,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.rose,
  },
  tick: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.surface,
  },
  label: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
});
