import { isValidUsername, USERNAME_MAX } from '@/utils/username';

describe('isValidUsername', () => {
  test('needs 2 to 20 characters once trimmed', () => {
    expect(isValidUsername('Ana')).toBe(true);
    expect(isValidUsername('  Al  ')).toBe(true);
    expect(isValidUsername('a')).toBe(false);
    expect(isValidUsername('   ')).toBe(false);
    expect(isValidUsername('x'.repeat(USERNAME_MAX))).toBe(true);
    expect(isValidUsername('x'.repeat(USERNAME_MAX + 1))).toBe(false);
  });
});
