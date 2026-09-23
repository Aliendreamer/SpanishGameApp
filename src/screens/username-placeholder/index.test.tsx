import { render, screen } from '@testing-library/react-native';

import { UsernamePlaceholder } from '@/screens/username-placeholder';

describe('<UsernamePlaceholder />', () => {
  test('says the username step comes next', async () => {
    await render(<UsernamePlaceholder />);

    expect(screen.getByText('Username — coming next')).toBeOnTheScreen();
  });
});
