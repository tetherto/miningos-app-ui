export const WEBAPP_NAME = 'MiningOS'
export const WEBAPP_DISPLAY_NAME = 'Mining OS'
export const WEBAPP_SHORT_NAME = 'MOS'
export const POOL_NAME = 'Pool'

export const DATE_RANGE = {
  M1: '1m',
  M5: '5m',
  M15: '15m',
  M30: '30m',
  H1: '1h',
  H3: '3h',
  D1: '1D',
  W1: '1W',
  MONTH1: '1M',
} as const

export const REVENUE_MULTIPLIER = {
  [DATE_RANGE.D1]: 24,
  [DATE_RANGE.W1]: 24 * 7,
  [DATE_RANGE.MONTH1]: 24 * 30,
} as const

export const DATE_RANGE_DURATIONS = {
  [DATE_RANGE.M1]: {
    minutes: 1,
  },
  [DATE_RANGE.M5]: {
    minutes: 5,
  },
  [DATE_RANGE.M15]: {
    minutes: 15,
  },
  [DATE_RANGE.M30]: {
    minutes: 30,
  },
  [DATE_RANGE.H1]: {
    hours: 1,
  },
  [DATE_RANGE.H3]: {
    hours: 3,
  },
  [DATE_RANGE.D1]: {
    days: 1,
  },
  [DATE_RANGE.MONTH1]: {
    months: 1,
  },
} as const

export const DATE_RANGE_PER_HOUR = {
  [DATE_RANGE.M1]: 60,
  [DATE_RANGE.M5]: 12,
  [DATE_RANGE.M15]: 4,
  [DATE_RANGE.M30]: 2,
  [DATE_RANGE.H1]: 1,
  [DATE_RANGE.H3]: 1 / 3,
  [DATE_RANGE.D1]: 1 / 24,
  [DATE_RANGE.W1]: 1 / 24 / 7,
  [DATE_RANGE.MONTH1]: 1 / 24 / 30,
} as const

export const TIME = {
  ONE_MIN: 60000,
  FIVE_MIN: 60000 * 5,
  TEN_MINS: 600000,
} as const

export const RESPONSE_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const

// Type exports
export type DateRangeKey = keyof typeof DATE_RANGE
export type DateRangeValue = (typeof DATE_RANGE)[DateRangeKey]
export type RevenueMultiplierKey = keyof typeof REVENUE_MULTIPLIER
export type TimeKey = keyof typeof TIME
export type ResponseCodeKey = keyof typeof RESPONSE_CODE
export type ResponseCodeValue = (typeof RESPONSE_CODE)[ResponseCodeKey]
