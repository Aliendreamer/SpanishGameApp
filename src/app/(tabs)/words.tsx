import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StartupError } from '@/screens/startup-error';
import { Words } from '@/screens/words';
import {
  getWordCounts,
  getWordList,
  type ListedWord,
  type WordState,
} from '@/vocabulary/word-lists';

export default function WordsRoute() {
  const db = useSQLiteContext();
  const [state, setState] = useState<WordState>('known');
  const [query, setQuery] = useState('');
  // Typing stays responsive: the list query follows the text at a lower priority.
  const search = useDeferredValue(query);
  const [counts, setCounts] = useState<Record<WordState, number> | null>(null);
  // The loaded list and which one it is: the pills follow what is shown, not what was just tapped,
  // so rows from one list never appear under the other's pill.
  const [list, setList] = useState<{ state: WordState; words: ListedWord[] } | null>(null);
  const [failed, setFailed] = useState(false);
  // Bumped each time the tab is shown, so words swiped since then appear.
  const [shown, setShown] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setShown((count) => count + 1);
    }, []),
  );

  // Syncs with progress.db: the counts change only with swipes, so read them when the tab is shown.
  useEffect(() => {
    let active = true;
    getWordCounts(db)
      .then((loaded) => {
        if (active) setCounts(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [db, shown]);

  // Syncs with progress.db: the active list for the current search. A response for an older list or
  // search is dropped.
  useEffect(() => {
    let active = true;
    getWordList(db, state, search)
      .then((words) => {
        if (active) setList({ state, words });
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [db, state, search, shown]);

  if (failed) return <StartupError />;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {counts && list && (
        <Words
          counts={counts}
          state={list.state}
          onStateChange={setState}
          query={query}
          onQueryChange={setQuery}
          words={list.words}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
