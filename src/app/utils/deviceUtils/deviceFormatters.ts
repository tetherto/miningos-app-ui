/**
 * Device formatting functions
 */
import _find from 'lodash/find'
import _isFinite from 'lodash/isFinite'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _orderBy from 'lodash/orderBy'
import _round from 'lodash/round'

import { formatHashrateUnit, formatUnit } from '../format'
import { convertUnits, UNIT_LABELS } from '../numberUtils'
import type { ValueUnit } from '../utils.types'

import { HASHRATE_LABEL_DIVISOR } from '@/constants/units'
import { UNITS } from '@/constants/units'

interface UnitDivisor {
  unit: string
  value: number
}

const allUnits = _orderBy(
  _map(HASHRATE_LABEL_DIVISOR, (value: number, unit: string) => ({ unit, value })),
  ['value'],
  ['desc'],
) as UnitDivisor[]

export const getHashrateUnit = (hashRateMHS: number, decimal = 2): ValueUnit => {
  if (!_isFinite(hashRateMHS) || hashRateMHS === 0) {
    return { value: null, unit: '', realValue: hashRateMHS }
  }

  const absHash = Math.abs(hashRateMHS)

  const unitToUse = _find(allUnits, (item: UnitDivisor) => absHash >= item.value) || {
    unit: 'MH/s',
    value: 1,
  }

  return {
    value: _round(hashRateMHS / unitToUse.value, decimal),
    unit: unitToUse.unit,
    realValue: hashRateMHS,
  }
}

export const formatPowerConsumption = (powerW: number | unknown): ValueUnit => {
  const power = _isNumber(powerW) ? powerW : 0
  if (!_isFinite(power)) {
    return { value: null, unit: '', realValue: power }
  }

  if (Math.abs(power) >= 1e6) {
    return { value: power / 1e6, unit: UNITS.ENERGY_MW, realValue: power }
  }

  if (Math.abs(power) >= 1e3) {
    return { value: power / 1e3, unit: UNITS.POWER_KW, realValue: power }
  }

  return { value: power, unit: UNITS.POWER_W, realValue: power }
}

export const formatEnergyConsumption = (energyWh: number): ValueUnit => {
  if (!_isFinite(energyWh)) {
    return { value: null, unit: '', realValue: energyWh }
  }

  if (Math.abs(energyWh) >= 1e9) {
    return { value: energyWh / 1e9, unit: UNITS.ENERGY_GWH, realValue: energyWh }
  }

  if (Math.abs(energyWh) >= 1e6) {
    return { value: energyWh / 1e6, unit: UNITS.ENERGY_MWH, realValue: energyWh }
  }

  if (Math.abs(energyWh) >= 1e3) {
    return { value: energyWh / 1e3, unit: UNITS.ENERGY_KWH, realValue: energyWh }
  }

  return { value: energyWh, unit: UNITS.ENERGY_WH, realValue: energyWh }
}

export const getHashrateString = (value: number): string =>
  formatHashrateUnit(getHashrateUnit(value))

export const getConsumptionString = (value: number): string =>
  formatUnit(formatPowerConsumption(value))

export const megaToTera = (mega: number): number =>
  convertUnits(mega, UNIT_LABELS.MEGA, UNIT_LABELS.TERA)

export const unitToKilo = (unit: number): number =>
  convertUnits(unit, UNIT_LABELS.DECIMAL, UNIT_LABELS.KILO)
