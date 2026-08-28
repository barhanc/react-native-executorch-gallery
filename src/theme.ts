import { useColorScheme } from 'react-native';

/**
 * Polished design tokens for ExecuTorch Gallery.
 * High-contrast, clean modern palette inspired by AI Edge / modern iOS design.
 */
const palette = {
  light: {
    bg: '#F8F9FF',
    surface: '#FFFFFF',
    surfaceSubtle: '#EEF0FF',
    surfaceAlt: '#E4E8FA',
    border: '#D8DEFA',
    borderSubtle: '#EEF0FF',
    text: '#001A72',
    textSecondary: '#33488E',
    textDim: '#6676AA',
    textMuted: '#919FCF',
    accent: '#2A47FF',
    accentSoft: '#EEF0FF',
    accentBorder: '#D0E2FF',
    danger: '#FF6259',
    dangerSoft: '#FAF2F2',
    success: '#57B495',
    successSoft: '#EFF6F0',
    warning: '#F59E0B',
    warningSoft: '#FAF5EF',
  },
  dark: {
    bg: '#0D1326',
    surface: '#151D38',
    surfaceSubtle: '#1C274A',
    surfaceAlt: '#23305B',
    border: '#2A3A6E',
    borderSubtle: '#1E2B52',
    text: '#EEF0FF',
    textSecondary: '#C1C6E5',
    textDim: '#919FCF',
    textMuted: '#6676AA',
    accent: '#4B6CF4',
    accentSoft: '#18244D',
    accentBorder: '#2E418A',
    danger: '#FF6259',
    dangerSoft: '#451A1A',
    success: '#3FC684',
    successSoft: '#0F3D2B',
    warning: '#FBBF24',
    warningSoft: '#3D2D0F',
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export type ThemeColors = typeof palette.light;

export function useTheme() {
  const scheme: 'light' | 'dark' = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { colors: palette[scheme], scheme, spacing, radius };
}

