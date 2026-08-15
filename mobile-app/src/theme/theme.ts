// Brand theme for Event Management & Team Leadership E1
// Deep navy + amber accent, consistent throughout the app.

export const colors = {
  navy: '#0B1F3A',
  navyDark: '#071429',
  navyLight: '#16335C',
  amber: '#F5A623',
  amberDark: '#D68A0E',
  amberLight: '#FDE7C2',
  white: '#FFFFFF',
  offWhite: '#F7F8FA',
  border: '#E3E7EE',
  textPrimary: '#141C2B',
  textSecondary: '#5B6472',
  textMuted: '#8B93A1',
  success: '#1F9D55',
  successBg: '#E4F7EA',
  danger: '#D64545',
  dangerBg: '#FBE7E7',
  warning: '#E0A500',
  warningBg: '#FDF3D8',
  info: '#2563EB',
  infoBg: '#E6EEFD',
  card: '#FFFFFF',
  shadow: '#0B1F3A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const },
};

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

const theme = { colors, spacing, radius, typography, shadow };
export default theme;
