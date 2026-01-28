export const UNITS = {
  TEMPERATURE_C: '°C',
  POWER_KW: 'kW',
  POWER_W: 'W',
  AMPERE: 'A',
  HUMIDITY_PERCENT: '%RH',
  FREQUENCY_HERTZ: 'Hz',
  ENERGY_MW: 'MW',
  ENERGY_MWH: 'MWh',
  ENERGY_GWH: 'GWh',
  ENERGY_KWH: 'kWh',
  ENERGY_WH: 'Wh',
  PRESSURE_BAR: 'bar',
  HASHRATE_TH_S: 'TH/s',
  HASHRATE_PH_S: 'PH/s',
  HASHRATE_EH_S: 'EH/s',
  HASHRATE_MH_S: 'MH/s',
  EFFICIENCY_W_PER_TH: 'W/TH',
  EFFICIENCY_W_PER_TH_S: 'W/TH/S',
  VOLTAGE_V: 'V',
  PERCENT: '%',
  SATS: 'Sats',
  VBYTE: 'vByte',
  APPARENT_POWER_KVA: 'kVA',
  FLOW_M3H: 'm3/h',
} as const

export const CURRENCY = {
  USD_LABEL: 'USD',
  SATS: 'Sats',
  SAT_LABEL: 'SAT',
  BTC_LABEL: 'BTC',
  USD: '$',
  EUR: '€',
  BTC: '₿',
} as const

export const MAX_UNIT_VALUE = {
  HUMIDITY_PERCENT: 100,
  TEMPERATURE_PERCENT: 100,
} as const

export const HASHRATE_LABEL_DIVISOR = {
  'EH/s': 1e12,
  'PH/s': 1e9,
  'TH/s': 1e6,
  'GH/s': 1e3,
  'MH/s': 1,
} as const

// Type exports
export type UnitKey = keyof typeof UNITS
export type UnitValue = (typeof UNITS)[UnitKey]
export type CurrencyKey = keyof typeof CURRENCY
export type CurrencyValue = (typeof CURRENCY)[CurrencyKey]
export type MaxUnitValueKey = keyof typeof MAX_UNIT_VALUE
export type MaxUnitValueValue = (typeof MAX_UNIT_VALUE)[MaxUnitValueKey]
export type HashrateLabelDivisorKey = keyof typeof HASHRATE_LABEL_DIVISOR
export type HashrateLabelDivisorValue = (typeof HASHRATE_LABEL_DIVISOR)[HashrateLabelDivisorKey]
