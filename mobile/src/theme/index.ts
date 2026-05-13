export { default as tamaguiConfig } from './tamagui.config'
export { tokens } from './tokens'
export { lightTheme, darkTheme } from './themes'

// Re-export constants for non-Tamagui contexts (e.g., Expo Router header config)
export const expiria = {
  colors: {
    // Core brand
    primaryInk: '#4a8840',       // Brand green
    primarySurface: '#ffffff',   // White (tab bar, surfaces)
    secondarySurface: '#f2ede6', // Warm card background
    accent: '#c85e28',           // Terracotta
    canvas: '#faf8f4',           // Warm off-white page bg
    text: '#1e1915',             // Dark warm primary text
    textMuted: '#8c7d6e',        // Muted warm text
    border: '#e4dcd1',           // Warm border
    // Expiry status — green (fresh 7+ days)
    statusGreenBg: '#f2f7ee',
    statusGreenText: '#2d5428',
    statusGreenBorder: '#bdd8b4',
    statusGreenDot: '#4a8840',
    // Expiry status — yellow (soon 3-6 days)
    statusYellowBg: '#fdf8e6',
    statusYellowText: '#7a5500',
    statusYellowBorder: '#e8d58a',
    statusYellowDot: '#b07d00',
    // Expiry status — red/urgent (1-2 days) - terracotta
    statusRedBg: '#fdf5f0',
    statusRedText: '#87361a',
    statusRedBorder: '#f6c9a8',
    statusRedDot: '#c85e28',
    // Expiry status — expired
    statusExpiredBg: '#fdf2f1',
    statusExpiredText: '#922b21',
    statusExpiredBorder: '#f4bbb8',
    statusExpiredDot: '#c0392b',
  },
  darkColors: {
    canvas: '#151a14',
    primaryInk: '#6aa35b',
    primarySurface: '#222b20',
    secondarySurface: '#1d2319',
    accent: '#e07c46',
    text: '#f0ece5',
    textMuted: '#a09880',
    border: 'rgba(255,255,255,0.10)',
    statusGreenBg: 'rgba(74,136,64,0.15)',
    statusGreenText: '#93bf87',
    statusGreenBorder: 'rgba(74,136,64,0.30)',
    statusGreenDot: '#6aa35b',
    statusYellowBg: 'rgba(176,125,0,0.15)',
    statusYellowText: '#d4a017',
    statusYellowBorder: 'rgba(176,125,0,0.30)',
    statusYellowDot: '#d4a017',
    statusRedBg: 'rgba(224,124,70,0.15)',
    statusRedText: '#eea574',
    statusRedBorder: 'rgba(224,124,70,0.30)',
    statusRedDot: '#e07c46',
    statusExpiredBg: 'rgba(192,57,43,0.15)',
    statusExpiredText: '#e05c4f',
    statusExpiredBorder: 'rgba(192,57,43,0.30)',
    statusExpiredDot: '#e05c4f',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  strokes: { thin: 1, medium: 2, thick: 3 },
  shadows: {
    soft: {
      shadowColor: '#352e26',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    card: {
      shadowColor: '#352e26',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 2,
    },
    mid: {
      shadowColor: '#352e26',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  typography: {
    fontFamily: 'System',
    brandCase: 'uppercase' as const,
    sizes: { heading: 28, subheading: 20, body: 15, caption: 13, small: 11 },
    weights: { bold: '700' as const, semibold: '600' as const, medium: '500' as const, regular: '400' as const },
  },
} as const
