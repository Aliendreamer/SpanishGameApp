import { useFonts } from '@expo-google-fonts/bricolage-grotesque';
import { act, render, screen } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '@/app/_layout';
import { getLaunchPrefs, type LaunchPrefs } from '@/storage/prefs';
import { migrate } from '@/storage/progress-db';

jest.mock('@expo-google-fonts/bricolage-grotesque', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/storage/prefs', () => ({
  ...jest.requireActual('@/storage/prefs'),
  getLaunchPrefs: jest.fn(),
}));
// The app's Stack stands in as text that also shows the launch prefs it can see.
jest.mock('expo-router', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  const { useContext } = jest.requireActual('react');
  const { LaunchContext } = jest.requireActual('@/launch');
  return {
    Stack: () => {
      const { username } = useContext(LaunchContext);
      return <MockText>{`stack for ${username}`}</MockText>;
    },
  };
});

// Records the provider's props and renders its children, as the real one does once onInit is
// done; with mockInitError set it reports that error through onError instead, like a failed init.
const mockProviderProps: Record<string, unknown>[] = [];
let mockInitError: Error | null = null;
jest.mock('expo-sqlite', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    SQLiteProvider: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      onError?: (error: Error) => void;
    }) => {
      mockProviderProps.push(props);
      useEffect(() => {
        if (mockInitError) props.onError?.(mockInitError);
      }, [props]);
      return mockInitError ? null : children;
    },
  };
});

const mockUseFonts = jest.mocked(useFonts);
const mockGetLaunchPrefs = jest.mocked(getLaunchPrefs);
const ana: LaunchPrefs = { username: 'Ana', onboardingDone: true, showTutorial: true };

describe('<RootLayout />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProviderProps.length = 0;
    mockInitError = null;
    mockGetLaunchPrefs.mockResolvedValue(ana);
  });

  test('keeps the splash screen up while the fonts load', async () => {
    mockUseFonts.mockReturnValue([false, null]);

    await render(<RootLayout />);

    expect(screen.queryByText(/^stack/)).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  test('keeps the splash screen up until the launch prefs are read, then shares them', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    let finish = (_prefs: LaunchPrefs) => {};
    mockGetLaunchPrefs.mockReturnValue(new Promise((resolve) => (finish = resolve)));

    await render(<RootLayout />);
    expect(screen.queryByText(/^stack/)).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    await act(async () => finish(ana));

    expect(screen.getByText('stack for Ana')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  test('falls back to first-launch prefs if they cannot be read', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    mockGetLaunchPrefs.mockRejectedValue(new Error('storage broken'));

    await render(<RootLayout />);

    expect(await screen.findByText('stack for null')).toBeOnTheScreen();
  });

  test('still shows the app if the fonts fail to load', async () => {
    mockUseFonts.mockReturnValue([false, new Error('font failed')]);

    await render(<RootLayout />);

    expect(await screen.findByText('stack for Ana')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  test('opens progress.db and migrates it before showing the app', async () => {
    mockUseFonts.mockReturnValue([true, null]);

    await render(<RootLayout />);

    expect(await screen.findByText('stack for Ana')).toBeOnTheScreen();
    expect(mockProviderProps.at(-1)).toEqual(
      expect.objectContaining({ databaseName: 'progress.db', onInit: migrate }),
    );
  });

  test('shows a full-screen error and hides the splash if progress.db cannot be opened', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    mockInitError = new Error('disk full');

    await render(<RootLayout />);

    expect(await screen.findByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.queryByText(/^stack/)).toBeNull();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
