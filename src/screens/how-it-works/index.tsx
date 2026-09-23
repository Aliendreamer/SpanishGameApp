import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';
import { PrimaryButton } from '@/components/primary-button';
import { StepHeading } from '@/components/step-heading';
import { colors, fonts, radii } from '@/theme';

type Props = {
  // "Hola, {username}" on the launch tutorial; onboarding shows none.
  greeting?: string;
  initialShowTutorial: boolean;
  onStart: (showTutorial: boolean) => void | Promise<void>;
};

const STEPS = [
  {
    icon: '1',
    tile: { backgroundColor: colors.soft },
    iconColor: colors.rose,
    title: 'Tap the card',
    body: 'It flips to show the English meaning and an example.',
  },
  {
    icon: '→',
    tile: { backgroundColor: colors.know },
    iconColor: colors.surface,
    title: 'Swipe right if you know it',
    body: 'The word leaves this batch.',
  },
  {
    icon: '←',
    tile: { backgroundColor: colors.ink },
    iconColor: colors.surface,
    title: "Swipe left if you're still learning",
    body: 'It comes back a few cards later.',
  },
];

// Onboarding step 4 of 4, and the optional tutorial on later launches
// (docs/design/swipe-game-ui/README.md, "How it works" and "Tutorial screen").
export function HowItWorks({ greeting, initialShowTutorial, onStart }: Props) {
  const [showTutorial, setShowTutorial] = useState(initialShowTutorial);

  return (
    <View style={styles.content}>
      <StepHeading greeting={greeting} title="How it works" />
      <View style={styles.rows}>
        {STEPS.map(({ icon, tile, iconColor, title, body }) => (
          <View key={title} style={styles.row}>
            <View style={[styles.tile, tile]}>
              <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{title}</Text>
              <Text style={styles.rowBody}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Checkbox
        label="Show this screen when the app starts"
        checked={showTutorial}
        onToggle={() => setShowTutorial(!showTutorial)}
        style={styles.checkbox}
      />
      <PrimaryButton label="Start swiping" onPress={() => onStart(showTutorial)} />
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
