import { fireEvent, render, screen } from '@testing-library/react-native';

import { Username } from '@/screens/username';
import { InBulgarian } from '@/i18n/testing';

const ERROR = 'Use at least 2 characters';

async function renderUsername() {
  const onSubmit = jest.fn();
  await render(<Username onSubmit={onSubmit} />);
  return { onSubmit, input: screen.getByPlaceholderText('Username') };
}

describe('<Username />', () => {
  test('shows the title, body, an empty counter, and no error before the field is touched', async () => {
    await renderUsername();

    expect(screen.getByText('What should we call you?')).toBeOnTheScreen();
    expect(screen.getByText('Pick a username. It stays on this phone.')).toBeOnTheScreen();
    expect(screen.getByText('0 / 20')).toBeOnTheScreen();
    expect(screen.queryByText(ERROR)).toBeNull();
  });

  test('limits the field to 20 characters and opens it focused', async () => {
    const { input } = await renderUsername();

    expect(input.props.maxLength).toBe(20);
    expect(input.props.autoFocus).toBe(true);
  });

  test('shows the error and counter once a too-short name is typed', async () => {
    const { input } = await renderUsername();

    await fireEvent.changeText(input, 'a');

    expect(screen.getByText(ERROR)).toBeOnTheScreen();
    expect(screen.getByText('1 / 20')).toBeOnTheScreen();
  });

  test('pressing Continue with a blank name shows the error and does not submit', async () => {
    const { onSubmit, input } = await renderUsername();

    await fireEvent.changeText(input, '   ');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText(ERROR)).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits the trimmed name from the Continue button', async () => {
    const { onSubmit, input } = await renderUsername();

    await fireEvent.changeText(input, '  Ana  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.queryByText(ERROR)).toBeNull();
    expect(onSubmit).toHaveBeenCalledWith('Ana');
  });

  test('submits from the keyboard Enter key', async () => {
    const { onSubmit, input } = await renderUsername();

    await fireEvent.changeText(input, 'Ana');
    await fireEvent(input, 'submitEditing');

    expect(onSubmit).toHaveBeenCalledWith('Ana');
  });

  test('shows its text and error in Bulgarian', async () => {
    await render(<Username onSubmit={() => {}} />, { wrapper: InBulgarian });

    expect(screen.getByText('Как да те наричаме?')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByPlaceholderText('Потребителско име'), 'A');

    expect(screen.getByText('Поне 2 знака')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Продължи' })).toBeOnTheScreen();
  });
});
