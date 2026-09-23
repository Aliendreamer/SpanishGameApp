import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/theme';

describe('<PrimaryButton />', () => {
  test('is an accessible button with its label', async () => {
    await render(<PrimaryButton label="Get started" onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Get started' })).toBeOnTheScreen();
  });

  test('dimmed shows the button at half opacity but keeps it pressable', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Continue" onPress={onPress} dimmed />);

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toHaveStyle({ opacity: 0.5 });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('the light tone is cream with a rose label, for rose backgrounds', async () => {
    await render(<PrimaryButton label="Keep swiping" tone="light" onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Keep swiping' })).toHaveStyle({
      backgroundColor: colors.surface,
    });
    expect(screen.getByText('Keep swiping')).toHaveStyle({ color: colors.rose });
  });

  test('calls onPress once when tapped', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Get started" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
