import { render, screen } from '@testing-library/react-native';

import { LevelPlaceholder } from '@/screens/level-placeholder';

describe('<LevelPlaceholder />', () => {
  test('says the level step comes next', async () => {
    await render(<LevelPlaceholder />);

    expect(screen.getByText('Level — coming next')).toBeOnTheScreen();
  });
});
