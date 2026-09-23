import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';
import { PrimaryButton } from '@/components/primary-button';
import { RadioMark } from '@/components/settings-rows';
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
              <RadioMark selected={selected} />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.optionDetail}>{detail}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Checkbox
        label="Include lower levels"
        checked={includeLower}
        disabled={lowerDisabled}
        onToggle={() => setIncludeLower(!includeLower)}
      />
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
  footer: {
    marginTop: 'auto',
  },
});
