import { fireEvent, render, screen } from '@testing-library/react-native';

import { SecondaryButton } from '@/components/secondary-button';

describe('<SecondaryButton />', () => {
  test('is a button with its label that calls onPress', async () => {
    const onPress = jest.fn();
    await render(<SecondaryButton label="Still learning" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Still learning' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
