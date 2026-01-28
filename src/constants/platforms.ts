export const OsTypes = {
  IOS: 'iOS',
  Android: 'Android',
  Windows: 'Windows',
  MAC: 'Mac',
  Linux: 'Linux',
} as const

// Type exports
export type OsTypeKey = keyof typeof OsTypes
export type OsTypeValue = (typeof OsTypes)[OsTypeKey]
