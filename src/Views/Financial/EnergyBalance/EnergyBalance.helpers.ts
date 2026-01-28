import _forEach from 'lodash/forEach'
import _groupBy from 'lodash/groupBy'
import _isNil from 'lodash/isNil'
import _isString from 'lodash/isString'
import _lt from 'lodash/lt'
import _map from 'lodash/map'
import _meanBy from 'lodash/meanBy'
import _sortBy from 'lodash/sortBy'
import _sumBy from 'lodash/sumBy'

import { getPeriodKey } from '../common/financial.helpers'
import { PeriodType } from '../common/financial.types'

import type {
  AggregatedEnergyPeriodData,
  DailyEnergyData,
  EnergyCostMetrics,
  EnergyRevenueMetrics,
  MinerpoolTransactionData,
  PowerMeterData,
} from './EnergyBalance.types'

import { calculateCurtailment, toMW, toMWh } from '@/app/utils/electricityUtils'
import { formatNumber } from '@/app/utils/format'
import { calculateTransactionSum } from '@/app/utils/transactionUtils'
import { CHART_COLORS } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import type { ElectricityDataEntry, MinerHistoricalPrice, ProductionCostData } from '@/types'

const AVAILABLE_POWER_MW = 22.5

export const calculateOperationalIssues = (
  electricityEntry: ElectricityDataEntry,
  consumptionMW: number,
  hoursInPeriod: number,
): number => {
  const powerConsumptionInMWh = consumptionMW * hoursInPeriod
  const availableEnergyInMWh = toMWh(electricityEntry.energy.availableEnergy)
  const operationalIssues = (availableEnergyInMWh - powerConsumptionInMWh) / availableEnergyInMWh

  if (_lt(operationalIssues, 0)) {
    return 0
  }

  return operationalIssues
}

/**
 * Merge all data sources into daily data
 */
export const mergeDailyData = (
  transactions: MinerpoolTransactionData[],
  prices: MinerHistoricalPrice[],
  costs: ProductionCostData[],
  powerData: PowerMeterData | null,
  electricityData: ElectricityDataEntry[],
  nominalAvailablePowerMWh: number,
  hoursInPeriod: number,
): DailyEnergyData[] => {
  // Create a map of prices by timestamp
  const priceMap = new Map<number, number>()
  let fallbackPrice: number | null = null

  _forEach(prices, (price) => {
    // Try to extract historical price data (ts + priceUSD)
    if (price.ts && price.priceUSD) {
      // Normalize to start of day
      const dayTs = new Date(price.ts).setHours(0, 0, 0, 0)
      priceMap.set(dayTs, price.priceUSD)
    }
    // Fallback: if API returns current price data instead (for future dates)
    else if (price?.currentPrice && !fallbackPrice) {
      fallbackPrice = price.currentPrice
    }
  })

  // Create a map of power consumption by timestamp
  const powerMap = new Map<number, number>()
  if (powerData?.data) {
    _forEach(powerData.data, (entry) => {
      const dayTs = new Date(entry.ts).setHours(0, 0, 0, 0)
      const powerMW = toMW(entry.val?.site_power_w || 0)
      powerMap.set(dayTs, powerMW)
    })
  }

  // Create a map of electricity data by timestamp
  const electricityMap = new Map<number, ElectricityDataEntry>()
  _forEach(electricityData, (entry) => {
    const dayTs = new Date(entry.ts).setHours(0, 0, 0, 0)
    electricityMap.set(dayTs, entry)
  })

  // Create a map of costs by month
  const costsMap = new Map<string, { energyCosts: number; operationalCosts: number }>()
  _forEach(costs, ({ year, month, energyCost: energyCosts, operationalCost: operationalCosts }) => {
    const key = `${year}-${month}`
    costsMap.set(key, { energyCosts, operationalCosts })
  })

  // Process transactions to create daily data
  const dailyData: DailyEnergyData[] = []

  _forEach(transactions, (txData) => {
    const ts = _isString(txData.ts) ? parseInt(txData.ts, 10) : txData.ts
    const dayTs = new Date(ts).setHours(0, 0, 0, 0)

    // Calculate revenue from transactions
    const { revenueBTC, feesBTC } = calculateTransactionSum(txData.transactions)

    // Get price for this day (use fallback if historical not available)
    const priceUSD = priceMap.get(dayTs) || fallbackPrice || 0

    // Get power consumption
    const sitePowerMW = powerMap.get(dayTs) || 0

    // Get electricity data for curtailment calculation
    const electricityEntry = electricityMap.get(dayTs)
    const { curtailmentMWh, curtailmentRate } = electricityEntry
      ? calculateCurtailment(
          electricityEntry.energy.usedEnergy,
          nominalAvailablePowerMWh,
          sitePowerMW,
          hoursInPeriod,
        )
      : { curtailmentMWh: 0, curtailmentRate: 0 }
    const operationalIssues = electricityEntry
      ? calculateOperationalIssues(electricityEntry, sitePowerMW, hoursInPeriod)
      : 0

    // Get costs for this month
    const date = new Date(ts)
    const costKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    const monthCosts = costsMap.get(costKey)
    // Pro-rate monthly costs to daily (divide by ~30)
    const dailyEnergyCosts = (monthCosts?.energyCosts || 0) / 30
    const dailyOperationalCosts = (monthCosts?.operationalCosts || 0) / 30

    dailyData.push({
      ts: dayTs,
      revenueBTC,
      feesBTC,
      priceUSD,
      sitePowerMW,
      energyCostsUSD: dailyEnergyCosts,
      operationalCostsUSD: dailyOperationalCosts,
      curtailmentMWh,
      curtailmentRate, // Store the rate (0 to 1)
      operationalIssues,
    })
  })

  return _sortBy(dailyData, 'ts')
}

/**
 * Aggregate daily data by period
 */
export const aggregateByPeriod = (
  dailyData: DailyEnergyData[],
  periodType: PeriodType,
  currentBTCPrice: number,
): AggregatedEnergyPeriodData[] => {
  if (!dailyData || dailyData.length === 0) return []

  // Add period key to each entry
  const entriesWithPeriod = _map(dailyData, (entry) => ({
    ...entry,
    periodKey: getPeriodKey(entry.ts, periodType),
  }))

  // Group by period
  const grouped = _groupBy(entriesWithPeriod, 'periodKey')

  // Aggregate each group
  const aggregated: AggregatedEnergyPeriodData[] = []

  _forEach(grouped, (entries, period) => {
    const revenueBTC = _sumBy(entries, 'revenueBTC')
    const avgPriceUSD = _meanBy(entries, 'priceUSD') || currentBTCPrice
    const revenueUSD = revenueBTC * avgPriceUSD
    const sitePowerMW = _meanBy(entries, 'sitePowerMW') || 0
    const energyCostsUSD = _sumBy(entries, 'energyCostsUSD')
    const operationalCostsUSD = _sumBy(entries, 'operationalCostsUSD')
    const totalCostsUSD = energyCostsUSD + operationalCostsUSD

    // Energy revenue per MW
    const energyRevenueBTC_MW = sitePowerMW > 0 ? revenueBTC / sitePowerMW : 0
    const energyRevenueUSD_MW = sitePowerMW > 0 ? revenueUSD / sitePowerMW : 0

    // Downtime rates (average of daily rates, which are 0 to 1)
    const curtailmentRate = _meanBy(entries, 'curtailmentRate') || 0
    const operationalIssuesRate = _meanBy(entries, 'operationalIssues') || 0

    aggregated.push({
      period,
      ts: entries[0].ts,
      revenueBTC,
      revenueUSD,
      energyRevenueBTC_MW,
      energyRevenueUSD_MW,
      totalCostsUSD,
      energyCostsUSD,
      operationalCostsUSD,
      sitePowerMW,
      curtailmentRate,
      operationalIssuesRate,
    })
  })

  return _sortBy(aggregated, 'ts')
}

// Formatter for bar data labels
const barLabelFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'

  return formatNumber(value)
}

// Formatter for USD bar data labels (no decimals)
const usdBarLabelFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'

  return formatNumber(value, { maximumFractionDigits: 0 })
}

// Formatter for USD bar data labels that may require decimals (e.g. USD/MWh)
const usdBarLabelFormatterWithDecimals = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'
  return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Formatter for rate/percentage data labels (shows small decimal values)
const rateLabelFormatter = (value: number) =>
  formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 4 })

// Formatter for BTC bar data labels with more decimal places
const btcBarLabelFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'

  return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 6 })
}

/**
 * Transform aggregated data to Site Energy Revenue chart format
 * Returns both USD and BTC revenue data for toggle support
 */
export const transformToEnergyRevenueChartData = (
  aggregatedData: AggregatedEnergyPeriodData[],
  displayMode: typeof CURRENCY.USD_LABEL | typeof CURRENCY.BTC_LABEL = CURRENCY.USD_LABEL,
) => {
  const labels = _map(aggregatedData, 'period')
  const revenueValuesUSD = _map(aggregatedData, 'energyRevenueUSD_MW')
  const revenueValuesBTC = _map(aggregatedData, 'energyRevenueBTC_MW')

  const values = displayMode === CURRENCY.USD_LABEL ? revenueValuesUSD : revenueValuesBTC

  return {
    labels,
    series: [
      {
        label:
          displayMode === CURRENCY.USD_LABEL
            ? 'Revenue (USD/MWh)'
            : `Revenue (${CURRENCY.BTC_LABEL}/MWh)`,
        values,
        color: CHART_COLORS.red,
        datalabels: {
          formatter:
            displayMode === CURRENCY.USD_LABEL
              ? usdBarLabelFormatterWithDecimals
              : btcBarLabelFormatter,
        },
      },
    ],
  }
}

/**
 * Transform aggregated data to Downtime chart format
 */
export const transformToDowntimeChartData = (aggregatedData: AggregatedEnergyPeriodData[]) => {
  const labels = _map(aggregatedData, 'period')
  const curtailmentValues = _map(aggregatedData, 'curtailmentRate')
  const operationalIssuesValues = _map(aggregatedData, 'operationalIssuesRate')

  return {
    labels,
    series: [
      {
        label: 'Curtailment',
        values: curtailmentValues,
        color: CHART_COLORS.purple,
        stack: 'stack1',
        datalabels: { formatter: rateLabelFormatter },
      },
      {
        label: 'Op. Issues',
        values: operationalIssuesValues,
        color: CHART_COLORS.blue,
        stack: 'stack1',
        datalabels: { formatter: rateLabelFormatter },
      },
    ],
  }
}

/**
 * Transform aggregated data to Power LINE chart format
 * Returns data formatted for ThresholdLineChart
 */
export const transformToPowerChartData = (aggregatedData: AggregatedEnergyPeriodData[]) => {
  // Format for ThresholdLineChart: series with points [{ts, value}], constants with value
  const powerPoints = _map(aggregatedData, (d) => ({
    ts: d.ts,
    value: d.sitePowerMW,
  }))

  return {
    series: [
      {
        label: 'Power Consumption',
        points: powerPoints,
        color: CHART_COLORS.orange,
      },
    ],
    constants: [
      {
        label: 'Power Availability',
        value: AVAILABLE_POWER_MW,
        color: CHART_COLORS.green,
        style: { borderDash: [5, 5] },
      },
    ],
  }
}

const BTC_SATS = 100_000_000
const SATS_THRESHOLD = 100_000 // Above this, display in BTC instead of Sats

/**
 * Transform aggregated data to Site Energy vs Cost chart format
 * Shows Revenue vs All-In Cost per MWh
 * Bars displayed side by side (not stacked)
 * When BTC mode: shows Sats if max < 100k, otherwise BTC
 */
export const transformToEnergyCostChartData = (
  aggregatedData: AggregatedEnergyPeriodData[],
  displayMode: typeof CURRENCY.USD_LABEL | typeof CURRENCY.BTC_LABEL = CURRENCY.USD_LABEL,
) => {
  const labels = _map(aggregatedData, 'period')

  // Revenue per MW (already available in aggregated data)
  const revenueValuesUSD = _map(aggregatedData, 'energyRevenueUSD_MW')
  const revenueValuesSats = _map(aggregatedData, (d) => d.energyRevenueBTC_MW * BTC_SATS)

  // All-In Cost per MW (totalCosts / sitePowerMW)
  const allInCostValuesUSD = _map(aggregatedData, (d) =>
    d.sitePowerMW > 0 ? d.totalCostsUSD / d.sitePowerMW : 0,
  )
  // For Sats: convert USD cost to BTC using derived price, then to Sats
  const allInCostValuesSats = _map(aggregatedData, (d) => {
    if (d.sitePowerMW <= 0 || d.revenueBTC <= 0) return 0
    const derivedPriceUSD = d.revenueUSD / d.revenueBTC
    const costPerMW = d.totalCostsUSD / d.sitePowerMW
    return (costPerMW / derivedPriceUSD) * BTC_SATS
  })

  if (displayMode === CURRENCY.USD_LABEL) {
    return {
      labels,
      series: [
        {
          label: 'All-In Cost',
          values: allInCostValuesUSD,
          color: CHART_COLORS.orange,
          datalabels: { formatter: usdBarLabelFormatter },
        },
        {
          label: 'Revenue',
          values: revenueValuesUSD,
          color: CHART_COLORS.SKY_BLUE,
          datalabels: { formatter: usdBarLabelFormatter },
        },
      ],
      btcUnit: null,
    }
  }

  // BTC mode: check if max value exceeds threshold
  const maxSatsValue = Math.max(...revenueValuesSats, ...allInCostValuesSats)
  const useBTC = maxSatsValue >= SATS_THRESHOLD

  // If above threshold, convert to BTC; otherwise keep as Sats
  const revenueValues = useBTC ? _map(revenueValuesSats, (v) => v / BTC_SATS) : revenueValuesSats
  const costValues = useBTC ? _map(allInCostValuesSats, (v) => v / BTC_SATS) : allInCostValuesSats
  const formatter = useBTC ? btcBarLabelFormatter : barLabelFormatter

  return {
    labels,
    series: [
      {
        label: 'All-In Cost',
        values: costValues,
        color: CHART_COLORS.orange,
        datalabels: { formatter },
      },
      {
        label: 'Revenue',
        values: revenueValues,
        color: CHART_COLORS.SKY_BLUE,
        datalabels: { formatter },
      },
    ],
    btcUnit: useBTC ? CURRENCY.BTC_LABEL : CURRENCY.SATS,
  }
}

/**
 * Transform aggregated data to Power LINE chart format for Cost tab
 * Uses different colors: blue for consumption, red for availability
 */
export const transformToPowerChartDataCostTab = (aggregatedData: AggregatedEnergyPeriodData[]) => {
  const powerPoints = _map(aggregatedData, (d) => ({
    ts: d.ts,
    value: d.sitePowerMW,
  }))

  return {
    series: [
      {
        label: 'Power Consumption',
        points: powerPoints,
        color: CHART_COLORS.blue,
      },
    ],
    constants: [
      {
        label: 'Power Availability',
        value: AVAILABLE_POWER_MW,
        color: CHART_COLORS.red,
        style: { borderDash: [5, 5] },
      },
    ],
  }
}

/**
 * Calculate Energy Revenue tab metrics
 */
export const calculateEnergyRevenueMetrics = (
  aggregatedData: AggregatedEnergyPeriodData[],
): EnergyRevenueMetrics => {
  const curtailmentRate = _meanBy(aggregatedData, 'curtailmentRate') || 0
  const operationalIssuesRate = _meanBy(aggregatedData, 'operationalIssuesRate') || 0

  return {
    curtailmentRate: curtailmentRate * 100, // Convert to percentage
    operationalIssuesRate: operationalIssuesRate * 100,
  }
}

/**
 * Calculate Energy Cost tab metrics
 */
export const calculateEnergyCostMetrics = (
  aggregatedData: AggregatedEnergyPeriodData[],
): EnergyCostMetrics => {
  const avgPowerConsumption = _meanBy(aggregatedData, 'sitePowerMW') || 0
  const totalEnergyCosts = _sumBy(aggregatedData, 'energyCostsUSD') || 0
  const totalOperationalCosts = _sumBy(aggregatedData, 'operationalCostsUSD') || 0
  const totalRevenue = _sumBy(aggregatedData, 'revenueUSD') || 0
  const totalPower = _sumBy(aggregatedData, 'sitePowerMW') || 1

  return {
    avgPowerConsumption,
    avgEnergyCost: totalEnergyCosts / totalPower,
    avgAllInCost: (totalEnergyCosts + totalOperationalCosts) / totalPower,
    avgPowerAvailability: AVAILABLE_POWER_MW,
    avgOperationsCost: totalOperationalCosts / totalPower,
    avgEnergyRevenue: totalRevenue / totalPower,
  }
}
