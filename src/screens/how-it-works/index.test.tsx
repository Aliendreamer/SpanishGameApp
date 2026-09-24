import { fireEvent, render, screen } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
import { HowItWorks } from '@/screens/how-it-works';

const tutorialBox = () =>
  screen.getByRole('checkbox', { name: 'Show this screen when the app starts' });

describe('<HowItWorks />', () => {
  test('explains tapping and both swipe directions', async () => {
    await render(<HowItWorks initialShowTutorial onStart={() => {}} />);

    expect(screen.getByRole('header', { name: 'How it works' })).toBeOnTheScreen();
    expect(screen.getByText('Tap the card')).toBeOnTheScreen();
    expect(
      screen.getByText('It flips to show the English meaning and an example.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Swipe right if you know it')).toBeOnTheScreen();
    expect(screen.getByText('The word leaves this batch.')).toBeOnTheScreen();
    expect(screen.getByText("Swipe left if you're still learning")).toBeOnTheScreen();
    expect(screen.getByText('You can practise it at the end of the batch.')).toBeOnTheScreen();
  });

  test('shows the greeting only when given one', async () => {
    await render(<HowItWorks greeting="Hola, Ana" initialShowTutorial onStart={() => {}} />);

    expect(screen.getByText('Hola, Ana')).toBeOnTheScreen();
  });

  test('the checkbox opens on the saved value', async () => {
    await render(<HowItWorks initialShowTutorial={false} onStart={() => {}} />);

    expect(tutorialBox()).not.toBeChecked();
  });

  test('Start swiping passes the checkbox value', async () => {
    const onStart = jest.fn();
    await render(<HowItWorks initialShowTutorial onStart={onStart} />);

    await fireEvent.press(tutorialBox());
    await fireEvent.press(screen.getByRole('button', { name: 'Start swiping' }));

    expect(onStart).toHaveBeenCalledWith(false);
  });

  test('shows its text in Bulgarian', async () => {
    await render(<HowItWorks initialShowTutorial onStart={() => {}} />, { wrapper: InBulgarian });

    expect(screen.getByText('Как работи')).toBeOnTheScreen();
    expect(screen.getByText('Плъзни наляво, ако още я учиш')).toBeOnTheScreen();
    expect(screen.getByText('Можеш да я упражниш в края на серията.')).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', { name: 'Показвай този екран при стартиране' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Започни да плъзгаш' })).toBeOnTheScreen();
  });
});
