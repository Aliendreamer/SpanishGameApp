import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { StepHeading } from '@/components/step-heading';
import type { Settings } from '@/storage/progress-db';
import { colors, fonts, radii } from '@/theme';
import { LEVELS } from '@/vocabulary/levels';

export type LevelChoice = Pick<Settings, 'level' | 'includeLower'>;

type Props = {
  initial: LevelChoice;
  onContinue: (choice: LevelChoice) => void | Promise<void>;
};

// Onboarding step 3 of 4 (docs/design/swipe-game-ui/README.md, "Pick your level").
export function LevelPicker({ initial, onContinue }: Props) {
  const [level, setLevel] = useState(initial.level);
  const [includeLower, setIncludeLower] = useState(initial.includeLower);
  // "Include lower levels" means nothing for Full, which already has everything.
  const lowerDisabled = level === 'full';

  return (
    <View style={styles.content}>
      <StepHeading title="Pick your level" body="You can change this any time in Settings." />
      <View accessibilityRole="radiogroup" style={styles.options}>
        {LEVELS.map(({ id, label, detail }) => {
          const selected = id === level;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityLabel={`${label}, ${detail}`}
              accessibilityState={{ checked: selected }}
              onPress={() => setLevel(id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={styles.radio}>{selected && <View style={styles.radioDot} />}</View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.optionDetail}>{detail}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Include lower levels"
        accessibilityState={{ checked: includeLower, disabled: lowerDisabled }}
        disabled={lowerDisabled}
        onPress={() => setIncludeLower(!includeLower)}
        style={[styles.checkRow, lowerDisabled && styles.checkRowDisabled]}
      >
        <View style={[styles.checkbox, includeLower && styles.checkboxChecked]}>
          {includeLower && <Text style={styles.tick}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>Include lower levels</Text>
      </Pressable>
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={() => onContinue({ level, includeLower })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 18,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: radii.section,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceFaint,
  },
  optionSelected: {
    borderColor: colors.rose,
    backgroundColor: colors.surface,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.rose,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
  optionDetail: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  checkRowDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.checkbox,
    borderWidth: 2,
    borderColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.rose,
  },
  tick: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.surface,
  },
  checkLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  footer: {
    marginTop: 'auto',
  },
});
