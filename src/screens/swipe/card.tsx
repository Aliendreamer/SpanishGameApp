import { StyleSheet, Text, View } from 'react-native';

import { partOfSpeechName, useT } from '@/i18n';
import { colors, fonts, radii, shadows } from '@/theme';
import type { DeckWord } from '@/vocabulary/deck';

// The design sizes the lemma at 72, or 54 above 9 characters; longer words also shrink to fit.
export const lemmaSize = (lemma: string) => (lemma.length > 9 ? 54 : 72);

// The design's 36 is sized for short meanings; real ones run long, so step down by the longest.
export function meaningSize(meanings: string[]) {
  const longest = Math.max(0, ...meanings.map((meaning) => meaning.length));
  if (longest <= 16) return 36;
  if (longest <= 30) return 28;
  return 22;
}

// The rose "3a Framed" front (docs/design/swipe-game-ui/README.md, "Swipe card, front").
export function CardFront({ word }: { word: DeckWord }) {
  const t = useT();
  const size = lemmaSize(word.lemma);

  return (
    <View style={styles.front}>
      <View style={styles.frame}>
        <View style={styles.circle} />
        {word.level && <Text style={styles.level}>{word.level}</Text>}
        {word.article && <Text style={styles.article}>{word.article}</Text>}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.lemma, { fontSize: size, lineHeight: Math.round(size * 0.95) + 4 }]}
        >
          {word.lemma}
        </Text>
        <Text style={styles.hint}>{t.swipe.tapHint}</Text>
      </View>
    </View>
  );
}

// The cream back with meanings and one example ("Swipe card, back").
export function CardBack({ word }: { word: DeckWord }) {
  const t = useT();
  const size = meaningSize(word.meanings);

  return (
    <View style={styles.back}>
      <View style={styles.backHeader}>
        <Text style={styles.backWord}>
          {word.article ? `${word.article} ${word.lemma}` : word.lemma}
        </Text>
        <Text style={styles.chip}>{partOfSpeechName(t, word.partOfSpeech)}</Text>
      </View>
      <View style={styles.meanings}>
        {word.meanings.map((meaning) => (
          <Text
            key={meaning}
            numberOfLines={3}
            style={[styles.meaning, { fontSize: size, lineHeight: Math.round(size * 1.05) + 2 }]}
          >
            {meaning}
          </Text>
        ))}
      </View>
      {word.example && (
        <View style={styles.example}>
          <Text style={styles.exampleSpanish}>{word.example.spanish}</Text>
          <Text style={styles.exampleEnglish}>{word.example.english}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  front: {
    flex: 1,
    padding: 14,
    borderRadius: radii.card,
    backgroundColor: colors.rose,
    boxShadow: shadows.card,
  },
  frame: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.frameOnRose,
    borderRadius: radii.frame,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  circle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.cardCircle,
  },
  level: {
    position: 'absolute',
    top: 18,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 1.7,
    color: colors.onRose,
  },
  article: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.onRose,
  },
  lemma: {
    fontFamily: fonts.extraBold,
    letterSpacing: -1,
    color: colors.surface,
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 22,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.onRoseHint,
  },
  back: {
    flex: 1,
    gap: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.rose,
    backgroundColor: colors.surface,
  },
  backHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  backWord: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    color: colors.rose,
  },
  chip: {
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.soft,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.chipText,
  },
  meanings: {
    flexShrink: 1,
    gap: 12,
  },
  meaning: {
    fontFamily: fonts.extraBold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  example: {
    marginTop: 'auto',
    gap: 4,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: radii.section,
    backgroundColor: colors.soft,
  },
  exampleSpanish: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 23,
    color: colors.ink,
  },
  exampleEnglish: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
