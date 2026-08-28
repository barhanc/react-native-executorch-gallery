import { useColorScheme } from 'react-native';

/**
 * Polished design tokens for ExecuTorch Gallery.
 * High-contrast, clean modern palette inspired by AI Edge / modern iOS design.
 */
const palette = {
  light: {
    bg: '#F8F9FB',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F3F7',
    surfaceAlt: '#EAEEF4',
    border: '#E3E6EB',
    borderSubtle: '#EFF1F5',
    text: '#0F172A',
    textSecondary: '#475569',
    textDim: '#64748B',
    textMuted: '#94A3B8',
    accent: '#2563EB',
    accentSoft: '#EFF6FF',
    accentBorder: '#BFDBFE',
    danger: '#EF4444',
    dangerSoft: '#FEF2F2',
    success: '#10B981',
    successSoft: '#ECFDF5',
    warning: '#F59E0B',
    warningSoft: '#FFFBEB',
  },
  dark: {
    bg: '#0A0C10',
    surface: '#14171F',
    surfaceSubtle: '#1C202B',
    surfaceAlt: '#232836',
    border: '#2A303F',
    borderSubtle: '#1F2430',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textDim: '#94A3B8',
    textMuted: '#64748B',
    accent: '#3B82F6',
    accentSoft: '#172554',
    accentBorder: '#1E3A8A',
    danger: '#F87171',
    dangerSoft: '#450A0A',
    success: '#34D399',
    successSoft: '#064E3B',
    warning: '#FBBF24',
    warningSoft: '#451A03',
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

