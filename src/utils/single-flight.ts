// Returns a runner that ignores new calls while its previous action is still running, so a double
// tap on a button that saves or navigates can't run the action twice.
export function singleFlight() {
  let running = false;

  return async (action: () => void | Promise<void>): Promise<void> => {
    if (running) return;
    running = true;
    try {
      await action();
    } finally {
      running = false;
    }
  };
}
