import { fireEvent, render, screen } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
import { Settings } from '@/screens/settings';
import type { Settings as GameSettings } from '@/storage/progress-db';

const saved: GameSettings = {
  level: 'advanced',
  includeLower: false,
  includeKnown: false,
  wordType: 'all',
};

async function renderSettings(settings = saved, language: 'en' | 'bg' = 'en') {
  const handlers = {
    onLanguageChange: jest.fn(),
    onSaveUsername: jest.fn(),
    onShowTutorialChange: jest.fn(),
    onViewTutorial: jest.fn(),
    onSettingsChange: jest.fn(),
    onResetProgress: jest.fn(async () => {}),
  };
  await render(
    <Settings language={language} username="Ana" showTutorial settings={settings} {...handlers} />,
    { wrapper: language === 'bg' ? InBulgarian : undefined },
  );
  return handlers;
}
const field = () => screen.getByPlaceholderText('Username');
const toggle = (name: string) => screen.getByRole('switch', { name });

describe('<Settings />', () => {
  test('shows the saved values', async () => {
    await renderSettings();

    expect(screen.getByRole('header', { name: 'Settings' })).toBeOnTheScreen();
    expect(field().props.value).toBe('Ana');
    expect(screen.getByText('Saved on this phone')).toBeOnTheScreen();
    expect(toggle('Show tutorial at start')).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Advanced/ })).toBeChecked();
    expect(toggle('Include lower levels')).not.toBeChecked();
    expect(toggle('Include known words')).not.toBeChecked();
  });

  test('saves a valid username on Enter, trimmed', async () => {
    const { onSaveUsername } = await renderSettings();

    await fireEvent.changeText(field(), '  Bea ');
    await fireEvent(field(), 'submitEditing');

    expect(onSaveUsername).toHaveBeenCalledWith('Bea');
  });

  test('does not save an invalid username, and says why', async () => {
    const { onSaveUsername } = await renderSettings();

    await fireEvent.changeText(field(), 'a');
    await fireEvent(field(), 'blur');

    expect(screen.getByText('Use 2–20 characters')).toBeOnTheScreen();
    expect(onSaveUsername).not.toHaveBeenCalled();
  });

  test('the tutorial switch and link', async () => {
    const { onShowTutorialChange, onViewTutorial } = await renderSettings();

    await fireEvent.press(toggle('Show tutorial at start'));
    await fireEvent.press(screen.getByRole('button', { name: 'View tutorial now' }));

    expect(onShowTutorialChange).toHaveBeenCalledWith(false);
    expect(toggle('Show tutorial at start')).not.toBeChecked();
    expect(onViewTutorial).toHaveBeenCalledTimes(1);
  });

  test('choosing a level or a batch option saves it', async () => {
    const { onSettingsChange } = await renderSettings();

    await fireEvent.press(screen.getByRole('radio', { name: /^Intermediate/ }));
    await fireEvent.press(toggle('Include known words'));

    expect(onSettingsChange).toHaveBeenCalledWith({ level: 'intermediate' });
    expect(onSettingsChange).toHaveBeenCalledWith({ includeKnown: true });
    expect(screen.getByRole('radio', { name: /^Intermediate/ })).toBeChecked();
    expect(toggle('Include known words')).toBeChecked();
  });

  test('the word type section offers all words and the three groups, and saves a choice', async () => {
    const { onSettingsChange } = await renderSettings();

    expect(screen.getByRole('header', { name: 'Word type' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: /^All words/ })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: /^Verbs/ }));

    expect(onSettingsChange).toHaveBeenCalledWith({ wordType: 'verb' });
    expect(screen.getByRole('radio', { name: /^Verbs/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Nouns/ })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: /^Adjectives/ })).toBeOnTheScreen();
  });

  test('"Include lower levels" is disabled for Full', async () => {
    await renderSettings({ ...saved, level: 'full' });

    expect(toggle('Include lower levels')).toBeDisabled();
    expect(screen.getByText('Not used with Full')).toBeOnTheScreen();
  });

  test('Credits opens the credits sheet', async () => {
    await renderSettings();

    await fireEvent.press(screen.getByRole('button', { name: 'Credits' }));

    expect(screen.getByText(/Wiktionary via Doozan/)).toBeOnTheScreen();
  });

  test('Reset progress needs a second tap, then confirms', async () => {
    const { onResetProgress } = await renderSettings();

    await fireEvent.press(screen.getByRole('button', { name: 'Reset progress' }));
    expect(onResetProgress).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Tap again to reset' }));

    expect(onResetProgress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Progress reset')).toBeOnTheScreen();
  });

  test('a failed reset says so, and the next tap tries again', async () => {
    const handlers = await renderSettings();
    handlers.onResetProgress.mockRejectedValueOnce(new Error('locked'));

    await fireEvent.press(screen.getByRole('button', { name: 'Reset progress' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Tap again to reset' }));
    expect(
      screen.getByRole('button', { name: 'Reset failed. Tap to try again' }),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Reset failed. Tap to try again' }));

    expect(handlers.onResetProgress).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Progress reset')).toBeOnTheScreen();
  });

  test('the language section comes first, with the current language selected', async () => {
    const { onLanguageChange } = await renderSettings();

    expect(
      screen
        .getAllByRole('header')
        .map((header) => header.props.accessibilityLabel ?? header.props.children),
    ).toEqual([
      'Settings',
      'Language',
      'Profile',
      'Tutorial',
      'Level',
      'Word type',
      'Batch',
      'About',
    ]);
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Български' })).not.toBeChecked();

    await fireEvent.press(screen.getByRole('radio', { name: 'Български' }));

    expect(onLanguageChange).toHaveBeenCalledWith('bg');
  });

  test('shows its text in Bulgarian, with English still named in English', async () => {
    const { onLanguageChange } = await renderSettings({ ...saved, level: 'full' }, 'bg');

    expect(screen.getByRole('header', { name: 'Настройки' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Език' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Български' })).toBeChecked();
    expect(screen.getByPlaceholderText('Потребителско име')).toBeOnTheScreen();
    expect(screen.getByText('Запазено на този телефон')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Показвай обучението при старт' })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Пълен, Всичко · 19\s171 думи$/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Глаголи/ })).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Включи по-ниските нива' })).toBeDisabled();
    expect(screen.getByText('Не важи за „Пълен“')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Източници' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Нулирай напредъка' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));

    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });
});
