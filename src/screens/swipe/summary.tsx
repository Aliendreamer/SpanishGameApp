import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, fonts, radii, spacing } from '@/theme';
import type { batchSummary } from '@/vocabulary/queue';

type Props = {
  summary: ReturnType<typeof batchSummary>;
  onNext: () => void | Promise<void>;
  // A one-pass round of the words answered "Still learning".
  onPractise: () => void;
  onOpenSettings: () => void;
};

// "Batch done" after one pass: how it went, then next batch, practise the misses, or settings.
export function BatchSummary({ summary, onNext, onPractise, onOpenSettings }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>
          Batch done
        </Text>
        <Text style={styles.body}>
          {`You know ${summary.known} of ${summary.size} words in this batch.`}
        </Text>
      </View>
      <View style={styles.tiles}>
        <View style={styles.tile}>
          <Text style={[styles.number, styles.known]}>{summary.known}</Text>
          <Text style={styles.tileLabel}>known</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.number}>{summary.learning}</Text>
          <Text style={styles.tileLabel}>still learning</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <PrimaryButton label="Next batch" onPress={onNext} />
        {summary.learning > 0 && (
          <SecondaryButton
            label={`Practise the ${summary.learning} still learning`}
            onPress={onPractise}
          />
        )}
        <SecondaryButton label="Change settings" onPress={onOpenSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: spacing.onboarding,
    paddingBottom: 24,
  },
  copy: {
    gap: 8,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 25,
    color: colors.bodyMuted,
  },
  tiles: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    gap: 4,
    padding: 18,
    borderRadius: radii.section,
    backgroundColor: colors.surface,
  },
  number: {
    fontFamily: fonts.extraBold,
    fontSize: 40,
    lineHeight: 42,
    color: colors.ink,
  },
  known: {
    color: colors.rose,
  },
  tileLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttons: {
    gap: 10,
  },
});
