export const AUTH_PERMISSIONS = {
  MINER: 'miner',
  CONTAINER: 'container',
  MINERPOOL: 'minerpool',
  POWERMETER: 'powermeter',
  TEMP: 'temp',
  ELECTRICITY: 'electricity',
  FEATURES: 'features',
  REVENUE: 'revenue',
  ACTIONS: 'actions',
  USERS: 'users',
  PRODUCTION: 'production',
  ALERTS: 'alerts',
  CABINETS: 'cabinets',
  COMMENTS: 'comments',
  EXPLORER: 'explorer',
  INVENTORY: 'inventory',
  REPORTING: 'reporting',
  SETTINGS: 'settings',
  TICKETS: 'tickets',
} as const

export const AUTH_LEVELS = {
  READ: 'r',
  WRITE: 'w',
} as const

export const USER_ROLE = {
  ADMIN: 'admin',
  REPORTING_TOOL_MANAGER: 'reporting_tool_manager',
  SITE_MANAGER: 'site_manager',
  SITE_OPERATOR: 'site_operator',
  FIELD_OPERATOR: 'field_operator',
  REPAIR_TECHNICIAN: 'repair_technician',
  READ_ONLY: 'read_only_user',
} as const

// Type exports
export type AuthPermissionKey = keyof typeof AUTH_PERMISSIONS
export type AuthPermissionValue = (typeof AUTH_PERMISSIONS)[AuthPermissionKey]
export type AuthLevelKey = keyof typeof AUTH_LEVELS
export type AuthLevelValue = (typeof AUTH_LEVELS)[AuthLevelKey]
export type UserRoleKey = keyof typeof USER_ROLE
export type UserRoleValue = (typeof USER_ROLE)[UserRoleKey]
