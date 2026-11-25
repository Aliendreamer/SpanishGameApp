import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { router as appRouter } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import { BUNDLED_VOCABULARY, openTestDb, type TestDb } from '../../../scripts/node-sqlite-db';

import StartRoute from '@/app/index';
import OnboardingLayout from '@/app/onboarding/_layout';
import WelcomeRoute from '@/app/onboarding/index';
import HowItWorksRoute from '@/app/onboarding/how-it-works';
import LevelRoute from '@/app/onboarding/level';
import UsernameRoute from '@/app/onboarding/username';
import TabsLayout from '@/app/(tabs)/_layout';
import ProgressRoute from '@/app/(tabs)/progress';
import SettingsRoute from '@/app/(tabs)/settings';
import SwipeRoute from '@/app/(tabs)/swipe';
import WordsRoute from '@/app/(tabs)/words';
import TutorialRoute from '@/app/tutorial';
import { LanguageProvider } from '@/i18n';
import { LaunchContext } from '@/launch';
import type { LaunchPrefs } from '@/storage/prefs';
import { readBatch, saveBatch } from '@/storage/batches';
import { DEFAULT_SETTINGS, getSettings, migrate, saveSettings } from '@/storage/progress-db';

// Reanimated's official mock finishes animations at once, so swipe answers land immediately.
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

// Routes read progress.db through useSQLiteContext(); give them a real, migrated in-memory one.
let mockDb: TestDb;
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => mockDb }));

const routes = {
  index: StartRoute,
  'onboarding/_layout': OnboardingLayout,
  'onboarding/index': WelcomeRoute,
  'onboarding/username': UsernameRoute,
  'onboarding/level': LevelRoute,
  'onboarding/how-it-works': HowItWorksRoute,
  tutorial: TutorialRoute,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/swipe': SwipeRoute,
  '(tabs)/words': WordsRoute,
  '(tabs)/progress': ProgressRoute,
  '(tabs)/settings': SettingsRoute,
};

const firstLaunch: LaunchPrefs = {
  username: null,
  onboardingDone: false,
  showTutorial: true,
  language: 'en',
};

// renderRouter adds getPathname to the promise that Testing Library 14's render returns, so keep
// that object and await it separately; awaiting it (or returning it from an async function)
// drops the helper.
// The root layout reads the launch prefs and provides the language; here both come straight from
// `launch`.
async function renderApp(initialUrl = '/', launch = firstLaunch) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LaunchContext value={launch}>
      <LanguageProvider initial={launch.language}>{children}</LanguageProvider>
    </LaunchContext>
  );
  const router = renderRouter(routes, { initialUrl, wrapper });
  await router;
  return { router };
}

// Waits for something asynchronous, like a row in the database. Under renderRouter's fake timers,
// waitFor with an async check can resolve while its own act() still runs, and the next event then
// overlaps it; this finishes each step before the next.
async function eventually(check: () => Promise<void>, tries = 20) {
  for (let left = tries; ; left--) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(50);
    });
    try {
      return await check();
    } catch (error) {
      if (left <= 1) throw error;
    }
  }
}

const backLink = () => screen.queryByRole('button', { name: 'Back' });

describe('onboarding routes', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockDb = openTestDb();
    await migrate(mockDb);
    // The real dictionary, attached as the app does at startup (read only here).
    await mockDb.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
  });
  afterEach(() => mockDb.close());

  test('the start route opens Welcome as step 1, with no Back', async () => {
    const { router } = await renderApp();

    expect(router.getPathname()).toBe('/onboarding');
    expect(screen.getByLabelText('Step 1 of 4')).toBeOnTheScreen();
    expect(screen.getByText('Learn Spanish one swipe at a time')).toBeOnTheScreen();
    expect(backLink()).toBeNull();
  });

  test('Welcome → Username → saved → Level, with no way back', async () => {
    const { router } = await renderApp();

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(router.getPathname()).toBe('/onboarding/username');
    expect(screen.getByLabelText('Step 2 of 4')).toBeOnTheScreen();
    expect(backLink()).toBeNull();
    expect(appRouter.canGoBack()).toBe(false);

    await fireEvent.changeText(screen.getByPlaceholderText('Username'), '  Ana  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(router.getPathname()).toBe('/onboarding/level');
    expect(screen.getByLabelText('Step 3 of 4')).toBeOnTheScreen();
    expect(await screen.findByText('Pick your level')).toBeOnTheScreen();
    expect(backLink()).toBeNull();
    expect(appRouter.canGoBack()).toBe(false);
    expect(await AsyncStorage.getItem('username')).toBe('Ana');
  });

  test('Get started skips Username when a username is already saved', async () => {
    await AsyncStorage.setItem('username', 'Ana');
    const { router } = await renderApp();

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(router.getPathname()).toBe('/onboarding/level');
  });

  test('a double tap on Get started still leaves no history', async () => {
    const { router } = await renderApp();

    const getStarted = screen.getByRole('button', { name: 'Get started' });
    await fireEvent.press(getStarted);
    await fireEvent.press(getStarted);

    expect(router.getPathname()).toBe('/onboarding/username');
    expect(appRouter.canGoBack()).toBe(false);
  });

  test('Back on a step opened directly goes to the previous step', async () => {
    const { router } = await renderApp('/onboarding/how-it-works');

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(router.getPathname()).toBe('/onboarding/level');
  });

  test('Level opens on the saved settings', async () => {
    await saveSettings(mockDb, { level: 'advanced', includeLower: false });
    await renderApp('/onboarding/level');

    expect(await screen.findByRole('radio', { name: /^Advanced/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Include lower levels' })).not.toBeChecked();
  });

  test('Level saves the choice, opens How it works, and Back returns to Level', async () => {
    const { router } = await renderApp('/onboarding/level');

    await fireEvent.press(await screen.findByRole('radio', { name: /^Intermediate/ }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Include lower levels' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(router.getPathname()).toBe('/onboarding/how-it-works');
    expect(screen.getByLabelText('Step 4 of 4')).toBeOnTheScreen();
    expect(await getSettings(mockDb)).toEqual({
      level: 'intermediate',
      includeLower: false,
      includeKnown: false,
      wordType: 'all',
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(router.getPathname()).toBe('/onboarding/level');
  });
});

describe('launch routing', () => {
  const done: LaunchPrefs = {
    username: 'Ana',
    onboardingDone: true,
    showTutorial: true,
    language: 'en',
  };

  // Opens the Swipe tab and marks its first word as answered "Still learning" in an earlier session.
  async function openSwipeWithFirstWordStillLearning() {
    await renderApp('/swipe', { ...done, showTutorial: false });
    const card = await screen.findByRole('button', { name: /^Card:/ });
    const lemma = String(card.props.accessibilityLabel).replace('Card: ', '');
    const { key } = (await mockDb.getFirstAsync<{ key: string }>(
      'SELECT key FROM vocab.vocabulary WHERE spanish = ? AND cefr IS NOT NULL',
      [lemma],
    ))!;
    await mockDb.runAsync("INSERT INTO swipes (key, direction, at) VALUES (?, 'left', 0)", [key]);
  }

  beforeEach(async () => {
    await AsyncStorage.clear();
    mockDb = openTestDb();
    await migrate(mockDb);
    // The real dictionary, attached as the app does at startup (read only here).
    await mockDb.runAsync('ATTACH DATABASE ? AS vocab', [BUNDLED_VOCABULARY]);
  });
  afterEach(() => mockDb.close());

  test('after onboarding, with the tutorial on, the app opens the Tutorial', async () => {
    await AsyncStorage.setItem('username', 'Ana');
    const { router } = await renderApp('/', done);

    expect(router.getPathname()).toBe('/tutorial');
    expect(await screen.findByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'How it works' })).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Step /)).toBeNull();
    expect(backLink()).toBeNull();
  });

  test('the tabs follow the interface language', async () => {
    await renderApp('/swipe', { ...done, showTutorial: false, language: 'bg' });

    for (const name of ['Карти', 'Думи', 'Напредък', 'Настройки']) {
      expect(await screen.findByRole('tab', { name })).toBeOnTheScreen();
    }
  });

  test('after onboarding, with the tutorial off, the app opens Swipe', async () => {
    const { router } = await renderApp('/', { ...done, showTutorial: false });

    expect(router.getPathname()).toBe('/swipe');
    expect(await screen.findByText('Tap to see the meaning')).toBeOnTheScreen();
  });

  test('the Tutorial saves its checkbox and opens Swipe', async () => {
    const { router } = await renderApp('/tutorial', done);

    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Start swiping' }));

    expect(router.getPathname()).toBe('/swipe');
    expect(await AsyncStorage.getItem('showTutorial')).toBe('false');
  });

  test('finishing onboarding saves the flags and lands on Swipe with no way back', async () => {
    const { router } = await renderApp('/onboarding/level');

    await fireEvent.press(await screen.findByRole('button', { name: 'Continue' }));
    expect(router.getPathname()).toBe('/onboarding/how-it-works');
    expect(
      screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
    ).toBeChecked();

    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Start swiping' }));

    expect(router.getPathname()).toBe('/swipe');
    expect(appRouter.canGoBack()).toBe(false);
    expect(await AsyncStorage.getItem('onboardingDone')).toBe('true');
    expect(await AsyncStorage.getItem('showTutorial')).toBe('false');
  });

  test('the Swipe tab deals the first word of the saved level, and tabs switch', async () => {
    await AsyncStorage.setItem('username', 'Ana');
    const { router } = await renderApp('/swipe', { ...done, showTutorial: false });

    expect(await screen.findByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByText('Beginner · A1, A2')).toBeOnTheScreen();
    expect(screen.getByText('0 / 100')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Swipe' })).toBeSelected();

    await fireEvent.press(screen.getByRole('tab', { name: 'Words' }));

    expect(router.getPathname()).toBe('/words');
    expect(await screen.findByRole('header', { name: 'My words' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Words' })).toBeSelected();
  });

  test('the Swipe tab shows the full-screen error when its words cannot be loaded', async () => {
    await mockDb.execAsync('DETACH DATABASE vocab');
    await renderApp('/swipe', { ...done, showTutorial: false });

    expect(await screen.findByText('Something went wrong')).toBeOnTheScreen();
  });

  test('an answer on the Swipe tab is saved to the swipe log', async () => {
    await renderApp('/swipe', { ...done, showTutorial: false });
    const card = await screen.findByRole('button', { name: /^Card:/ });
    const lemma = String(card.props.accessibilityLabel).replace('Card: ', '');

    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));

    await eventually(async () =>
      expect(await mockDb.getAllAsync('SELECT key, direction FROM swipes')).toEqual([
        { key: expect.stringMatching(new RegExp(`^${lemma}\\|`)), direction: 'right' },
      ]),
    );
  });

  test('with every word of the level swiped, the one still being learned is dealt', async () => {
    await mockDb.execAsync(
      `INSERT INTO swipes (key, direction, at) SELECT key, 'right', 0 FROM vocab.vocabulary WHERE cefr IN ('A1', 'A2');
       INSERT INTO swipes (key, direction, at) VALUES ('casa|noun', 'left', 0)`,
    );
    await renderApp('/swipe', { ...done, showTutorial: false });

    expect(await screen.findByRole('button', { name: 'Card: casa' })).toBeOnTheScreen();
    expect(screen.getByText('0 / 1')).toBeOnTheScreen();
  });

  test('with every word of the level known, the empty state leads to Settings', async () => {
    await mockDb.execAsync(
      "INSERT INTO swipes (key, direction, at) SELECT key, 'right', 0 FROM vocab.vocabulary WHERE cefr IN ('A1', 'A2')",
    );
    const { router } = await renderApp('/swipe', { ...done, showTutorial: false });

    await fireEvent.press(await screen.findByRole('button', { name: 'Open settings' }));

    expect(router.getPathname()).toBe('/settings');
  });

  test('a word answered Still learning earlier and now known shows the match overlay', async () => {
    await openSwipeWithFirstWordStillLearning();

    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));

    expect(await screen.findByRole('header', { name: "It's a match!" })).toBeOnTheScreen();
  });

  test('answering Still learning again shows no match overlay', async () => {
    await openSwipeWithFirstWordStillLearning();

    await fireEvent.press(screen.getByRole('button', { name: 'Still learning' }));

    await eventually(async () =>
      expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 2 }),
    );
    expect(screen.queryByRole('header', { name: "It's a match!" })).toBeNull();
  });

  test('a word answered on Swipe shows first in Known on the Words tab', async () => {
    await renderApp('/swipe', { ...done, showTutorial: false });
    const card = await screen.findByRole('button', { name: /^Card:/ });
    const lemma = String(card.props.accessibilityLabel).replace('Card: ', '');
    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
    await eventually(async () =>
      expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 1 }),
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Words' }));

    expect(await screen.findByRole('tab', { name: 'Known · 1' })).toBeSelected();
    expect(await screen.findByText(new RegExp(`(^| )${lemma}$`))).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Still learning · 0' }));
    expect(
      await screen.findByText('Words you swipe left on show up here until you know them.'),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Known · 1' }));
    await fireEvent.changeText(screen.getByPlaceholderText('Search Spanish or English'), 'zzz');
    expect(await screen.findByText('No words match your search.')).toBeOnTheScreen();
  });

  test('after a swipe, Progress shows today as played and the word known', async () => {
    await renderApp('/swipe', { ...done, showTutorial: false });
    await screen.findByRole('button', { name: /^Card:/ });
    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
    await eventually(async () =>
      expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 1 }),
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Progress' }));

    expect(await screen.findByText("Today's done. See you tomorrow.")).toBeOnTheScreen();
    expect(screen.getByText('word known')).toBeOnTheScreen();
    expect(screen.getByText(/^1 of /)).toBeOnTheScreen();
  });

  test('a word missed after this batch was dealt shows no match overlay', async () => {
    await renderApp('/swipe', { ...done, showTutorial: false });
    const card = await screen.findByRole('button', { name: /^Card:/ });
    const lemma = String(card.props.accessibilityLabel).replace('Card: ', '');
    const { key } = (await mockDb.getFirstAsync<{ key: string }>(
      'SELECT key FROM vocab.vocabulary WHERE spanish = ? AND cefr IS NOT NULL',
      [lemma],
    ))!;
    // A "Still learning" dated after the deal stands in for a miss in this batch.
    await mockDb.runAsync("INSERT INTO swipes (key, direction, at) VALUES (?, 'left', ?)", [
      key,
      Date.now() + 60_000,
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
    await eventually(async () =>
      expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 2 }),
    );

    expect(screen.queryByRole('header', { name: "It's a match!" })).toBeNull();
  });

  describe('saved batch', () => {
    const swipeRoute = { ...done, showTutorial: false };
    const cardLemma = async () =>
      String(
        (await screen.findByRole('button', { name: /^Card:/ })).props.accessibilityLabel,
      ).replace('Card: ', '');
    const swipesSaved = (n: number) =>
      eventually(async () =>
        expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n }),
      );
    // Answers the card on screen, the `nth` answer logged, and waits until it has flown out and been
    // saved: a press while a card is leaving is ignored.
    const answer = async (name: 'I know it' | 'Still learning', nth: number) => {
      await fireEvent.press(await screen.findByRole('button', { name }));
      await swipesSaved(nth);
    };
    // Closes the app and opens it again on the same databases.
    const restart = async () => {
      await screen.unmount();
      await renderApp('/swipe', swipeRoute);
    };
    // A batch of two easy-to-recognise words, as if dealt earlier.
    const saveTwoWords = () =>
      saveBatch(mockDb, DEFAULT_SETTINGS, { keys: ['casa|noun', 'mesa|noun'], number: 0 });

    test('carries on at the same card after a restart', async () => {
      await renderApp('/swipe', swipeRoute);
      await answer('I know it', 1);
      await answer('Still learning', 2);
      const lemma = await cardLemma();

      await restart();

      expect(await cardLemma()).toBe(lemma);
      expect(screen.getByText('2 / 100')).toBeOnTheScreen();
    });

    test('opens on the summary after a restart there, and continues with the words left', async () => {
      await saveTwoWords();
      await renderApp('/swipe', swipeRoute);
      await answer('Still learning', 1); // casa
      await answer('I know it', 2); // mesa

      await restart();

      await fireEvent.press(
        await screen.findByRole('button', { name: 'Continue with the 1 left' }),
      );
      expect(await cardLemma()).toBe('casa');
      expect(screen.getByText('0 / 1')).toBeOnTheScreen();

      await answer('I know it', 3);
      expect(await screen.findByRole('header', { name: 'Batch learned!' })).toBeOnTheScreen();
      // Missed in this very batch, before the restart: not a match.
      expect(screen.queryByRole('header', { name: "It's a match!" })).toBeNull();
    });

    test('Next batch leaves the missed word behind, under Still learning', async () => {
      await saveTwoWords();
      await renderApp('/swipe', swipeRoute);
      await answer('Still learning', 1); // casa
      await answer('I know it', 2); // mesa
      await fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));

      expect(await screen.findByText('0 / 100')).toBeOnTheScreen();
      const saved = await readBatch(mockDb, DEFAULT_SETTINGS);
      expect(saved?.queue).not.toContain('casa|noun');
      await fireEvent.press(screen.getByRole('tab', { name: 'Words' }));
      expect(await screen.findByRole('tab', { name: 'Still learning · 1' })).toBeOnTheScreen();
    });

    test('shows the full-screen error when the next round cannot be started', async () => {
      await saveTwoWords();
      await renderApp('/swipe', swipeRoute);
      await answer('Still learning', 1);
      await answer('I know it', 2);
      await mockDb.execAsync('DROP TABLE batches');

      await fireEvent.press(screen.getByRole('button', { name: 'Continue with the 1 left' }));

      expect(await screen.findByText('Something went wrong')).toBeOnTheScreen();
    });

    test('changing the level and back returns to the same place', async () => {
      await renderApp('/swipe', swipeRoute);
      await answer('I know it', 1);
      const lemma = await cardLemma();

      for (const [level, line] of [
        [/^Intermediate/, /^Intermediate · /],
        [/^Beginner/, /^Beginner · /],
      ]) {
        await fireEvent.press(screen.getByRole('tab', { name: 'Settings' }));
        await fireEvent.press(await screen.findByRole('radio', { name: level }));
        await fireEvent.press(screen.getByRole('tab', { name: 'Swipe' }));
        expect(await screen.findByText(line)).toBeOnTheScreen();
      }

      expect(await cardLemma()).toBe(lemma);
      expect(screen.getByText('1 / 100')).toBeOnTheScreen();
    });
  });

  describe('Settings tab', () => {
    const openSettingsFromSwipe = async () => {
      const app = await renderApp('/swipe', { ...done, showTutorial: false });
      await screen.findByRole('button', { name: /^Card:/ });
      await fireEvent.press(screen.getByRole('tab', { name: 'Settings' }));
      return app;
    };

    test('a new level is saved and the Swipe tab deals for it', async () => {
      await openSettingsFromSwipe();

      await fireEvent.press(await screen.findByRole('radio', { name: /^Intermediate/ }));
      await fireEvent.press(screen.getByRole('switch', { name: 'Include lower levels' }));
      await eventually(async () =>
        expect(await getSettings(mockDb)).toEqual(
          expect.objectContaining({ level: 'intermediate', includeLower: false }),
        ),
      );
      await fireEvent.press(screen.getByRole('tab', { name: 'Swipe' }));

      expect(await screen.findByText(/^Intermediate · /)).toBeOnTheScreen();
      // The cards are dealt for the new settings too (B1 only), not just the header.
      expect(await screen.findByText('B1')).toBeOnTheScreen();
    });

    test('choosing Български switches the app at once and keeps the batch', async () => {
      await renderApp('/swipe', { ...done, showTutorial: false });
      await screen.findByRole('button', { name: /^Card:/ });
      await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
      expect(await screen.findByText(/^1 \/ /)).toBeOnTheScreen();
      const lemma = String(
        screen.getByRole('button', { name: /^Card:/ }).props.accessibilityLabel,
      ).replace('Card: ', '');
      await fireEvent.press(screen.getByRole('tab', { name: 'Settings' }));

      await fireEvent.press(await screen.findByRole('radio', { name: 'Български' }));

      expect(screen.getByRole('header', { name: 'Настройки' })).toBeOnTheScreen();
      await fireEvent.press(screen.getByRole('tab', { name: 'Карти' }));
      expect(await screen.findByText('Начинаещ · A1, A2')).toBeOnTheScreen();
      // Same batch, same card: a language change deals nothing new.
      expect(screen.getByText(/^1 \/ /)).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: `Карта: ${lemma}` })).toBeOnTheScreen();
      expect(await AsyncStorage.getItem('language')).toBe('bg');
    });

    test('choosing Verbs makes the Swipe tab deal verbs', async () => {
      await openSettingsFromSwipe();

      await fireEvent.press(await screen.findByRole('radio', { name: /^Verbs/ }));
      await eventually(async () => expect((await getSettings(mockDb)).wordType).toBe('verb'));
      await fireEvent.press(screen.getByRole('tab', { name: 'Swipe' }));

      expect(await screen.findByText('Beginner · A1, A2 · Verbs')).toBeOnTheScreen();
      const card = await screen.findByRole('button', { name: /^Card:/ });
      const lemma = String(card.props.accessibilityLabel).replace('Card: ', '');
      const row = await mockDb.getFirstAsync<{ part_of_speech: string }>(
        "SELECT part_of_speech FROM vocab.vocabulary WHERE spanish = ? AND part_of_speech = 'verb'",
        [lemma],
      );
      expect(row).toEqual({ part_of_speech: 'verb' });
    });

    test('Reset progress clears the swipe log and keeps the settings', async () => {
      await renderApp('/swipe', { ...done, showTutorial: false });
      await screen.findByRole('button', { name: /^Card:/ });
      await fireEvent.press(screen.getByRole('button', { name: 'I know it' }));
      await eventually(async () =>
        expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 1 }),
      );
      await fireEvent.press(screen.getByRole('tab', { name: 'Settings' }));

      await fireEvent.press(await screen.findByRole('button', { name: 'Reset progress' }));
      await fireEvent.press(screen.getByRole('button', { name: 'Tap again to reset' }));

      expect(await screen.findByText('Progress reset')).toBeOnTheScreen();
      expect(await mockDb.getFirstAsync('SELECT count(*) AS n FROM swipes')).toEqual({ n: 0 });
      expect((await getSettings(mockDb)).level).toBe('beginner');
      await fireEvent.press(screen.getByRole('tab', { name: 'Swipe' }));
      expect(await screen.findByText('0 / 100')).toBeOnTheScreen();
    });

    test('a tutorial choice made in the tutorial shows back in Settings', async () => {
      await renderApp('/settings', { ...done, showTutorial: true });
      await act(async () => {}); // settings loaded
      await fireEvent.press(screen.getByRole('button', { name: 'View tutorial now' }));
      await act(async () => {}); // tutorial prefs loaded
      await fireEvent.press(
        screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Start swiping' }));
      await fireEvent.press(screen.getByRole('tab', { name: 'Settings' }));

      expect(
        await screen.findByRole('switch', { name: 'Show tutorial at start' }),
      ).not.toBeChecked();
    });

    test('the username and tutorial choice are saved, and the tutorial opens with them', async () => {
      await AsyncStorage.setItem('username', 'Ana');
      const { router } = await renderApp('/settings', { ...done, showTutorial: true });

      const field = await screen.findByPlaceholderText('Username');
      await fireEvent.changeText(field, 'Bea');
      await fireEvent(field, 'submitEditing');
      await fireEvent.press(screen.getByRole('switch', { name: 'Show tutorial at start' }));
      // Navigate before any waitFor: under renderRouter's fake timers, a waitFor leaves the router
      // ignoring later pushes (see CLAUDE.md).
      await fireEvent.press(screen.getByRole('button', { name: 'View tutorial now' }));

      expect(router.getPathname()).toBe('/tutorial');
      expect(await screen.findByText('Hola, Bea')).toBeOnTheScreen();
      expect(await AsyncStorage.getItem('username')).toBe('Bea');
      expect(await AsyncStorage.getItem('showTutorial')).toBe('false');
      expect(
        screen.getByRole('checkbox', { name: 'Show this screen when the app starts' }),
      ).not.toBeChecked();
    });
  });
});
