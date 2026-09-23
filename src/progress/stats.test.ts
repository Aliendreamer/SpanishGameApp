import { DAY_MS, dayNumber, streakLength, weekMarks } from '@/progress/stats';

// 1970-01-01 (day 0) was a Thursday; day 4 is Monday 1970-01-05.
const MONDAY = 4;

describe('dayNumber', () => {
  test('counts whole local days since 1970-01-01', () => {
    expect(dayNumber(0, 0)).toBe(0);
    expect(dayNumber(DAY_MS - 1, 0)).toBe(0);
    expect(dayNumber(DAY_MS, 0)).toBe(1);
  });

  test('shifts by the UTC offset, so late evening stays on the local day', () => {
    // 23:30 local on day 1 in UTC+2 is 21:30 UTC.
    const lateEvening = DAY_MS + 21.5 * 3600 * 1000;
    expect(dayNumber(lateEvening, 2 * 3600 * 1000)).toBe(1);
    // 00:30 local on day 2 in UTC+2 is 22:30 UTC on day 1.
    const pastMidnight = DAY_MS + 22.5 * 3600 * 1000;
    expect(dayNumber(pastMidnight, 2 * 3600 * 1000)).toBe(2);
  });
});

describe('streakLength', () => {
  test('counts back from today when today has a swipe', () => {
    expect(streakLength(new Set([8, 9, 10, 6]), 10)).toBe(3);
  });

  test('counts back from yesterday while today has none', () => {
    expect(streakLength(new Set([8, 9]), 10)).toBe(2);
  });

  test('is 0 when neither today nor yesterday has a swipe', () => {
    expect(streakLength(new Set([7, 8]), 10)).toBe(0);
    expect(streakLength(new Set(), 10)).toBe(0);
  });
});

describe('weekMarks', () => {
  test('marks Monday to Sunday of the current week', () => {
    const wednesday = MONDAY + 2;

    expect(weekMarks(new Set([MONDAY, wednesday, MONDAY - 1]), wednesday)).toEqual([
      true,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  test('on a Sunday the whole week is in view', () => {
    const sunday = MONDAY + 6;

    expect(weekMarks(new Set([sunday]), sunday)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  });
});
