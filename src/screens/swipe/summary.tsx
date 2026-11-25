import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useT } from '@/i18n';
import { PrimaryButton } from '@/components/primary-button';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, fonts, radii, spacing } from '@/theme';
import { singleFlight } from '@/utils/single-flight';
import type { batchSummary } from '@/vocabulary/queue';

type Props = {
  summary: ReturnType<typeof batchSummary>;
  onNext: () => void | Promise<void>;
  // Another round, of the words not learned yet.
  onContinue: () => void | Promise<void>;
  onOpenSettings: () => void;
};

// The end of a round: how the batch is going, then carry on with the words left (or, with none left,
// the next batch), the next batch anyway, or settings.
export function BatchSummary({ summary, onNext, onContinue, onOpenSettings }: Props) {
  const t = useT();
  // One runner for both, so a press while the other is loading can't deal twice.
  const [run] = useState(singleFlight);
  const left = summary.learning;
  const next = () => run(onNext);
  return (
    <View style={styles.screen}>
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>
          {left > 0 ? t.summary.roundTitle : t.summary.learnedTitle}
        </Text>
        <Text style={styles.body}>{t.summary.known(summary.known, summary.size)}</Text>
      </View>
      <View style={styles.tiles}>
        <View style={styles.tile}>
          <Text style={[styles.number, styles.known]}>{summary.known}</Text>
          <Text style={styles.tileLabel}>{t.summary.knownTile}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.number}>{summary.learning}</Text>
          <Text style={styles.tileLabel}>{t.summary.learningTile}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        {left > 0 ? (
          <>
            <PrimaryButton label={t.summary.continue(left)} onPress={() => run(onContinue)} />
            <SecondaryButton label={t.summary.next} onPress={next} />
          </>
        ) : (
          <PrimaryButton label={t.summary.next} onPress={next} />
        )}
        <SecondaryButton label={t.summary.changeSettings} onPress={onOpenSettings} />
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
