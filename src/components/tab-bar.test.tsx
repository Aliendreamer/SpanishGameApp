import { fireEvent, render, screen } from '@testing-library/react-native';

import { TabBar } from '@/components/tab-bar';
import { colors } from '@/theme';

const TABS = [
  { name: 'swipe', label: 'Swipe' },
  { name: 'words', label: 'Words' },
  { name: 'progress', label: 'Progress' },
  { name: 'settings', label: 'Settings' },
];

describe('<TabBar />', () => {
  test('shows every tab and marks the active one', async () => {
    await render(<TabBar tabs={TABS} active="swipe" onSelect={() => {}} />);

    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Swipe' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Swipe' })).toHaveStyle({
      backgroundColor: colors.rose,
    });
    expect(screen.getByRole('tab', { name: 'Words' })).not.toBeSelected();
  });

  test('reports which tab was pressed', async () => {
    const onSelect = jest.fn();
    await render(<TabBar tabs={TABS} active="swipe" onSelect={onSelect} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Progress' }));

    expect(onSelect).toHaveBeenCalledWith('progress');
  });
});
