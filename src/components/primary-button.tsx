import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii } from '@/theme';
import { singleFlight } from '@/utils/single-flight';

type Props = {
  label: string;
  onPress: () => void | Promise<void>;
  // "light" is cream with a rose label, for use on rose backgrounds.
  tone?: 'rose' | 'light';
  // Half opacity for an action that is not ready yet; it stays pressable so the screen can explain why.
  dimmed?: boolean;
};

// The full-width pill used for every main action.
export function PrimaryButton({ label, onPress, tone = 'rose', dimmed = false }: Props) {
  // While an async action (save, navigate) runs, further presses are ignored, so a double tap
  // can't run it twice.
  const [run] = useState(singleFlight);
  const light = tone === 'light';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => run(onPress)}
      style={({ pressed }) => [
        styles.button,
        light && styles.light,
        pressed && (light ? styles.lightPressed : styles.pressed),
        dimmed && styles.dimmed,
      ]}
    >
      <Text style={[styles.label, light && styles.lightLabel]}>{label}</Text>
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
  light: {
    backgroundColor: colors.surface,
  },
  lightPressed: {
    backgroundColor: colors.soft,
  },
  dimmed: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.surface,
  },
  lightLabel: {
    color: colors.rose,
  },
});
