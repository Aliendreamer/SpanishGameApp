import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useT } from '@/i18n';
import { colors, fonts, radii, spacing } from '@/theme';
import type { ListedWord, WordState } from '@/vocabulary/word-lists';

type Props = {
  counts: Record<WordState, number>;
  state: WordState;
  onStateChange: (state: WordState) => void;
  query: string;
  onQueryChange: (query: string) => void;
  words: ListedWord[];
};

// The two lists, in pill order; their texts are `words.lists` in the string tables.
const LISTS: WordState[] = ['known', 'learning'];

// "My words" (docs/design/swipe-game-ui/README.md, "Words tab").
export function Words({ counts, state, onStateChange, query, onQueryChange, words }: Props) {
  const t = useT();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {t.words.title}
        </Text>
        <View accessibilityRole="tablist" style={styles.pills}>
          {LISTS.map((list) => {
            const selected = list === state;
            return (
              <Pressable
                key={list}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => onStateChange(list)}
                style={[styles.pill, selected && styles.pillActive]}
              >
                <Text style={[styles.pillText, selected && styles.pillTextActive]}>
                  {`${t.words.lists[list].label} · ${t.common.number(counts[list])}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          accessibilityLabel={t.words.search}
          value={query}
          onChangeText={onQueryChange}
          placeholder={t.words.search}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.search}
        />
      </View>
      <FlatList
        data={words}
        keyExtractor={(word) => word.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <WordRow word={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.trim() ? t.words.noMatch : t.words.lists[state].empty}
          </Text>
        }
      />
    </View>
  );
}

function WordRow({ word }: { word: ListedWord }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.word}>
          {word.article ? `${word.article} ${word.lemma}` : word.lemma}
        </Text>
        <Text numberOfLines={1} style={styles.meanings}>
          {word.meanings}
        </Text>
      </View>
      {word.level && <Text style={styles.chip}>{word.level}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    gap: 14,
    paddingTop: 14,
    paddingHorizontal: spacing.screen,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.ink,
  },
  pillText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
  pillTextActive: {
    color: colors.surface,
  },
  search: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  list: {
    gap: 8,
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.row,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  word: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.ink,
  },
  meanings: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  chip: {
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.soft,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.9,
    color: colors.chipText,
  },
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
