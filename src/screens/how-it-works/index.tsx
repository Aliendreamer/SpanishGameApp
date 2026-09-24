import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';
import { PrimaryButton } from '@/components/primary-button';
import { StepHeading } from '@/components/step-heading';
import { useT } from '@/i18n';
import { colors, fonts, radii } from '@/theme';

type Props = {
  // "Hola, {username}" on the launch tutorial; onboarding shows none.
  greeting?: string;
  initialShowTutorial: boolean;
  onStart: (showTutorial: boolean) => void | Promise<void>;
};

// The three rows' icons; their texts are `howItWorks.rows` in the string tables, in this order.
const STEPS = [
  {
    icon: '1',
    tile: { backgroundColor: colors.soft },
    iconColor: colors.rose,
  },
  {
    icon: '→',
    tile: { backgroundColor: colors.know },
    iconColor: colors.surface,
  },
  {
    icon: '←',
    tile: { backgroundColor: colors.ink },
    iconColor: colors.surface,
  },
];

// Onboarding step 4 of 4, and the optional tutorial on later launches
// (docs/design/swipe-game-ui/README.md, "How it works" and "Tutorial screen").
export function HowItWorks({ greeting, initialShowTutorial, onStart }: Props) {
  const t = useT();
  const [showTutorial, setShowTutorial] = useState(initialShowTutorial);

  return (
    <View style={styles.content}>
      <StepHeading greeting={greeting} title={t.howItWorks.title} />
      <View style={styles.rows}>
        {STEPS.map(({ icon, tile, iconColor }, index) => (
          <View key={icon} style={styles.row}>
            <View style={[styles.tile, tile]}>
              <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t.howItWorks.rows[index].title}</Text>
              <Text style={styles.rowBody}>{t.howItWorks.rows[index].body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Checkbox
        label={t.howItWorks.showAtStart}
        checked={showTutorial}
        onToggle={() => setShowTutorial(!showTutorial)}
        style={styles.checkbox}
      />
      <PrimaryButton label={t.howItWorks.start} onPress={() => onStart(showTutorial)} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 22,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: radii.section,
    backgroundColor: colors.surface,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
  rowBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  // Pinned just above the button, as in the design.
  checkbox: {
    marginTop: 'auto',
  },
});
