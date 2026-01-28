export const AUTH_CAPS = {
  miner: 'm',
  container: 'c',
  minerpool: 'mp',
  powermeter: 'p',
  temp: 't',
  electricity: 'e',
  features: 'f',
  revenue: 'r',
} as const

// Type exports
export type AuthCapKey = keyof typeof AUTH_CAPS
export type AuthCapValue = (typeof AUTH_CAPS)[AuthCapKey]
