export const CROSS_THING_TYPES = {
  MINER: 'miner',
  CONTAINER: 'container',
  POOL: 'pool',
  CABINET: 'cabinet',
} as const

// Type exports
export type CrossThingTypeKey = keyof typeof CROSS_THING_TYPES
export type CrossThingTypeValue = (typeof CROSS_THING_TYPES)[CrossThingTypeKey]
