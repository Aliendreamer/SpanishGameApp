import { fireEvent, render, screen } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
import { Words } from '@/screens/words';
import type { ListedWord, WordState } from '@/vocabulary/word-lists';

const mesa: ListedWord = {
  key: 'mesa|noun',
  lemma: 'mesa',
  article: 'la',
  meanings: 'table, dinner table',
  level: 'A1',
};
const hola: ListedWord = {
  key: 'hola|x',
  lemma: 'hola',
  article: null,
  meanings: 'hi',
  level: null,
};

async function renderWords({
  state = 'known' as WordState,
  query = '',
  words = [mesa, hola],
} = {}) {
  const onStateChange = jest.fn();
  const onQueryChange = jest.fn();
  await render(
    <Words
      counts={{ known: 2, learning: 1 }}
      state={state}
      onStateChange={onStateChange}
      query={query}
      onQueryChange={onQueryChange}
      words={words}
    />,
  );
  return { onStateChange, onQueryChange };
}

describe('<Words />', () => {
  test('shows the title, both lists with their counts, and the active one selected', async () => {
    await renderWords();

    expect(screen.getByRole('header', { name: 'My words' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Known · 2' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Still learning · 1' })).not.toBeSelected();
  });

  test('lists each word with its article, meanings, and level chip', async () => {
    await renderWords();

    expect(screen.getByText('la mesa')).toBeOnTheScreen();
    expect(screen.getByText('table, dinner table')).toBeOnTheScreen();
    expect(screen.getByText('A1')).toBeOnTheScreen();
    expect(screen.getByText('hola')).toBeOnTheScreen();
  });

  test('reports list switches and searches', async () => {
    const { onStateChange, onQueryChange } = await renderWords();

    await fireEvent.press(screen.getByRole('tab', { name: 'Still learning · 1' }));
    await fireEvent.changeText(screen.getByPlaceholderText('Search Spanish or English'), 'mes');

    expect(onStateChange).toHaveBeenCalledWith('learning');
    expect(onQueryChange).toHaveBeenCalledWith('mes');
  });

  test('says why a list is empty', async () => {
    await renderWords({ words: [] });
    expect(screen.getByText('Words you swipe right on show up here.')).toBeOnTheScreen();
  });

  test('says why the still-learning list is empty', async () => {
    await renderWords({ state: 'learning', words: [] });
    expect(
      screen.getByText('Words you swipe left on show up here until you know them.'),
    ).toBeOnTheScreen();
  });

  test('says when a search finds nothing', async () => {
    await renderWords({ query: 'zzz', words: [] });
    expect(screen.getByText('No words match your search.')).toBeOnTheScreen();
  });

  test('shows its text in Bulgarian, with the words and meanings as they are', async () => {
    const props = {
      counts: { known: 1200, learning: 0 },
      onStateChange: jest.fn(),
      query: '',
      onQueryChange: jest.fn(),
    };
    await render(<Words {...props} state="known" words={[mesa]} />, { wrapper: InBulgarian });

    expect(screen.getByRole('header', { name: 'Моите думи' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Познати · 1200' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'За учене · 0' })).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Търси на испански или английски')).toBeOnTheScreen();
    expect(screen.getByText('table, dinner table')).toBeOnTheScreen();

    await render(<Words {...props} state="learning" words={[]} />, { wrapper: InBulgarian });
    expect(
      screen.getByText('Думите, които плъзнеш наляво, стоят тук, докато ги научиш.'),
    ).toBeOnTheScreen();

    await render(<Words {...props} state="known" query="zz" words={[]} />, {
      wrapper: InBulgarian,
    });
    expect(screen.getByText('Няма думи за това търсене.')).toBeOnTheScreen();
  });
});
