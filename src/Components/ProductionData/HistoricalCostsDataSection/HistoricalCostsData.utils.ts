import dayjs from 'dayjs'
import _find from 'lodash/find'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import _reduce from 'lodash/reduce'
import _reverse from 'lodash/reverse'
import _sortBy from 'lodash/sortBy'
import _sum from 'lodash/sum'
import _values from 'lodash/values'

import { getBarChartItemStyle } from '@/app/utils/chartUtils'

type BarChartItemStyle = unknown

type CostsBucket = Record<string, number>

export interface CostsEntry {
  site?: string
  month: number
  year: number
  energyCostsUSD: CostsBucket
  operationalCostsUSD: CostsBucket
  balance?: number
}

export interface BarDatum {
  month: string
  value: number
  style: BarChartItemStyle
}

type MonthKeyedValue = Record<string, { value: number; style: BarChartItemStyle }>

const BAR_STYLES_ORDERED: BarChartItemStyle[] = [
  getBarChartItemStyle('BLUE'),
  getBarChartItemStyle('YELLOW'),
  getBarChartItemStyle('GREEN'),
  getBarChartItemStyle('RED'),
  getBarChartItemStyle('VIOLET'),
  getBarChartItemStyle('ORANGE'),
]

export const getOperationalCostsByMonth = (data: CostsEntry[]): BarDatum[] => {
  const operationalCosts = _map(
    data,
    (entry: CostsEntry): BarDatum => ({
      month: `${dayjs()
        .month(entry.month - 1)
        .format('MMMM')} ${entry.year}`,
      value: _sum(_values(entry.operationalCostsUSD)),
      style: getBarChartItemStyle('GREEN'),
    }),
  )
  return operationalCosts
}

export const getEnergyCostsByMonth = (data: CostsEntry[]): BarDatum[] => {
  const energyCosts = _map(
    data,
    (entry: CostsEntry): BarDatum => ({
      month: `${dayjs()
        .month(entry.month - 1)
        .format('MMMM')} ${entry.year}`,
      value: _sum(_values(entry.energyCostsUSD)),
      style: getBarChartItemStyle('YELLOW'),
    }),
  )
  return energyCosts
}

export const getTotalCostsByMonth = (data: BarDatum[]): BarDatum[] =>
  _reduce<BarDatum, BarDatum[]>(
    data,
    (acc, entry, index) => {
      const prevEntry = acc[index - 1]

      const prevValue = prevEntry?.value ?? 0

      const currValue = entry.value ?? 0

      acc.push({
        month: entry.month,
        value: currValue + prevValue,
        style: getBarChartItemStyle('BLUE'),
      })

      return acc
    },
    [],
  )

export const getSiteCostsDataset = (data: BarDatum[][]): MonthKeyedValue[] => {
  const siteCosts = _map(
    data,
    (set: BarDatum[]): MonthKeyedValue =>
      _reduce<BarDatum, MonthKeyedValue>(
        set,
        (result, item) => {
          result[item.month] = _pick(item, ['value', 'style']) as {
            value: number
            style: BarChartItemStyle
          }
          return result
        },
        {},
      ),
  )
  return siteCosts
}

export const getEnergyCostsDataset = (keys: string[], data: CostsEntry[]): MonthKeyedValue[] => {
  const energyCosts = _map(
    keys,
    (key: string, idx: number): MonthKeyedValue =>
      _reduce<CostsEntry, MonthKeyedValue>(
        data,
        (set, entry) => {
          const month = `${dayjs()
            .month(entry.month - 1)
            .format('MMMM')} ${entry.year}`
          set[month] = { value: entry.energyCostsUSD[key], style: BAR_STYLES_ORDERED[idx] }
          return set
        },
        {},
      ),
  )
  return energyCosts
}

export const getOperationalCostsDataset = (
  keys: string[],
  data: CostsEntry[],
): MonthKeyedValue[] => {
  const operationalCosts = _map(
    keys,
    (key: string, idx: number): MonthKeyedValue =>
      _reduce<CostsEntry, MonthKeyedValue>(
        data,
        (set, entry) => {
          const month = `${dayjs()
            .month(entry.month - 1)
            .format('MMMM')} ${entry.year}`
          set[month] = { value: entry.operationalCostsUSD[key], style: BAR_STYLES_ORDERED[idx] }
          return set
        },
        {},
      ),
  )
  return operationalCosts
}

export const getCostPerBtc = (
  yearlyData: Array<Pick<CostsEntry, 'month' | 'balance'>>,
  totalCostsByMont: BarDatum[],
  energyCostsByMonth: BarDatum[],
): MonthKeyedValue[] => {
  if (_isEmpty(yearlyData)) {
    return []
  }

  const sortedMonths = _reverse(
    _sortBy(
      _map(yearlyData, ({ month }) => month),
      (month: unknown) =>
        dayjs()
          .month((month as number) - 1)
          .format('M'),
    ),
  ) as Array<string | number>

  // Extract the year from the first available cost entry
  const firstCostEntry = totalCostsByMont[0] || energyCostsByMonth[0]
  let baseYear = new Date().getFullYear()
  if (firstCostEntry?.month) {
    const yearMatch = firstCostEntry.month.match(/\d{4}/)
    if (yearMatch) {
      baseYear = parseInt(yearMatch[0], 10)
    }
  }

  // If month is 10, 11, or 12, it's from the previous year
  const getYearForMonth = (month: number): number => (month >= 10 ? baseYear - 1 : baseYear)

  const costPerBtcDataset = _map(
    ['Total Cost / BTC', 'Energy Cost / BTC'],
    (_key, idx): MonthKeyedValue =>
      _reduce<string | number, MonthKeyedValue>(
        sortedMonths,
        (set: MonthKeyedValue, month: string | number) => {
          const costsTargetArray = idx === 0 ? totalCostsByMont : energyCostsByMonth
          const yearlyEntry = _find(yearlyData, { month }) as
            | { balance?: number; [key: string]: unknown }
            | undefined
          const balance = (yearlyEntry?.balance as number) || 0
          const year = getYearForMonth(month as number)
          const monthName = `${dayjs()
            .month((month as number) - 1)
            .format('MMMM')} ${year}`
          const costsEntry = _find(costsTargetArray, { month: monthName }) as
            | { value?: number; [key: string]: unknown }
            | undefined
          const value = ((costsEntry?.value as number) || 0) / (balance || 1)
          set[monthName] = { value, style: BAR_STYLES_ORDERED[idx] }
          return set
        },
        {} as MonthKeyedValue,
      ),
  )
  return costPerBtcDataset
}
