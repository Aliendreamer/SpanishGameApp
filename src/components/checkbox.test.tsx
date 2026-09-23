import { fireEvent, render, screen } from '@testing-library/react-native';

import { Checkbox } from '@/components/checkbox';

describe('<Checkbox />', () => {
  test('is a labelled checkbox that reports its state and toggles', async () => {
    const onToggle = jest.fn();
    await render(<Checkbox label="Include lower levels" checked onToggle={onToggle} />);

    const box = screen.getByRole('checkbox', { name: 'Include lower levels' });
    expect(box).toBeChecked();
    await fireEvent.press(box);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('when disabled it is dimmed and ignores presses', async () => {
    const onToggle = jest.fn();
    await render(
      <Checkbox label="Include lower levels" checked={false} disabled onToggle={onToggle} />,
    );

    const box = screen.getByRole('checkbox', { name: 'Include lower levels' });
    expect(box).toBeDisabled();
    expect(box).toHaveStyle({ opacity: 0.4 });
    await fireEvent.press(box);

    expect(onToggle).not.toHaveBeenCalled();
  });
});
