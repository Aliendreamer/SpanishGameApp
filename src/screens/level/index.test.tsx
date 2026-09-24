import { fireEvent, render, screen } from '@testing-library/react-native';

import { type LevelChoice, LevelPicker } from '@/screens/level';
import { InBulgarian } from '@/i18n/testing';

const beginnerWithLower: LevelChoice = { level: 'beginner', includeLower: true };

async function renderPicker(initial = beginnerWithLower) {
  const onContinue = jest.fn();
  await render(<LevelPicker initial={initial} onContinue={onContinue} />);
  return { onContinue };
}

const radio = (name: string) => screen.getByRole('radio', { name: new RegExp(`^${name}`) });
const lowerLevels = () => screen.getByRole('checkbox', { name: 'Include lower levels' });

describe('<LevelPicker />', () => {
  test('shows the title, body, and the four levels with their word counts', async () => {
    await renderPicker();

    expect(screen.getByText('Pick your level')).toBeOnTheScreen();
    expect(screen.getByText('You can change this any time in Settings.')).toBeOnTheScreen();
    expect(screen.getByText('A1 + A2 · 1,142 words')).toBeOnTheScreen();
    expect(screen.getByText('Everything · 19,171 words')).toBeOnTheScreen();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  test('opens on the initial choice', async () => {
    await renderPicker({ level: 'advanced', includeLower: false });

    expect(radio('Advanced')).toBeChecked();
    expect(radio('Beginner')).not.toBeChecked();
    expect(lowerLevels()).not.toBeChecked();
  });

  test('selecting a level checks it and unchecks the others', async () => {
    await renderPicker();

    await fireEvent.press(radio('Intermediate'));

    expect(radio('Intermediate')).toBeChecked();
    expect(radio('Beginner')).not.toBeChecked();
  });

  test('the checkbox toggles, and is disabled while Full is selected', async () => {
    await renderPicker();

    await fireEvent.press(lowerLevels());
    expect(lowerLevels()).not.toBeChecked();

    await fireEvent.press(radio('Full'));
    expect(lowerLevels()).toBeDisabled();
  });

  test('Continue returns the chosen level and checkbox', async () => {
    const { onContinue } = await renderPicker();

    await fireEvent.press(radio('Intermediate'));
    await fireEvent.press(lowerLevels());
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onContinue).toHaveBeenCalledWith({ level: 'intermediate', includeLower: false });
  });

  test('shows its text and levels in Bulgarian', async () => {
    await render(<LevelPicker initial={beginnerWithLower} onContinue={() => {}} />, {
      wrapper: InBulgarian,
    });

    expect(screen.getByText('Избери ниво')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Начинаещ, A1 + A2 · 1142 думи' })).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Включи по-ниските нива' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Продължи' })).toBeOnTheScreen();
  });
});
