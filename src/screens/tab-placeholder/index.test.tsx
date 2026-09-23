import { render, screen } from '@testing-library/react-native';

import { TabPlaceholder } from '@/screens/tab-placeholder';

describe('<TabPlaceholder />', () => {
  test('names the tab that comes next', async () => {
    await render(<TabPlaceholder title="Progress" />);

    expect(screen.getByText('Progress — coming next')).toBeOnTheScreen();
  });
});
