import { render, screen } from '@testing-library/react-native';

import { HowItWorksPlaceholder } from '@/screens/how-it-works-placeholder';

describe('<HowItWorksPlaceholder />', () => {
  test('says the how-it-works step comes next', async () => {
    await render(<HowItWorksPlaceholder />);

    expect(screen.getByText('How it works — coming next')).toBeOnTheScreen();
  });
});
