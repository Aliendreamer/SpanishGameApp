// The username rule shared by onboarding and Settings: 2 to 20 characters once trimmed.
export const USERNAME_MIN = 2;
export const USERNAME_MAX = 20;

export function isValidUsername(name: string): boolean {
  const { length } = name.trim();
  return length >= USERNAME_MIN && length <= USERNAME_MAX;
}
