import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { OnboardingShell } from '@/screens/onboarding-shell';

describe('<OnboardingShell />', () => {
  test('shows the step dots and the step content, with no Back on step 1', async () => {
    await render(
      <OnboardingShell step={0} count={4} onBack={() => {}}>
        <Text>step content</Text>
      </OnboardingShell>,
    );

    expect(screen.getByLabelText('Step 1 of 4')).toBeOnTheScreen();
    expect(screen.getByText('step content')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  test('shows Back from step 2 and calls onBack when tapped', async () => {
    const onBack = jest.fn();
    await render(
      <OnboardingShell step={1} count={4} onBack={onBack}>
        <Text>step content</Text>
      </OnboardingShell>,
    );

    expect(screen.getByLabelText('Step 2 of 4')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
