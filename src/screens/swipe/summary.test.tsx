import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyDeck } from '@/screens/swipe/empty';
import { BatchSummary } from '@/screens/swipe/summary';

describe('<BatchSummary />', () => {
  const renderSummary = async (learning: number) => {
    const handlers = { onNext: jest.fn(), onPractise: jest.fn(), onOpenSettings: jest.fn() };
    await render(
      <BatchSummary summary={{ size: 3, known: 3 - learning, learning }} {...handlers} />,
    );
    return handlers;
  };

  test('shows how many words are known and still learning, and wires every choice', async () => {
    const { onNext, onPractise, onOpenSettings } = await renderSummary(1);

    expect(screen.getByRole('header', { name: 'Batch done' })).toBeOnTheScreen();
    expect(screen.getByText('You know 2 of 3 words in this batch.')).toBeOnTheScreen();
    expect(screen.getByText('known')).toBeOnTheScreen();
    expect(screen.getByText('still learning')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Practise the 1 still learning' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Change settings' }));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPractise).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  test('offers no practise round when every word is known', async () => {
    await renderSummary(0);

    expect(screen.getByText('You know 3 of 3 words in this batch.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /^Practise/ })).toBeNull();
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
