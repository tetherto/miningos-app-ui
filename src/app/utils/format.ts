import { format } from 'date-fns/format'
import _capitalize from 'lodash/capitalize'
import _compact from 'lodash/compact'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _round from 'lodash/round'
import _split from 'lodash/split'
import _toUpper from 'lodash/toUpper'
import _words from 'lodash/words'

import type { ErrorWithTimestamp, ValueUnit } from './utils.types'

export type { ValueUnit } from './utils.types'

import { ROUTE, ROUTE_TITLES_MAP } from '@/constants/routes'
import { CURRENCY, UNITS } from '@/constants/units'

const LOCALE = 'en-US'

export const FALLBACK = '-'

/**
 * Get the formatted number or "-"
 */
export const formatNumber = (
  number: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {},
  fallback = FALLBACK,
): string => {
  // Default options
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    maximumSignificantDigits: undefined,
    ...options,
  }

  // Conditionally remove fraction digits if significant digits are set
  if (options?.maximumSignificantDigits !== undefined) {
    // If significant digits are set, we don't want to override fraction digits.
    delete opts.minimumFractionDigits
    delete opts.maximumFractionDigits
  }

  const result = _isFinite(parseFloat(number as string))
    ? new Intl.NumberFormat(LOCALE, opts).format(number as number)
    : fallback

  return result === '-0' ? '0' : result
}

/**
 * Get the formatted hashrate or -
 */
export const formatHashrate = (
  number: number | string,
  options?: Intl.NumberFormatOptions,
  fallback = FALLBACK,
): string =>
  _isFinite(parseFloat(number as string))
    ? formatNumber(_round(number as number, 2), options, fallback)
    : fallback

/**
 * Get the percent formatted number or -
 */
export const getPercentFormattedNumber = (
  number: number | string,
  decimals = 2,
  fallback = FALLBACK,
): string =>
  formatNumber(
    number,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
      maximumSignificantDigits: undefined,
      style: 'percent',
    },
    fallback,
  )

/**
 * Formats value and unit list into string
 */
export const formatValueUnit = (
  value: number | string,
  unit?: string,
  options?: Intl.NumberFormatOptions,
  fallback = FALLBACK,
  formatter: (
    value: number | string,
    options?: Intl.NumberFormatOptions,
    fallback?: string,
  ) => string = formatNumber,
): string => {
  const formattedValue = formatter(value, options, fallback)
  if (formattedValue === fallback) return fallback
  if (!unit) return formattedValue

  // Fiat currency symbols go before the number with no space
  const fiatSymbols = ['$', '€', '£', '¥']
  if (fiatSymbols.includes(unit)) {
    return `${unit}${formattedValue}`
  }

  // Crypto and other units go after with a space
  return `${formattedValue} ${unit}`
}

/**
 * Formats value and unit object into string
 */
export const formatUnit = (
  object: Partial<ValueUnit> = {},
  options?: Intl.NumberFormatOptions,
  fallback = FALLBACK,
  formatter: (
    value: number | string,
    options?: Intl.NumberFormatOptions,
    fallback?: string,
  ) => string = formatNumber,
): string => {
  const { value, unit } = object
  return formatValueUnit(value as number | string, unit, options, fallback, formatter)
}

/**
 * Formats hashrate value and unit object into string
 */
export const formatHashrateUnit = (
  object: Partial<ValueUnit> = {},
  options?: Intl.NumberFormatOptions,
  fallback = FALLBACK,
): string => {
  const { value, unit } = object
  return formatValueUnit(value as number | string, unit, options, fallback, formatHashrate)
}

/**
 * Format errors to be displayed in a lists
 * including the date and time
 */
export const formatErrors = (
  errors: ErrorWithTimestamp[] | string | null | undefined,
  getFormattedDate?: (date: Date) => string,
): string => {
  if (!errors) return ''
  if (_isString(errors)) return errors

  return _map(errors, (error: unknown) => {
    const errorObj = error as { msg?: string; message?: string; timestamp?: number }
    const { msg, message, timestamp } = errorObj

    if (!timestamp) return `${msg || message}. \n`

    const dateString =
      getFormattedDate && timestamp
        ? getFormattedDate(new Date(timestamp))
        : new Date(timestamp).toLocaleString()
    return `${msg || message}\n${dateString}`
  }).join('\n\n')
}

export const formatBalance = (value: number): ValueUnit => ({
  value,
  unit: 'BTC',
  realValue: value,
})

export const formatEfficiency = (efficiencyWThs: number): ValueUnit => {
  if (!_isFinite(efficiencyWThs) || efficiencyWThs === 0) {
    return { value: null, unit: '', realValue: efficiencyWThs }
  }

  return {
    value: efficiencyWThs,
    unit: UNITS.EFFICIENCY_W_PER_TH_S,
    realValue: efficiencyWThs,
  }
}

export const formatUSD = (value: number, options?: Intl.NumberFormatOptions): ValueUnit => {
  const formatOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 4,
    ...options,
  }

  const processedValue = formatNumber(value, formatOptions)

  return { value: processedValue, unit: CURRENCY.USD_LABEL, realValue: value }
}

export const getEfficiencyString = (value: number): string => formatUnit(formatEfficiency(value))

export const formatBTC = (value: number, options?: Intl.NumberFormatOptions): ValueUnit => {
  const formatOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 5,
    ...options,
  }

  const processedValue = formatNumber(value, formatOptions)

  return { value: processedValue, unit: CURRENCY.BTC_LABEL, realValue: value }
}

export const formatMacAddress = (macAddress?: string): string =>
  macAddress ? _toUpper(macAddress) : ''

const toTitleCase = (name: string): string => _map(_words(name), _capitalize).join(' ')

export const formatPageTitle = (pathName: string): string => {
  const parts = _compact(_split(pathName, '/'))

  if (pathName === ROUTE.HOME) {
    return ROUTE_TITLES_MAP[ROUTE.DASHBOARD]
  }

  return toTitleCase(_head(parts) || '')
}

/**
 * Converts pressure from MPa to Bar (multiply by 10)
 * Returns 0 if value is not a valid number
 */
export const convertMpaToBar = (value: unknown): number => {
  if (_isNumber(value)) {
    return value * 10
  }
  return 0
}

export const formatChartDate = (
  tsRaw: number | string | null | undefined,
  withYear = true,
  customFormatTemplate?: string,
  fallback = '-',
): string => {
  if (_isNil(tsRaw)) return fallback

  const ts = Number(tsRaw)
  if (!_isFinite(ts)) return fallback

  let formatTemplate: string

  if (!_isEmpty(customFormatTemplate) && customFormatTemplate) {
    formatTemplate = customFormatTemplate
  } else if (withYear) {
    formatTemplate = 'yyyy-MM-dd'
  } else {
    formatTemplate = 'MM-dd'
  }

  return format(new Date(ts), formatTemplate)
}
