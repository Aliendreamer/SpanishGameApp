import { fireEvent, render, screen } from '@testing-library/react-native';

import { CreditsSheet } from '@/components/credits-sheet';

describe('<CreditsSheet />', () => {
  test('credits every data source', async () => {
    await render(<CreditsSheet onClose={() => {}} />);

    expect(screen.getByRole('header', { name: 'Credits' })).toBeOnTheScreen();
    expect(screen.getByText(/Wiktionary via Doozan, CC BY-SA\./)).toBeOnTheScreen();
    expect(screen.getByText(/Tatoeba, CC BY, with per-sentence attribution\./)).toBeOnTheScreen();
    expect(
      screen.getByText(/CEFR word list, free for personal and educational use\./),
    ).toBeOnTheScreen();
  });

  test('closes from "Close" and from the backdrop', async () => {
    const onClose = jest.fn();
    await render(<CreditsSheet onClose={onClose} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    // The backdrop is hidden from screen readers (the sheet is modal); it is for touch only.
    await fireEvent.press(screen.getByTestId('credits-backdrop', { includeHiddenElements: true }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
