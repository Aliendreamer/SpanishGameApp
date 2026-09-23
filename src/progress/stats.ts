// Day and streak rules for the Progress tab. Pure: days are whole local days since 1970-01-01, so
// the rules are tested without clocks or time zones.

export const DAY_MS = 24 * 60 * 60 * 1000;

// The local day of a timestamp, given the phone's offset from UTC.
export function dayNumber(ms: number, utcOffsetMs: number): number {
  return Math.floor((ms + utcOffsetMs) / DAY_MS);
}

// The phone's current offset from UTC (east positive).
export function utcOffsetMs(now: number): number {
  return -new Date(now).getTimezoneOffset() * 60 * 1000;
}

// Consecutive days with a swipe, counting back from today — or from yesterday while today has none
// yet, so the streak doesn't drop to 0 every morning.
export function streakLength(days: ReadonlySet<number>, today: number): number {
  let day = days.has(today) ? today : today - 1;
  let length = 0;
  while (days.has(day)) {
    length += 1;
    day -= 1;
  }
  return length;
}

// Whether each day of the current week, Monday to Sunday, has a swipe.
export function weekMarks(days: ReadonlySet<number>, today: number): boolean[] {
  // Day 0 was a Thursday, so (day + 3) % 7 counts from Monday.
  const monday = today - ((today + 3) % 7);
  return Array.from({ length: 7 }, (_, index) => days.has(monday + index));
}
