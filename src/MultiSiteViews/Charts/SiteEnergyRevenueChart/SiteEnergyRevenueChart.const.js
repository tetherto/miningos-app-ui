import { CURRENCY as CURRENCY_SYMBOL } from '@/constants/units'
import { CURRENCY } from '@/MultiSiteViews/constants'

export const CURRENCY_KEY_MAP = {
  [CURRENCY.USD]: 'energyRevenueUSD',
  [CURRENCY.BTC]: 'energyRevenueBTC',
}

export const CURRENCY_LABEL_MAP = {
  [CURRENCY.USD]: 'Energy Revenue USD',
  [CURRENCY.BTC]: 'Energy Revenue BTC',
}

export const CURRENCY_SYMBOL_MAP = {
  [CURRENCY.USD]: CURRENCY_SYMBOL.USD,
  [CURRENCY.BTC]: CURRENCY_SYMBOL.BTC,
}
