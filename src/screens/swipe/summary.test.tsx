import { act, fireEvent, render, screen, within } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
import { EmptyDeck } from '@/screens/swipe/empty';
import { BatchSummary } from '@/screens/swipe/summary';

describe('<BatchSummary />', () => {
  const renderSummary = async (learning: number, onContinue = jest.fn()) => {
    const handlers = { onNext: jest.fn(), onContinue, onOpenSettings: jest.fn() };
    await render(
      <BatchSummary summary={{ size: 3, known: 3 - learning, learning }} {...handlers} />,
    );
    return handlers;
  };
  const labels = () =>
    screen
      .getAllByRole('button')
      .map((button) => within(button).getByText(/./).props.children as string);

  test('with words left, continuing comes first and every choice is wired', async () => {
    const { onNext, onContinue, onOpenSettings } = await renderSummary(1);

    expect(screen.getByRole('header', { name: 'Round done' })).toBeOnTheScreen();
    expect(screen.getByText('You know 2 of 3 words in this batch.')).toBeOnTheScreen();
    expect(screen.getByText('known')).toBeOnTheScreen();
    expect(screen.getByText('still learning')).toBeOnTheScreen();
    expect(labels()).toEqual(['Continue with the 1 left', 'Next batch', 'Change settings']);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue with the 1 left' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Change settings' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  test('with every word learned, says so and offers the next batch', async () => {
    const { onNext } = await renderSummary(0);

    expect(screen.getByRole('header', { name: 'Batch learned!' })).toBeOnTheScreen();
    expect(screen.getByText('You know 3 of 3 words in this batch.')).toBeOnTheScreen();
    expect(labels()).toEqual(['Next batch', 'Change settings']);

    await fireEvent.press(screen.getByRole('button', { name: 'Next batch' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  test('while one choice is under way, a second press of either does nothing', async () => {
    let finish = () => {};
    const { onNext, onContinue } = await renderSummary(
      1,
      jest.fn(() => new Promise<void>((resolve) => (finish = resolve))),
    );

    // Pressed directly, in one act(): fireEvent.press waits for its handler, so it can't press again
    // while the first is under way.
    const press = (name: string) => screen.getByRole('button', { name }).props.onClick({});
    await act(async () => {
      press('Continue with the 1 left');
      press('Continue with the 1 left');
      press('Next batch');
      finish();
    });

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
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
        onContinue={jest.fn()}
        onOpenSettings={jest.fn()}
      />,
      { wrapper: InBulgarian },
    );

    expect(screen.getByRole('header', { name: 'Кръгът е готов' })).toBeOnTheScreen();
    expect(screen.getByText('Знаеш 0 от 1 дума в тази серия.')).toBeOnTheScreen();
    expect(screen.getByText('познати')).toBeOnTheScreen();
    expect(screen.getByText('за учене')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Следваща серия' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Продължи с останалите (1)' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Промени настройките' })).toBeOnTheScreen();
  });

  test('the empty state', async () => {
    await render(<EmptyDeck onOpenSettings={jest.fn()} />, { wrapper: InBulgarian });

    expect(screen.getByRole('header', { name: 'Няма думи за тези настройки' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Отвори настройките' })).toBeOnTheScreen();
  });
});
