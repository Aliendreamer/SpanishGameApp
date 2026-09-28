import { fireEvent, render, screen } from '@testing-library/react-native';

import { SecondaryButton } from '@/components/secondary-button';

describe('<SecondaryButton />', () => {
  test('is a button with its label that calls onPress', async () => {
    const onPress = jest.fn();
    await render(<SecondaryButton label="Still learning" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Still learning' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('with an icon, shows just the icon and is still named by its label', async () => {
    const onPress = jest.fn();
    await render(<SecondaryButton icon="↻" label="Show meaning" onPress={onPress} />);

    expect(screen.getByText('↻')).toBeOnTheScreen();
    expect(screen.queryByText('Show meaning')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Show meaning' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
