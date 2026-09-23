import { fireEvent, render, screen } from '@testing-library/react-native';

import { LinkRow, RadioRow, Section, SwitchRow } from '@/components/settings-rows';

describe('settings rows', () => {
  test('a section shows its label and rows', async () => {
    await render(
      <Section label="TUTORIAL">
        <LinkRow label="View tutorial now" onPress={() => {}} />
      </Section>,
    );

    expect(screen.getByRole('header', { name: 'TUTORIAL' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'View tutorial now' })).toBeOnTheScreen();
  });

  test('a switch row shows its state, and a tap anywhere on it toggles', async () => {
    const onValueChange = jest.fn();
    await render(
      <SwitchRow
        label="Show tutorial at start"
        detail="Open it each time"
        value
        onValueChange={onValueChange}
      />,
    );

    const row = screen.getByRole('switch', { name: 'Show tutorial at start' });
    expect(row).toBeChecked();
    expect(screen.getByText('Open it each time')).toBeOnTheScreen();
    await fireEvent.press(row);

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  test('a disabled switch row is dimmed and ignores taps', async () => {
    const onValueChange = jest.fn();
    await render(
      <SwitchRow
        label="Include lower levels"
        detail="Not used with Full"
        value={false}
        disabled
        onValueChange={onValueChange}
      />,
    );

    const row = screen.getByRole('switch', { name: 'Include lower levels' });
    expect(row).toBeDisabled();
    await fireEvent.press(row);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('a radio row reports selection', async () => {
    const onPress = jest.fn();
    await render(
      <RadioRow label="Advanced" detail="B2 · 1,603 words" selected onPress={onPress} />,
    );

    const radio = screen.getByRole('radio', { name: /^Advanced/ });
    expect(radio).toBeChecked();
    await fireEvent.press(radio);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
