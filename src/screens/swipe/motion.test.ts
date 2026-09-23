import { dragRotation, releaseOutcome, stampOpacities } from '@/screens/swipe/motion';

describe('releaseOutcome', () => {
  test('a release past 90 dp answers: right is "I know it", left is "Still learning"', () => {
    expect(releaseOutcome(120)).toBe('know');
    expect(releaseOutcome(-91)).toBe('learn');
  });

  test('a release under 6 dp is a tap', () => {
    expect(releaseOutcome(0)).toBe('tap');
    expect(releaseOutcome(-5)).toBe('tap');
  });

  test('a long vertical drag is not a tap, even with little sideways movement', () => {
    expect(releaseOutcome(3, 200)).toBe('back');
    expect(releaseOutcome(2, 3)).toBe('tap');
  });

  test('anything in between springs back', () => {
    expect(releaseOutcome(6)).toBe('back');
    expect(releaseOutcome(-50)).toBe('back');
    expect(releaseOutcome(90)).toBe('back');
  });
});

describe('stampOpacities', () => {
  test('fade in with the drag in its direction, full at 90 dp', () => {
    expect(stampOpacities(45)).toEqual({ know: 0.5, learn: 0 });
    expect(stampOpacities(-180)).toEqual({ know: 0, learn: 1 });
    expect(stampOpacities(0)).toEqual({ know: 0, learn: 0 });
  });
});

describe('dragRotation', () => {
  test('rotates a twentieth of the drag, in degrees', () => {
    expect(dragRotation(100)).toBe(5);
    expect(dragRotation(-40)).toBe(-2);
  });
});
