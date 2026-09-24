import { render, screen } from '@testing-library/react-native';

import { InBulgarian } from '@/i18n/testing';
import { Progress } from '@/screens/progress';

const byLevel = [
  { level: 'A1', known: 1, total: 402 },
  { level: 'A2', known: 0, total: 740 },
  { level: 'B1', known: 0, total: 1316 },
  { level: 'B2', known: 0, total: 1603 },
];

async function renderProgress(doneToday = true) {
  await render(
    <Progress
      streak={3}
      week={[true, true, doneToday, false, false, false, false]}
      doneToday={doneToday}
      swipesToday={5}
      wordsKnown={1}
      byLevel={byLevel}
    />,
  );
}

describe('<Progress />', () => {
  test('shows the streak, the week, and the note for a day already played', async () => {
    await renderProgress();

    expect(screen.getByRole('header', { name: 'Progress' })).toBeOnTheScreen();
    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByText('day streak')).toBeOnTheScreen();
    expect(screen.getByLabelText('Wednesday: played')).toBeOnTheScreen();
    expect(screen.getByLabelText('Thursday: not played')).toBeOnTheScreen();
    expect(screen.getByText("Today's done. See you tomorrow.")).toBeOnTheScreen();
  });

  test('nudges when today has no swipe yet', async () => {
    await renderProgress(false);

    expect(screen.getByText('Swipe one card today to keep your streak.')).toBeOnTheScreen();
  });

  test('shows the tiles and the known words per level', async () => {
    await renderProgress();

    expect(screen.getByText('5')).toBeOnTheScreen();
    expect(screen.getByText('swipes today')).toBeOnTheScreen();
    expect(screen.getByText('word known')).toBeOnTheScreen();
    expect(screen.getByText('Known by level')).toBeOnTheScreen();
    expect(screen.getByText('1 of 402')).toBeOnTheScreen();
    expect(screen.getByText('0 of 1,603')).toBeOnTheScreen();
    expect(screen.getByLabelText('A1 known')).toHaveAccessibilityValue({ now: 1, max: 402 });
  });

  test('shows its text in Bulgarian, with Bulgarian plurals', async () => {
    await render(
      <Progress
        streak={1}
        week={[true, false, false, false, false, false, false]}
        doneToday={false}
        swipesToday={5}
        wordsKnown={1}
        byLevel={byLevel}
      />,
      { wrapper: InBulgarian },
    );

    expect(screen.getByRole('header', { name: 'Напредък' })).toBeOnTheScreen();
    expect(screen.getByText('ден поред')).toBeOnTheScreen();
    expect(screen.getByLabelText('Понеделник: играно')).toBeOnTheScreen();
    expect(screen.getByLabelText('Неделя: неиграно')).toBeOnTheScreen();
    expect(screen.getAllByText('П')).toHaveLength(2);
    expect(
      screen.getByText('Плъзни поне една карта днес, за да запазиш поредицата.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('плъзгания днес')).toBeOnTheScreen();
    expect(screen.getByText('позната дума')).toBeOnTheScreen();
    expect(screen.getByText('Познати по ниво')).toBeOnTheScreen();
    expect(screen.getByText('1 от 402')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'A1 познати' })).toBeOnTheScreen();
  });
});
