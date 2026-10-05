// ============================================================
// THEME CONFIGURATION
// Centralized colors, fonts, and design tokens.
// ============================================================

export const theme = {
  colors: {
    background: '#0a0a0f',
    backgroundSecondary: '#111118',
    backgroundTertiary: '#1a1a24',
    foreground: '#f0f0f5',
    foregroundSecondary: '#a0a0b0',
    foregroundMuted: '#6b6b80',
    primary: '#c084fc',       // Soft purple — empathy, awareness
    primaryDark: '#9333ea',
    primaryLight: '#e9d5ff',
    secondary: '#38bdf8',     // Sky blue — hope, healthcare
    secondaryDark: '#0284c7',
    accent: '#f472b6',        // Pink — cancer awareness ribbon
    accentDark: '#db2777',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    overlay: 'rgba(0, 0, 0, 0.7)',
    cardBackground: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    glassBg: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  fonts: {
    heading: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', monospace",
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  shadows: {
    glow: '0 0 40px rgba(192, 132, 252, 0.15)',
    glowStrong: '0 0 60px rgba(192, 132, 252, 0.3)',
    card: '0 4px 24px rgba(0, 0, 0, 0.3)',
    elevated: '0 8px 40px rgba(0, 0, 0, 0.5)',
  },
} as const;

export type Theme = typeof theme;
