import { render, screen } from '@testing-library/react-native';

import { SwipePlaceholder } from '@/screens/swipe-placeholder';

describe('<SwipePlaceholder />', () => {
  test('says the swipe deck comes next', async () => {
    await render(<SwipePlaceholder />);

    expect(screen.getByText('Swipe — coming next')).toBeOnTheScreen();
  });
});
