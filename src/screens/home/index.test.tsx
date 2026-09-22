import { render, screen } from '@testing-library/react-native';

import { Home } from '@/screens/home';

describe('<Home />', () => {
  test('shows the app title', async () => {
    await render(<Home />);

    expect(screen.getByText('SpanishGameApp')).toBeOnTheScreen();
  });
});
