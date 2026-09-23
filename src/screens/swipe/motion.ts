// The swipe card's drag rules (docs/design/swipe-game-ui/README.md, "Swipe gesture"). Worklets,
// so the gesture runs them on the UI thread; plain functions to the tests.

// Past this, a release answers; it is also the drag at which a stamp is fully shown.
export const COMMIT_DISTANCE = 90;
// Under this, in any direction, a release is a tap.
export const TAP_DISTANCE = 6;
// Where the fly-out ends, and its tilt.
export const FLY_DISTANCE = 560;
export const FLY_ROTATION = 24;

export type ReleaseOutcome = 'know' | 'learn' | 'tap' | 'back';

export function releaseOutcome(dx: number, dy = 0): ReleaseOutcome {
  'worklet';
  if (Math.hypot(dx, dy) < TAP_DISTANCE) return 'tap';
  if (dx > COMMIT_DISTANCE) return 'know';
  if (dx < -COMMIT_DISTANCE) return 'learn';
  return 'back';
}

export function stampOpacities(dx: number): { know: number; learn: number } {
  'worklet';
  const strength = Math.min(1, Math.abs(dx) / COMMIT_DISTANCE);
  return { know: dx > 0 ? strength : 0, learn: dx < 0 ? strength : 0 };
}

export function dragRotation(dx: number): number {
  'worklet';
  return dx / 20;
}
