import { render, screen } from '@testing-library/react-native';

import { ProgressRing } from '@/components/progress-ring';

describe('<ProgressRing />', () => {
  test('exposes its progress to accessibility', async () => {
    await render(<ProgressRing value={2} max={100} />);

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 100, now: 2 });
  });
});
