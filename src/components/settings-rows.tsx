import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/theme';

// The Settings tab's building blocks (docs/design/swipe-game-ui/README.md, "Settings tab"): a
// labelled cream card of rows divided by thin lines.

export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      {/* Shown in capitals; screen readers get the sentence-case label, not letter-by-letter caps. */}
      <Text accessibilityRole="header" accessibilityLabel={label} style={styles.sectionLabel}>
        {label.toLocaleUpperCase()}
      </Text>
      <View style={styles.card}>
        {Children.toArray(children).map((row, index) => (
          <View key={index} style={index > 0 && styles.divider}>
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

type SwitchRowProps = {
  label: string;
  detail: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

// The whole row toggles, not just the switch.
export function SwitchRow({
  label,
  detail,
  value,
  onValueChange,
  disabled = false,
}: SwitchRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.row, disabled && styles.disabled]}
    >
      <RowText label={label} detail={detail} />
      <Switch
        accessible={false}
        importantForAccessibility="no"
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: colors.track, true: colors.rose }}
        thumbColor={colors.surface}
      />
    </Pressable>
  );
}

type RadioRowProps = { label: string; detail?: string; selected: boolean; onPress: () => void };

export function RadioRow({ label, detail, selected, onPress }: RadioRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={styles.row}
    >
      <RowText label={label} detail={detail} />
      <RadioMark selected={selected} />
    </Pressable>
  );
}

type LinkRowProps = { label: string; onPress: () => void; tone?: 'default' | 'danger' };

// "›" marks a row that opens something; a danger row (reset) is red and has none.
export function LinkRow({ label, onPress, tone = 'default' }: LinkRowProps) {
  const danger = tone === 'danger';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.row, styles.linkRow]}
    >
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      {!danger && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

// The rose radio circle, filled when selected; also used by the onboarding Level step.
export function RadioMark({ selected }: { selected: boolean }) {
  return <View style={styles.radio}>{selected && <View style={styles.radioDot} />}</View>;
}

function RowText({ label, detail }: { label: string; detail?: string }) {
  return (
    <View style={styles.rowText}>
      <Text style={styles.label}>{label}</Text>
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionLabel: {
    paddingTop: 4,
    paddingHorizontal: 4,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.label,
  },
  card: {
    overflow: 'hidden',
    borderRadius: radii.section,
    backgroundColor: colors.surface,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  linkRow: {
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.45,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  danger: {
    color: colors.error,
  },
  chevron: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.rose,
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
});
