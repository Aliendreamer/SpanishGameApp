import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ProgressRing } from '@/components/progress-ring';
import { SecondaryButton } from '@/components/secondary-button';
import { EmptyDeck } from '@/screens/swipe/empty';
import { BatchSummary } from '@/screens/swipe/summary';
import { SwipeCard, type SwipeCardHandle } from '@/screens/swipe/swipe-card';
import { colors, fonts, radii, spacing } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';
import { answerCard, batchSummary, startBatch } from '@/vocabulary/queue';

type Props = {
  levelLine: string;
  username: string | null;
  initialWords: DeckWord[];
  // Saves an answer; a rejection shows the save-failure banner, the game carries on.
  onAnswer: (word: DeckWord, knowIt: boolean) => Promise<void>;
  onNextBatch: () => Promise<DeckWord[]>;
  onOpenSettings: () => void;
};

// The Swipe tab (docs/design/swipe-game-ui/README.md, "Swipe tab"): one card at a time — tap to
// flip, swipe or use the buttons to answer — until every word of the batch is known.
export function Swipe({
  levelLine,
  username,
  initialWords,
  onAnswer,
  onNextBatch,
  onOpenSettings,
}: Props) {
  const [batch, setBatch] = useState(() => startBatch(initialWords));
  // Counts answers, so each card mounts fresh even when the same word comes straight back.
  const [turn, setTurn] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const card = useRef<SwipeCardHandle>(null);

  const word = batch.queue[0];

  // Called once the card has flown out.
  const answer = (knowIt: boolean) => {
    setBatch(answerCard(batch, knowIt));
    setTurn(turn + 1);
    onAnswer(word, knowIt).then(
      () => setSaveFailed(false),
      () => setSaveFailed(true),
    );
  };

  const nextBatch = async () => {
    setBatch(startBatch(await onNextBatch()));
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
          <Text style={styles.progressText}>{`${batch.known} / ${batch.size}`}</Text>
          <ProgressRing value={batch.known} max={batch.size} />
        </View>
      </View>
      {saveFailed && (
        <View accessibilityRole="alert" style={styles.banner}>
          <Text style={styles.bannerText}>{"Couldn't save your last answer."}</Text>
        </View>
      )}

      {batch.size === 0 ? (
        <EmptyDeck onOpenSettings={onOpenSettings} />
      ) : !word ? (
        <BatchSummary
          summary={batchSummary(batch)}
          onContinue={nextBatch}
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
              <SecondaryButton label="Still learning" onPress={() => card.current?.answer(false)} />
            </View>
            <View style={styles.button}>
              <PrimaryButton label="I know it" onPress={() => card.current?.answer(true)} />
            </View>
          </View>
        </>
      )}
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
