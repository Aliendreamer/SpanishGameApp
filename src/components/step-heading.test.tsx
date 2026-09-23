import { render, screen } from '@testing-library/react-native';

import { StepHeading } from '@/components/step-heading';

describe('<StepHeading />', () => {
  test('shows the title as a header, with an optional body', async () => {
    await render(<StepHeading title="Pick your level" body="You can change this any time." />);

    expect(screen.getByRole('header', { name: 'Pick your level' })).toBeOnTheScreen();
    expect(screen.getByText('You can change this any time.')).toBeOnTheScreen();
  });

  test('can show a greeting above the title and no body', async () => {
    await render(<StepHeading greeting="Hola, Ana" title="How it works" />);

    expect(screen.getByText('Hola, Ana')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'How it works' })).toBeOnTheScreen();
  });
});
