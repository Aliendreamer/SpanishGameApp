import { singleFlight } from '@/utils/single-flight';

describe('singleFlight', () => {
  test('ignores calls while the previous action is still running', async () => {
    let finish = () => {};
    const action = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const run = singleFlight();

    const first = run(action);
    await run(action);
    expect(action).toHaveBeenCalledTimes(1);

    finish();
    await first;
    const again = run(action);
    expect(action).toHaveBeenCalledTimes(2);
    finish();
    await again;
  });

  test('runs again after an action fails', async () => {
    const run = singleFlight();

    await expect(run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    const action = jest.fn();
    await run(action);

    expect(action).toHaveBeenCalledTimes(1);
  });
});
