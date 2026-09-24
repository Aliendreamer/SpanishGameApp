import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useT } from '@/i18n';
import { PrimaryButton } from '@/components/primary-button';
import { ProgressRing } from '@/components/progress-ring';
import { SecondaryButton } from '@/components/secondary-button';
import { EmptyDeck } from '@/screens/swipe/empty';
import { MatchOverlay } from '@/screens/swipe/match';
import { BatchSummary } from '@/screens/swipe/summary';
import { SwipeCard, type SwipeCardHandle } from '@/screens/swipe/swipe-card';
import { colors, fonts, radii, spacing } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';
import { answerCard, batchSummary, startBatch } from '@/vocabulary/queue';

type Props = {
  levelLine: string;
  username: string | null;
  initialWords: DeckWord[];
  // Saves an answer and resolves true for a match (a "Still learning" word now known); a
  // rejection shows the save-failure banner, and the game carries on.
  onAnswer: (word: DeckWord, knowIt: boolean) => Promise<boolean>;
  onNextBatch: () => Promise<DeckWord[]>;
  onOpenSettings: () => void;
};

// The Swipe tab (docs/design/swipe-game-ui/README.md, "Swipe tab"): one card at a time — tap to
// flip, swipe or use the buttons to answer — one pass per batch, then a choice.
export function Swipe({
  levelLine,
  username,
  initialWords,
  onAnswer,
  onNextBatch,
  onOpenSettings,
}: Props) {
  const t = useT();
  const [batch, setBatch] = useState(() => startBatch(initialWords));
  // Counts answers, so each card mounts fresh even when the same word comes straight back.
  const [turn, setTurn] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  // The word being celebrated with "It's a match!", if any.
  const [match, setMatch] = useState<DeckWord | null>(null);
  const card = useRef<SwipeCardHandle>(null);
  // The latest answer's save: "Next batch" waits for it, so a word just answered is never dealt
  // again because its swipe wasn't stored yet.
  const lastSave = useRef<Promise<void>>(Promise.resolve());

  const word = batch.queue[0];
  // Progress through the pass: every answer counts, so a batch ends at size / size.
  const answered = batch.size - batch.queue.length;

  // Called once the card has flown out.
  const answer = (knowIt: boolean) => {
    setBatch(answerCard(batch, knowIt));
    setTurn(turn + 1);
    lastSave.current = onAnswer(word, knowIt).then(
      (isMatch) => {
        setSaveFailed(false);
        if (isMatch) setMatch(word);
      },
      () => setSaveFailed(true),
    );
  };

  const nextBatch = async () => {
    await lastSave.current;
    setBatch(startBatch(await onNextBatch()));
    setTurn(turn + 1);
  };
  // Another pass over just the words answered "Still learning".
  const practise = () => {
    setBatch(startBatch(batch.learning));
    setTurn(turn + 1);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text numberOfLines={1} style={styles.levelLine}>
            {levelLine}
          </Text>
          <Text numberOfLines={1} style={styles.hello}>
            {username ? `Hola, ${username}` : 'Hola'}
          </Text>
        </View>
        <View style={styles.progress}>
          <Text style={styles.progressText}>{`${answered} / ${batch.size}`}</Text>
          <ProgressRing value={answered} max={batch.size} />
        </View>
      </View>
      {saveFailed && (
        <View accessibilityRole="alert" style={styles.banner}>
          <Text style={styles.bannerText}>{t.swipe.saveFailed}</Text>
        </View>
      )}

      {batch.size === 0 ? (
        <EmptyDeck onOpenSettings={onOpenSettings} />
      ) : !word ? (
        <BatchSummary
          summary={batchSummary(batch)}
          onNext={nextBatch}
          onPractise={practise}
          onOpenSettings={onOpenSettings}
        />
      ) : (
        <>
          <View style={styles.cardArea}>
            {batch.queue.length > 1 && <View testID="next-card" style={styles.nextCard} />}
            <SwipeCard ref={card} key={turn} word={word} onAnswer={answer} />
          </View>
          <View style={styles.buttons}>
            <View style={styles.button}>
              <SecondaryButton label={t.swipe.learn} onPress={() => card.current?.answer(false)} />
            </View>
            <View style={styles.button}>
              <PrimaryButton label={t.swipe.know} onPress={() => card.current?.answer(true)} />
            </View>
          </View>
        </>
      )}
      {match && <MatchOverlay word={match} onClose={() => setMatch(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingHorizontal: spacing.screen,
    paddingBottom: 4,
    gap: 12,
  },
  greeting: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  levelLine: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.label,
  },
  hello: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    color: colors.ink,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  cardArea: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 14,
  },
  nextCard: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.card,
    backgroundColor: colors.roseLight,
    transform: [{ rotate: '-3deg' }, { scale: 0.96 }],
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: spacing.screen,
    paddingBottom: 14,
  },
  button: {
    flex: 1,
  },
  banner: {
    marginTop: 10,
    marginHorizontal: spacing.screen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.row,
    backgroundColor: colors.ink,
  },
  bannerText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.surface,
  },
});
