import { fireEvent, render, screen } from '@testing-library/react-native';

import { Welcome } from '@/screens/welcome';

describe('<Welcome />', () => {
  test('shows the hero card, the title, and the body', async () => {
    await render(<Welcome onGetStarted={() => {}} />);

    expect(screen.getByText('hola')).toBeOnTheScreen();
    expect(screen.getByText('Learn Spanish one swipe at a time')).toBeOnTheScreen();
    expect(
      screen.getByText('See a Spanish word, tap for the English meaning, and swipe to sort it.'),
    ).toBeOnTheScreen();
  });

  test('calls onGetStarted when "Get started" is tapped', async () => {
    const onGetStarted = jest.fn();
    await render(<Welcome onGetStarted={onGetStarted} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });
});
