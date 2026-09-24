import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { LanguageProvider, useLanguage, useT } from '@/i18n';

function Probe() {
  const t = useT();
  const { language, setLanguage } = useLanguage();
  return (
    <Pressable accessibilityRole="button" onPress={() => setLanguage('bg')}>
      <Text>{`${language}: ${t.tabs.settings}`}</Text>
    </Pressable>
  );
}

describe('interface language', () => {
  beforeEach(() => AsyncStorage.clear());

  test('is English without a provider', async () => {
    await render(<Probe />);

    expect(screen.getByText('en: Settings')).toBeOnTheScreen();
  });

  test('starts in the language the provider was given', async () => {
    await render(
      <LanguageProvider initial="bg">
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByText('bg: Настройки')).toBeOnTheScreen();
  });

  test('switches at once and saves the choice', async () => {
    await render(
      <LanguageProvider initial="en">
        <Probe />
      </LanguageProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByText('bg: Настройки')).toBeOnTheScreen();
    expect(await AsyncStorage.getItem('language')).toBe('bg');
  });
});
