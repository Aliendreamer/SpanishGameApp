import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '@/components/primary-button';

describe('<PrimaryButton />', () => {
  test('is an accessible button with its label', async () => {
    await render(<PrimaryButton label="Get started" onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Get started' })).toBeOnTheScreen();
  });

  test('calls onPress once when tapped', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Get started" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
