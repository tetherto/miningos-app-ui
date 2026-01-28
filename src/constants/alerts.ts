import { COLOR } from './colors'

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
} as const

// Improved colors for WCAG AA accessibility (4.5:1 contrast ratio)
export const SEVERITY_COLORS = {
  [SEVERITY.MEDIUM]: COLOR.GOLD,
  [SEVERITY.HIGH]: COLOR.DARK_ORANGE_ACCESSIBLE,
  [SEVERITY.CRITICAL]: COLOR.BRIGHT_RED,
} as const

export const SEVERITY_LEVELS = {
  [SEVERITY.MEDIUM]: 0,
  [SEVERITY.HIGH]: 1,
  [SEVERITY.CRITICAL]: 2,
} as const

export const SEVERITY_KEY = 'severity'

// Type exports
export type SeverityKey = keyof typeof SEVERITY
export type SeverityValue = (typeof SEVERITY)[SeverityKey]
export type SeverityColorKey = keyof typeof SEVERITY_COLORS
export type SeverityLevelKey = keyof typeof SEVERITY_LEVELS
export type SeverityLevelValue = (typeof SEVERITY_LEVELS)[SeverityLevelKey]
