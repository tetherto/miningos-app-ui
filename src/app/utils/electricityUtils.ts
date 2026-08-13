import { format } from 'date-fns/format'
import _capitalize from 'lodash/capitalize'
import _ceil from 'lodash/ceil'
import _filter from 'lodash/filter'
import _flattenDeep from 'lodash/flattenDeep'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _values from 'lodash/values'

import { DATE_RANGE, DATE_RANGE_PER_HOUR } from '../../constants'

import { isStagingEnv } from './domainUtils'
import { percentage } from './numberUtils'

import { unitToKilo } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS, COLOR } from '@/constants/colors'
import { DATE_TIME_FORMAT } from '@/constants/dates'
import { PM_ATTRIBUTE_LABEL_MAP } from '@/constants/deviceConstants'
import { UNITS } from '@/constants/units'

export const W_TO_MW = 1e6
export const BTC_SATS = 1e8
export const HOURS_IN_DAY = 24
export const HASHRATE_PER_PHS = 1e9

export const MS_PER_HOUR = 1_000 * 60 * 60
export const SECONDS_PER_DAY = HOURS_IN_DAY * 60 * 60

/**
 * Convert energy data to readable format
 * @param energyDataItem
 * @param multiplier
 * @returns {number}
 */
export const convertEnergy = (energyDataItem: number, multiplier = 1): number =>
  energyDataItem * multiplier

interface EnergyDataItem {
  ts?: number
  [key: string]: unknown
}

interface EnergyDataWithLabel extends EnergyDataItem {
  label: string
}

/**
 * Convert energy data to range
 * @param energyData
 * @returns {object}
 */
export const convertEnergyToRange = (energyData: EnergyDataItem[]): EnergyDataWithLabel[] =>
  _map(
    energyData,
    (data: EnergyDataItem): EnergyDataWithLabel => ({
      ...data,
      label: `${data.ts ? format(new Date(data.ts), DATE_TIME_FORMAT) : ''}`,
    }),
  )

export const EXT_DATA_GROUP_RANGE = {
  D1: '1D',
  MONTH1: '1M',
} as const

export const getExtDataGroupRange = (
  range: (typeof DATE_RANGE)[keyof typeof DATE_RANGE] | undefined,
) => {
  switch (range) {
    case DATE_RANGE.MONTH1:
      return EXT_DATA_GROUP_RANGE.MONTH1
    case DATE_RANGE.D1:
    case DATE_RANGE.H1:
    case DATE_RANGE.M15:
    default:
      return EXT_DATA_GROUP_RANGE.D1
  }
}

export const transformStatsHistoryData = (data: unknown | unknown[]) => {
  if (!_isArray(data)) return []
  return _flattenDeep(data)
}

interface CostRevenueDataItem {
  ts?: number
  hourlyEstimates?: unknown
  [key: string]: unknown
}

export const transformCostRevenueData = (data: CostRevenueDataItem[] | unknown) => {
  if (!_isArray(data)) return []

  const flattened = _flattenDeep(data) as CostRevenueDataItem[]

  return _map(flattened, (item: CostRevenueDataItem) => {
    const { hourlyEstimates, ...rest } = item
    return {
      ...rest,
      hourly_estimates: hourlyEstimates,
    }
  })
}

export const getRangeStatsKey = (range: (typeof DATE_RANGE)[keyof typeof DATE_RANGE]) => {
  switch (range) {
    case DATE_RANGE.MONTH1:
    case DATE_RANGE.D1:
      return DATE_RANGE.H1
    default:
      return range
  }
}

const ELECTRICITY_DATA_AGGR_TIMELINES = [DATE_RANGE.D1, DATE_RANGE.MONTH1]

const getElectricityAggrGroupKey = (item: { ts: number }, timeline: string): string => {
  const date = new Date(item.ts)

  const year = date.getFullYear()

  const month = date.getMonth() + 1

  const day = timeline === DATE_RANGE.D1 ? date.getDate() : ''

  return _join([year, month, day], '-')
}

interface ElectricityDataItem {
  ts: number
  usedEnergy: number
  availableEnergy: number
  [key: string]: unknown
}

interface AggregatedElectricityDataItem extends ElectricityDataItem {
  label: string
  count: number
}

/**
 * Aggregate data based on range
 * @param data
 * @param range
 * @returns {array}
 */
export const aggregateData = (
  data: ElectricityDataItem[],
  range: string,
): (ElectricityDataItem | AggregatedElectricityDataItem)[] => {
  if (!_includes(ELECTRICITY_DATA_AGGR_TIMELINES, range)) {
    return data
  }

  const groupList: Record<string, AggregatedElectricityDataItem> = {}

  const dataSortedByTs = _sortBy(data, 'ts')

  _forEach(dataSortedByTs, (item: ElectricityDataItem) => {
    const key = getElectricityAggrGroupKey(item, range)

    const group = groupList[key]

    if (!group) {
      // Initialize if not already present
      groupList[key] = {
        ...item,
        label: key,
        count: 1,
      }
    } else {
      // Aggregate sums
      group.usedEnergy += item.usedEnergy
      group.availableEnergy += item.availableEnergy
      group.count += 1
    }
  })

  return _values(groupList)
}

interface ChartLineOptions {
  label: string
  propName: string
}

export const CHART_LINE_DEFAULT_OPTIONS: ChartLineOptions = {
  label: 'Available Energy',
  propName: 'availableEnergy',
}

interface ChartBarOptions {
  label: string
  propName: string
  color?: string
  hasFooterStats?: boolean
}

interface ChartDataset {
  type: string
  label: string
  backgroundColor: string
  data: number[]
  hasFooterStats: boolean
}

interface ChartData {
  labels: (string | undefined)[]
  datasets: ChartDataset[]
}

/**
 * Get data for chart
 * @param electricityData
 * @param lineOptions
 * @param barOptions
 * @param showUnavailableEnergy
 * @param siteEnergyDataThresholdMWh
 * @returns {object}
 */
export const prepareDataForCharts = (
  electricityData: (ElectricityDataItem & { label?: string; date?: string })[],
  lineOptions: ChartLineOptions = CHART_LINE_DEFAULT_OPTIONS,
  barOptions: ChartBarOptions,
  showUnavailableEnergy = false,
  siteEnergyDataThresholdMWh: number | null = null,
): ChartData => {
  type ElectricityDataWithLabel = ElectricityDataItem & { label?: string; date?: string }

  const filteredElectricityData = !_isNil(siteEnergyDataThresholdMWh)
    ? _filter(
        electricityData,
        (data: ElectricityDataWithLabel) =>
          (data[lineOptions.propName] as number) >= siteEnergyDataThresholdMWh,
      )
    : electricityData

  const data: ChartData = {
    labels: _map(
      filteredElectricityData,
      (data: ElectricityDataWithLabel) => data.label || data.date,
    ),
    datasets: [],
  }

  const energyDataSet: ChartDataset = {
    type: 'bar',
    label: barOptions.label,
    backgroundColor: barOptions.color || CHART_COLORS.blue,
    data: showUnavailableEnergy
      ? _map(filteredElectricityData, (data: ElectricityDataWithLabel) =>
          Math.max(0, data.availableEnergy || 0),
        )
      : _map(filteredElectricityData, (data: ElectricityDataWithLabel) => data.usedEnergy || 0),
    hasFooterStats: !!barOptions.hasFooterStats,
  }

  data.datasets.push(energyDataSet)

  return data
}

export const UTE_ENERGY_AGGR_PATH = {
  datasetsKey: 'energy',
  valueKey: 'availableEnergy',
}

export const getUteEnergyAggrDataset = (
  dataEntry: UnknownRecord,
  datasetsKey = UTE_ENERGY_AGGR_PATH.datasetsKey,
): UnknownRecord => {
  const datasets = _get(dataEntry, datasetsKey, []) as UnknownRecord[]

  return _head(datasets) || {}
}

interface UteEnergyAggrOptions {
  datasetsKey?: string
  valueKey?: string
}

export const getUteEnergyAggrValue = (
  dataEntry: UnknownRecord,
  {
    datasetsKey = UTE_ENERGY_AGGR_PATH.datasetsKey,
    valueKey = UTE_ENERGY_AGGR_PATH.valueKey,
  }: UteEnergyAggrOptions = UTE_ENERGY_AGGR_PATH,
): number | undefined => {
  const dataset = getUteEnergyAggrDataset(dataEntry, datasetsKey)

  return _get(dataset, valueKey) as number | undefined
}

// should be ZERO but now set to ONE per staging env for testing purposes
const UTE_UP_MIN_VALUE = isStagingEnv() ? 1 : 0

interface UteEnergyStats {
  hoursUp: number
  hoursUpPerc: number
  hoursDown: number
  hoursDownPerc: number
}

export const getUteEnergyUpAndDownHourStats = (
  items: UnknownRecord[],
  timeline: string = DATE_RANGE.H1,
): UteEnergyStats | null => {
  const itemsCount = _size(items)

  const freqCountPerHour = DATE_RANGE_PER_HOUR[timeline as keyof typeof DATE_RANGE_PER_HOUR]

  if (!freqCountPerHour || !itemsCount) {
    return null
  }

  const totalHours = itemsCount / freqCountPerHour

  const hoursUp = _reduce(
    items,
    (acc: number, item: UnknownRecord) => {
      const uteValue = getUteEnergyAggrValue(item)

      if (!uteValue || uteValue < UTE_UP_MIN_VALUE) {
        return acc
      }

      return acc + 1 / freqCountPerHour
    },
    0,
  )

  const hoursDown = totalHours - hoursUp

  const hoursUpPerc = percentage(hoursUp, totalHours, true)

  return {
    hoursUp,
    hoursUpPerc,
    hoursDown,
    hoursDownPerc: 1 - hoursUpPerc,
  }
}

interface DateRange {
  start: number
  end: number
}

export const getUteQueryItemsLimit = (
  dateRange: DateRange,
  timeline: string = DATE_RANGE.H1,
): number => {
  const distanceMs = dateRange.end - dateRange.start

  const distanceHours = distanceMs / MS_PER_HOUR

  const itemsLimitFloat =
    distanceHours * DATE_RANGE_PER_HOUR[timeline as keyof typeof DATE_RANGE_PER_HOUR]

  return _ceil(itemsLimitFloat)
}

const POWERMETER_UNIT_MAP: Record<string, string> = {
  power_w: UNITS.POWER_KW,
  active_power_total_w: UNITS.POWER_KW,
  reactive_power_total_var: UNITS.POWER_KW,
  v1_n_v: UNITS.VOLTAGE_V,
  v2_n_v: UNITS.VOLTAGE_V,
  v3_n_v: UNITS.VOLTAGE_V,
  v1_v2_v: UNITS.VOLTAGE_V,
  v2_v3_v: UNITS.VOLTAGE_V,
  v3_v1_v: UNITS.VOLTAGE_V,
  i1_a: UNITS.AMPERE,
  i2_a: UNITS.AMPERE,
  i3_a: UNITS.AMPERE,
  in_a: UNITS.AMPERE,
}

interface PowerMeterData {
  power_w?: number
  powermeter_specific?: Record<string, number>
}

interface ProcessedPowerMeterItem {
  title: string
  value: string
  unit: string
  color?: string
}

export const processPowerMeterData = (data: PowerMeterData = {}): ProcessedPowerMeterItem[] => {
  const result: ProcessedPowerMeterItem[] = []

  if (_isNumber(data.power_w) && POWERMETER_UNIT_MAP.power_w) {
    result.push({
      title: 'Power',
      value: formatNumber(unitToKilo(data.power_w)),
      unit: POWERMETER_UNIT_MAP.power_w,
    })
  }

  for (const [key, value] of Object.entries(data.powermeter_specific || {})) {
    const unit = POWERMETER_UNIT_MAP[key]
    if (!unit || !_isNumber(value)) continue

    const formatter = unit === UNITS.POWER_KW ? unitToKilo : (val: number) => val

    const title = _capitalize(key.replace(/_/g, ' '))

    result.push({
      title: _get(PM_ATTRIBUTE_LABEL_MAP, title, title) as string,
      value: formatNumber(formatter(value)),
      color: COLOR.WHITE,
      unit,
    })
  }

  return result
}

export const toMW = (watts: number) => watts / W_TO_MW
export const toMWh = (watts: number) => toMW(watts) * HOURS_IN_DAY
export const toPHS = (hashrate: number) => hashrate / HASHRATE_PER_PHS

export interface CurtailmentResult {
  curtailmentMWh: number
  curtailmentRate: number
}

/**
 * Calculates curtailment in MWh and curtailment rate for sites.
 *
 * @description
 * Curtailment represents the difference between nominal available power and actual used energy.
 *
 * **Formulas:**
 * - `powerConsumptionInMWh = powerConsumption in MW * hours in each period`
 * - `curtailmentMWh = nominalAvailablePowerMWh - usedEnergy`
 * - `curtailmentRate = curtailmentMWh / powerConsumptionInMWh`
 *
 * If curtailment rate is negative (used energy exceeds nominal available), it is clamped to 0.
 *
 * @param usedEnergy - The actual used energy in Wh
 * @param nominalAvailablePowerMWh - The nominal available power in MWh for the period
 * @param powerConsumptionMW - The power consumption in MW
 * @param hoursInPeriod - The number of hours in the period
 */
export const calculateCurtailment = (
  usedEnergy: number,
  nominalAvailablePowerMWh: number,
  powerConsumptionMW: number,
  hoursInPeriod: number,
): CurtailmentResult => {
  const usedEnergyInMWh = toMWh(usedEnergy)
  const powerConsumptionInMWh = powerConsumptionMW * hoursInPeriod
  const curtailmentMWh = nominalAvailablePowerMWh - usedEnergyInMWh
  let curtailmentRate = curtailmentMWh / powerConsumptionInMWh

  if (curtailmentRate < 0) {
    curtailmentRate = 0
  }

  return { curtailmentMWh, curtailmentRate }
}
