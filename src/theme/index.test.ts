import { colors, fonts, radii, spacing } from '@/theme';

// Values from docs/design/swipe-game-ui/README.md ("Design Tokens").
describe('theme', () => {
  test('colours match the design handoff', () => {
    expect(colors).toEqual({
      background: '#F7D6E0',
      rose: '#D6457A',
      rosePressed: '#C53A6C',
      roseLight: '#F28BAB',
      cardCircle: '#E2638F',
      surface: '#FFF6F8',
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
      onRose: '#FBD0DD',
      onRoseHint: '#F7C4D4',
      onRoseSoft: '#FDE3EB',
      frameOnRose: 'rgba(255, 246, 248, 0.55)',
      placeholder: '#A8708A',
      bodyStrong: '#5A2A3E',
      scrim: 'rgba(59, 22, 36, 0.45)',
    });
  });

  test('radii match the design handoff', () => {
    expect(radii).toEqual({
      card: 36,
      hero: 30,
      sheet: 28,
      section: 22,
      row: 18,
      tile: 14,
      checkbox: 7,
      pill: 999,
      frame: 26,
      bar: 24,
    });
  });

  test('screen padding matches the design handoff', () => {
    expect(spacing).toEqual({ screen: 20, onboarding: 24 });
  });

  test('each font weight maps to its own Bricolage Grotesque face', () => {
    expect(fonts).toEqual({
      regular: 'BricolageGrotesque_400Regular',
      medium: 'BricolageGrotesque_500Medium',
      semiBold: 'BricolageGrotesque_600SemiBold',
      bold: 'BricolageGrotesque_700Bold',
      extraBold: 'BricolageGrotesque_800ExtraBold',
    });
  });
});
