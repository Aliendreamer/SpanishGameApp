import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '@/components/primary-button';

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

  test('calls onPress once when tapped', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Get started" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
