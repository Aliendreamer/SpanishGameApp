import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { OnboardingShell } from '@/screens/onboarding-shell';
import { InBulgarian } from '@/i18n/testing';

describe('<OnboardingShell />', () => {
  test('shows the step dots and the step content, and no Back unless asked', async () => {
    await render(
      <OnboardingShell step={1} count={4} showBack={false} onBack={() => {}}>
        <Text>step content</Text>
      </OnboardingShell>,
    );

    expect(screen.getByLabelText('Step 2 of 4')).toBeOnTheScreen();
    expect(screen.getByText('step content')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  test('shows Back when asked and calls onBack when tapped', async () => {
    const onBack = jest.fn();
    await render(
      <OnboardingShell step={3} count={4} showBack onBack={onBack}>
        <Text>step content</Text>
      </OnboardingShell>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('shows Back and the step in Bulgarian', async () => {
    await render(
      <OnboardingShell step={1} count={4} showBack onBack={() => {}}>
        <Text>content</Text>
      </OnboardingShell>,
      { wrapper: InBulgarian },
    );

    expect(screen.getByRole('button', { name: 'Назад' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Стъпка 2 от 4')).toBeOnTheScreen();
  });
});
