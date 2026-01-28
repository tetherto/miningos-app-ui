/**
 * RTK Query cache tag types for invalidation and refetching
 */
export const API_TAG_TYPES = [
  'Features',
  'User',
  'GlobalConfig',
  'Reports',
  'Action',
  'Settings',
  'ProductionCosts',
  'ContainerSettings',
] as const

export type ApiTagType = (typeof API_TAG_TYPES)[number]

/**
 * Cache configuration constants
 */
export const CACHE_CONFIG = {
  /** Keep unused data for 5 minutes (stable data) */
  KEEP_UNUSED_DATA_FOR: 300,
  /** Only refetch if data older than 30 seconds */
  REFETCH_ON_MOUNT_OR_ARG_CHANGE: 30,
  /** Disable automatic refetch on window focus */
  REFETCH_ON_FOCUS: false,
  /** Refetch when connection restored */
  REFETCH_ON_RECONNECT: true,
} as const

/**
 * Queue concurrency limits
 */
export const QUEUE_CONFIG = {
  /** High concurrency for general API requests */
  HIGH_CONCURRENCY: 25,
  /** Lower concurrency for reporting tools to avoid overload */
  REPORTING_TOOLS_CONCURRENCY: 10,
} as const

/**
 * Path identifiers
 */
export const API_PATHS = {
  REPORTING_TOOLS: 'reporting-tool',
  USERINFO: 'userinfo',
} as const
