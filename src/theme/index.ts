// Design tokens from docs/design/swipe-game-ui/README.md ("Design Tokens"). Screens use these,
// never literal values, so the palette changes in one place.

export const colors = {
  background: '#F7D6E0',
  rose: '#D6457A',
  rosePressed: '#C53A6C',
  // Next-card hint and the onboarding hero's back card.
  roseLight: '#F28BAB',
  cardCircle: '#E2638F',
  surface: '#FFF6F8',
  // Unselected option cards: surface at 45%.
  surfaceFaint: 'rgba(255, 246, 248, 0.45)',
  soft: '#F7D6DF',
  track: '#EFBCCD',
  ink: '#3B1624',
  bodyMuted: '#7A3D55',
  textSecondary: '#8A4A62',
  label: '#9A4F6C',
  chipText: '#8F3355',
  error: '#B8325F',
  know: '#5F7A3A',
  // Light text on rose surfaces.
  onRose: '#FBD0DD',
  onRoseHint: '#F7C4D4',
  onRoseSoft: '#FDE3EB',
  // The thin inner frame on rose cards: surface at 55%.
  frameOnRose: 'rgba(255, 246, 248, 0.55)',
  placeholder: '#A8708A',
} as const;

export const radii = {
  card: 36,
  hero: 30,
  sheet: 28,
  section: 22,
  row: 18,
  tile: 14,
  checkbox: 7,
  pill: 999,
  // The thin frame inside the rose card front.
  frame: 26,
  // The top corners of the tab bar.
  bar: 24,
} as const;

// The drop shadow under rose cards (the swipe card, the Welcome hero).
export const shadows = {
  card: '0 24px 44px -20px rgba(140, 30, 70, 0.55)',
  // The card on the "It's a match!" overlay.
  match: '0 24px 44px -18px rgba(80, 10, 40, 0.5)',
} as const;

// Horizontal screen padding.
export const spacing = {
  screen: 20,
  onboarding: 24,
} as const;

// Android picks a face by family name, not fontWeight, so each weight is its own family.
export const fonts = {
  regular: 'BricolageGrotesque_400Regular',
  medium: 'BricolageGrotesque_500Medium',
  semiBold: 'BricolageGrotesque_600SemiBold',
  bold: 'BricolageGrotesque_700Bold',
  extraBold: 'BricolageGrotesque_800ExtraBold',
} as const;
