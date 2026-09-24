import { fireEvent, render, screen } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
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
        "You've already swiped every word for these settings. Try another level or word type, or include known words.",
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});

describe('summary and empty state in Bulgarian', () => {
  test('the summary counts in Bulgarian', async () => {
    await render(
      <BatchSummary
        summary={{ size: 1, known: 0, learning: 1 }}
        onNext={jest.fn()}
        onPractise={jest.fn()}
        onOpenSettings={jest.fn()}
      />,
      { wrapper: InBulgarian },
    );

    expect(screen.getByRole('header', { name: 'Серията е готова' })).toBeOnTheScreen();
    expect(screen.getByText('Знаеш 0 от 1 дума в тази серия.')).toBeOnTheScreen();
    expect(screen.getByText('познати')).toBeOnTheScreen();
    expect(screen.getByText('за учене')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Следваща серия' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Упражни думите за учене (1)' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Промени настройките' })).toBeOnTheScreen();
  });

  test('the empty state', async () => {
    await render(<EmptyDeck onOpenSettings={jest.fn()} />, { wrapper: InBulgarian });

    expect(screen.getByRole('header', { name: 'Няма думи за тези настройки' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Отвори настройките' })).toBeOnTheScreen();
  });
});
