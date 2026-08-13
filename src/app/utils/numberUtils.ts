import _includes from 'lodash/includes'
import _isFinite from 'lodash/isFinite'
import _round from 'lodash/round'

import type { UnitLabel } from './utils.types'

export const percentage = (
  partialValue: number,
  totalValue: number,
  keepOriginalRelation = false,
): number => {
  if (!partialValue || !totalValue) {
    return 0
  }

  const multiplier = keepOriginalRelation ? 1 : 100

  return (multiplier * partialValue) / totalValue
}

export const UNIT_LABELS = {
  DECIMAL: 'decimal' as const,
  KILO: 'k' as const,
  MEGA: 'M' as const,
  GIGA: 'G' as const,
  TERA: 'T' as const,
  PETA: 'P' as const,
}

export const UNIT: Record<UnitLabel, number> = {
  [UNIT_LABELS.DECIMAL]: 1,
  [UNIT_LABELS.KILO]: 1000,
  [UNIT_LABELS.MEGA]: 1000000,
  [UNIT_LABELS.GIGA]: 1000000000,
  [UNIT_LABELS.TERA]: 1000000000000,
  [UNIT_LABELS.PETA]: 1000000000000000,
}

/**
 * Convert units
 */
export const convertUnits = (
  value: number,
  fromUnit: UnitLabel = UNIT_LABELS.DECIMAL,
  toUnit: UnitLabel = UNIT_LABELS.KILO,
): number => (value * UNIT[fromUnit]) / UNIT[toUnit]

export const decimalToMegaNumber = (value: number): number =>
  convertUnits(value, UNIT_LABELS.DECIMAL, UNIT_LABELS.MEGA)

export const shouldDisplayValue = (value: number | null | undefined): boolean =>
  !_includes([NaN, null, undefined, 0], value)

export const getPercentChange = (currentValue: number, historicalValue: number): number | null => {
  if (!_isFinite(currentValue) || !_isFinite(historicalValue) || historicalValue === 0) return null

  const percentChange = _round(((currentValue - historicalValue) / historicalValue) * 100)

  return percentChange || null
}
