import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ProgressRing } from '@/components/progress-ring';
import { SecondaryButton } from '@/components/secondary-button';
import { CardBack, CardFront } from '@/screens/swipe/card';
import { colors, fonts, radii, spacing } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';

type Props = {
  levelLine: string;
  username: string | null;
  words: DeckWord[];
};

// The Swipe tab (docs/design/swipe-game-ui/README.md, "Swipe tab"): one card at a time, tap to
// flip, answer with the buttons. Gestures, the queue rules, and the summary come in later parts.
export function Swipe({ levelLine, username, words }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  const word = words[index];
  const left = words.length - index;

  const answer = (knowIt: boolean) => {
    if (knowIt) setKnown(known + 1);
    setIndex(index + 1);
    // A new card always starts front-side up.
    setFlipped(false);
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
          <Text style={styles.progressText}>{`${known} / ${words.length}`}</Text>
          <ProgressRing value={known} max={words.length} />
        </View>
      </View>

      {word ? (
        <>
          <View style={styles.cardArea}>
            {left > 1 && <View testID="next-card" style={styles.nextCard} />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Card: ${word.lemma}`}
              accessibilityHint={flipped ? 'Shows the word' : 'Shows the meaning'}
              onPress={() => setFlipped(!flipped)}
              style={styles.card}
            >
              {flipped ? <CardBack word={word} /> : <CardFront word={word} />}
            </Pressable>
          </View>
          <View style={styles.buttons}>
            <View style={styles.button}>
              <SecondaryButton label="Still learning" onPress={() => answer(false)} />
            </View>
            <View style={styles.button}>
              <PrimaryButton label="I know it" onPress={() => answer(true)} />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.done}>
          <Text style={styles.doneTitle}>Batch done</Text>
        </View>
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
  card: {
    flex: 1,
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
  done: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.onboarding,
  },
  doneTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 38,
    letterSpacing: -0.8,
    color: colors.ink,
  },
});
