import { format } from 'date-fns/format'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _sumBy from 'lodash/sumBy'

import { formatPowerConsumption, getHashrateUnit } from '@/app/utils/deviceUtils'
import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS, COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import { ChartLegend, MultiSiteDateRange } from '@/types'

interface ChartConfig {
  title: string
  propName: string
  unit?: string
  nominalKey?: string
  legend: ChartLegend[]
  yTicksFormatter: (value: number) => string
}

interface RegionLog {
  hashrate?: number
  [key: string]: unknown
}

export interface RegionData {
  region?: string
  summary?: {
    avg?: {
      hashrate?: number
    }
  }
  log?: RegionLog[]
}

export interface HashrateData {
  regions?: RegionData[]
}

export interface CardData {
  title: string
  value: number
  color: string
}

const formatDate = (date?: string | number | Date): string | null => {
  if (!date) return null
  return format(new Date(date), 'yyyy-MM-dd')
}

export const getSiteOperationConfigStart = (dateRange?: MultiSiteDateRange): Date | undefined =>
  dateRange?.start ? new Date(dateRange.start) : undefined

export const getSiteOperationConfigEnd = (
  dateRange?: MultiSiteDateRange,
): string | null | undefined => (dateRange?.end ? formatDate(dateRange.end) : undefined)

export const getPeriodLabelPrefix = (period?: string): string =>
  period === PERIOD.MONTHLY ? 'Monthly' : 'Daily'

export const SITE_OPERATION_CHART_CONFIG: Record<string, ChartConfig> = {
  hashrate: {
    title: 'Total Hashrate',
    propName: 'hashrate',
    unit: UNITS.HASHRATE_PH_S,
    nominalKey: 'nominalHashrate',
    legend: [
      { color: CHART_COLORS.METALLIC_BLUE, label: 'Total Hashrate' },
      { color: CHART_COLORS.red, label: 'Installed Nominal Hashrate' },
    ],
    yTicksFormatter: (value) => (value ? String(getHashrateUnit(value).value) : '0'),
  },
  hashprice: {
    title: 'Avg Network Hashprice',
    propName: 'hashprice',
    unit: CURRENCY.USD_LABEL,
    legend: [{ color: CHART_COLORS.METALLIC_BLUE, label: 'Network Average Hashprice' }],
    yTicksFormatter: (value) => (value ? String(getHashrateUnit(value).value) : '0'),
  },
  efficiency: {
    title: 'Efficiency',
    propName: 'efficiency',
    unit: `${UNITS.POWER_W}/${UNITS.HASHRATE_TH_S}`,
    nominalKey: 'nominalEfficiency',
    legend: [
      { color: CHART_COLORS.METALLIC_BLUE, label: 'Actual Sites Efficiency' },
      { color: CHART_COLORS.red, label: 'Nominal Miners Efficiency' },
    ],
    yTicksFormatter: (value) => (value ? String(getHashrateUnit(value).value) : '0'),
  },
  miners: {
    title: 'Miners',
    propName: 'workers',
    nominalKey: 'nominalMinerCapacity',
    legend: [
      { color: CHART_COLORS.METALLIC_BLUE, label: 'Average Active Miners' },
      { color: CHART_COLORS.red, label: 'Total Miner Capacity' },
    ],
    yTicksFormatter: (val) => formatNumber(val, { maximumFractionDigits: 0 }),
  },
  consumption: {
    title: 'Power Consumption',
    propName: 'consumption',
    unit: UNITS.ENERGY_MW,
    nominalKey: 'availablePower',
    legend: [
      { color: CHART_COLORS.METALLIC_BLUE, label: 'Daily Average Power Consumption' },
      { color: CHART_COLORS.red, label: 'Daily Average Power Availability' },
    ],
    yTicksFormatter: (value) =>
      value
        ? formatNumber(formatPowerConsumption(value).value as number, { maximumFractionDigits: 4 })
        : '0',
  },
}

/**
 * Transforms hashrate data from API into cards format
 */
export const transformHashrateDataToCards = (
  data?: HashrateData,
  totalOnly = false,
): CardData[] => {
  if (!data?.regions || !_isArray(data.regions)) {
    return []
  }

  const cards: CardData[] = []

  const totalAvgHashrate = _sumBy(data.regions, (region: RegionData) => {
    if (region.summary?.avg?.hashrate) {
      return region.summary.avg.hashrate
    }

    if (region.log && _isArray(region.log)) {
      const sum = _sumBy(region.log, 'hashrate')
      return region.log.length ? sum / region.log.length : 0
    }

    return 0
  })

  // Add total average hashrate card
  cards.push({
    title: 'Total Avg Hashrate',
    value: totalAvgHashrate,
    color: COLOR.COLD_ORANGE,
  })

  if (totalOnly) {
    return cards
  }

  _forEach(data.regions, (region: RegionData) => {
    if (region.region && region.log && _isArray(region.log)) {
      const regionHashrateSum = _sumBy(region.log, 'hashrate') || 0

      cards.push({
        title: `${region.region} Hashrate`,
        value: regionHashrateSum,
        color: COLOR.WHITE,
      })
    }
  })

  return cards
}
