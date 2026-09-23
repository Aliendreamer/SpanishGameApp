import { render, screen } from '@testing-library/react-native';

import { StepDots } from '@/components/step-dots';
import { colors } from '@/theme';

describe('<StepDots />', () => {
  test('announces the current step', async () => {
    await render(<StepDots count={4} active={0} />);

    expect(screen.getByLabelText('Step 1 of 4')).toBeOnTheScreen();
  });

  test('widens the active dot and colours done and active dots rose', async () => {
    await render(<StepDots count={4} active={1} />);

    const dots = screen.getAllByTestId('step-dot');
    expect(dots).toHaveLength(4);
    expect(dots[0]).toHaveStyle({ width: 8, backgroundColor: colors.rose });
    expect(dots[1]).toHaveStyle({ width: 28, backgroundColor: colors.rose });
    expect(dots[2]).toHaveStyle({ width: 8, backgroundColor: colors.track });
    expect(dots[3]).toHaveStyle({ width: 8, backgroundColor: colors.track });
  });
});
