import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyDeck } from '@/screens/swipe/empty';
import { BatchSummary } from '@/screens/swipe/summary';

describe('<BatchSummary />', () => {
  test('shows the batch size and both tallies, and wires both buttons', async () => {
    const onContinue = jest.fn();
    const onOpenSettings = jest.fn();
    await render(
      <BatchSummary
        summary={{ size: 3, firstTry: 2, fewTries: 1 }}
        onContinue={onContinue}
        onOpenSettings={onOpenSettings}
      />,
    );

    expect(screen.getByRole('header', { name: 'Batch done' })).toBeOnTheScreen();
    expect(screen.getByText('You know all 3 words in this batch.')).toBeOnTheScreen();
    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByText('known on the first swipe')).toBeOnTheScreen();
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('took a few tries')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue with the next batch' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Change settings' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});

describe('<EmptyDeck />', () => {
  test('explains why there is nothing to swipe and offers the settings', async () => {
    const onOpenSettings = jest.fn();
    await render(<EmptyDeck onOpenSettings={onOpenSettings} />);

    expect(screen.getByRole('header', { name: 'No words match your settings' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        'You already know every word at this level. Try another level, or include known words.',
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
