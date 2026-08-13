import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _reduce from 'lodash/reduce'

import { megaToTera } from '../../../app/utils/deviceUtils'
import { formatNumber } from '../../../app/utils/format'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MinersStatus {
  active?: number
  [key: string]: unknown
}

export const getTotalMiners = (
  minersStatus: MinersStatus | UnknownRecord | undefined,
  nominalValue: number | null | undefined,
): string => {
  const hasActiveValue = _isNumber(minersStatus?.active) || _isString(minersStatus?.active)
  const minersActive = hasActiveValue ? formatNumber(minersStatus.active as string | number) : '-'
  const minersTotal = _isNumber(nominalValue) ? formatNumber(nominalValue) : '-'

  return `${minersActive} / ${minersTotal}`
}

export const getEfficiencyStat = (
  powerW: number | undefined,
  hashrateMHS: number | undefined,
): number => {
  if (!powerW || !hashrateMHS) return 0

  return powerW / megaToTera(hashrateMHS)
}

interface AlertsAggr {
  high?: number
  medium?: number
  critical?: number
}

interface EntryWithAlerts {
  alerts_aggr?: AlertsAggr
  [key: string]: unknown
}

export const getTotalAlerts = (
  minerEntry: EntryWithAlerts | UnknownRecord | null | undefined,
  powerMeterLogEntry: EntryWithAlerts | UnknownRecord | null | undefined,
  containerEntry: EntryWithAlerts | UnknownRecord | null | undefined,
): AlertsAggr => {
  const sumObject = _reduce(
    [minerEntry, powerMeterLogEntry, containerEntry],
    (acc, currentObject) => {
      const alertsAggr = (currentObject?.alerts_aggr as AlertsAggr | undefined) || {}
      const { high, medium, critical } = alertsAggr

      acc.alerts_aggr.high += high || 0
      acc.alerts_aggr.medium += medium || 0
      acc.alerts_aggr.critical += critical || 0

      return acc
    },
    { alerts_aggr: { high: 0, medium: 0, critical: 0 } },
  )

  return sumObject?.alerts_aggr || {}
}
