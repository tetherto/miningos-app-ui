import _compact from 'lodash/compact'
import _every from 'lodash/every'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _some from 'lodash/some'
import { useState } from 'react'

import { getPeriodType } from '../common/financial.helpers'
import { useCurrentBTCPrice } from '../common/useCurrentBTCPrice'
import { useElectricityCurtailmentData } from '../common/useElectricityCurtailmentData'
import { useFinancialDateRange } from '../common/useFinancialDateRange'
import { useHistoricalBTCPrices } from '../common/useHistoricalBTCPrices'
import { useMinerpoolTransactions } from '../common/useMinerpoolTransactions'
import { usePowerConsumption } from '../common/usePowerConsumption'
import { useProductionCosts } from '../common/useProductionCosts'

import {
  aggregateByPeriod,
  calculateEnergyCostMetrics,
  calculateEnergyRevenueMetrics,
  mergeDailyData,
  transformToDowntimeChartData,
  transformToEnergyCostChartData,
  transformToEnergyRevenueChartData,
  transformToPowerChartData,
  transformToPowerChartDataCostTab,
} from './EnergyBalance.helpers'
import type {
  EnergyBalanceTab,
  MinerpoolTransactionData,
  PowerMeterData,
} from './EnergyBalance.types'

import { MS_PER_HOUR } from '@/app/utils/electricityUtils'
import { CURRENCY } from '@/constants/units'
import { useNominalConfigValues } from '@/hooks/useNominalConfigValues'
import type { ElectricityDataEntry } from '@/types'

type RevenueDisplayMode = typeof CURRENCY.USD_LABEL | typeof CURRENCY.BTC_LABEL

const useEnergyBalance = () => {
  const { dateRange, handleRangeChange } = useFinancialDateRange()
  const [activeTab, setActiveTab] = useState<EnergyBalanceTab>('revenue')
  const [revenueDisplayMode, setRevenueDisplayMode] = useState<RevenueDisplayMode>(
    CURRENCY.USD_LABEL,
  )
  const [costDisplayMode, setCostDisplayMode] = useState<RevenueDisplayMode>(CURRENCY.USD_LABEL)
  const periodType = getPeriodType(dateRange)

  const { start, end } = dateRange || {}
  const hoursInPeriod = start && end ? (end - start) / MS_PER_HOUR : 0

  // Minerpool transactions (revenue data)
  const transactionsResponse = useMinerpoolTransactions(dateRange!)

  // Historical BTC prices
  const pricesResponse = useHistoricalBTCPrices(dateRange!)

  // Current BTC price
  const currentBTCResponse = useCurrentBTCPrice()

  // Production costs
  const productionCostsResponse = useProductionCosts()

  // Power consumption (tail log range aggr)
  const powerResponse = usePowerConsumption(dateRange!)

  // Electricity/Curtailment data
  const electricityResponse = useElectricityCurtailmentData(dateRange!)

  const { nominalAvailablePowerMWh, isLoading: isNominalConfigValuesLoading } =
    useNominalConfigValues()

  const isLoading =
    _some(
      [
        transactionsResponse,
        pricesResponse,
        currentBTCResponse,
        productionCostsResponse,
        powerResponse,
        electricityResponse,
      ],
      ({ isLoading }) => isLoading,
    ) || isNominalConfigValuesLoading

  const errors = _compact(
    _map(
      [
        [transactionsResponse.error, 'Transactions data failed'],
        [pricesResponse.error, 'Price data failed'],
        [currentBTCResponse.error, 'Current BTC data failed'],
        [productionCostsResponse.error, 'Production costs data failed'],
        [powerResponse.error, 'Power data failed'],
        [electricityResponse.error, 'Electricity data failed'],
      ],
      ([error, message]) => error && message,
    ),
  )

  const hasEveryData = _every(
    [
      transactionsResponse,
      pricesResponse,
      currentBTCResponse,
      productionCostsResponse,
      powerResponse,
      electricityResponse,
    ],
    ({ data }) => data,
  )

  const { data: transactionsData } = transactionsResponse
  const { data: pricesData } = pricesResponse
  const { data: productionCostsData } = productionCostsResponse
  const { data: powerData } = powerResponse
  const { data: electricityData } = electricityResponse
  const { currentBTCPrice } = currentBTCResponse

  // Process and aggregate data
  const processData = () => {
    if (!hasEveryData || !dateRange || currentBTCPrice === 0) {
      return {
        aggregatedData: [],
        revenueMetrics: null,
        costMetrics: null,
      }
    }

    // Extract nested array data
    const transactions = (_isArray(transactionsData) && transactionsData[0]) || []
    const prices = (_isArray(pricesData) && pricesData[0]) || []
    const costs = _isArray(productionCostsData) ? productionCostsData : []

    // Extract power data - it's nested: powerData[0][0] contains { type: 'powermeter', data: [...] }
    let powerMeterData: PowerMeterData | null = null
    if (_isArray(powerData)) {
      for (const item of powerData) {
        if (_isArray(item)) {
          const found = item.find((d: { type?: string }) => d?.type === 'powermeter')
          if (found) {
            powerMeterData = found as PowerMeterData
            break
          }
        } else if (item?.type === 'powermeter') {
          powerMeterData = item as PowerMeterData
          break
        }
      }
    }

    // Extract electricity data
    const electricity = (_isArray(electricityData) && electricityData[0]) || []

    // Merge all data sources into daily data
    const dailyData = mergeDailyData(
      transactions as MinerpoolTransactionData[],
      prices,
      costs,
      powerMeterData || null,
      electricity as ElectricityDataEntry[],
      nominalAvailablePowerMWh,
      hoursInPeriod,
    )

    // Aggregate by period
    const aggregatedData = aggregateByPeriod(dailyData, periodType, currentBTCPrice)

    // Calculate metrics
    const revenueMetrics = calculateEnergyRevenueMetrics(aggregatedData)
    const costMetrics = calculateEnergyCostMetrics(aggregatedData)

    return {
      aggregatedData,
      revenueMetrics,
      costMetrics,
    }
  }

  const { aggregatedData, revenueMetrics, costMetrics } = processData()

  // Transform to chart data
  const energyRevenueChartData = transformToEnergyRevenueChartData(
    aggregatedData,
    revenueDisplayMode,
  )
  const downtimeChartData = transformToDowntimeChartData(aggregatedData)
  const powerChartData = transformToPowerChartData(aggregatedData)
  const powerChartDataCostTab = transformToPowerChartDataCostTab(aggregatedData)
  const energyCostChartData = transformToEnergyCostChartData(
    aggregatedData,
    costDisplayMode === CURRENCY.USD_LABEL ? 'USD' : 'BTC',
  )

  const hasData = !_isEmpty(aggregatedData)

  // Toggle revenue display mode
  const handleRevenueDisplayToggle = (mode: RevenueDisplayMode) => {
    setRevenueDisplayMode(mode)
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key as EnergyBalanceTab)
  }

  return {
    aggregatedData,
    revenueMetrics,
    costMetrics,
    energyRevenueChartData,
    downtimeChartData,
    powerChartData,
    powerChartDataCostTab,
    energyCostChartData,
    hasData,
    handleRevenueDisplayToggle,
    handleTabChange,
    isLoading,
    handleRangeChange,
    dateRange,
    periodType,
    errors,
    currentBTCPrice,
    activeTab,
    revenueDisplayMode,
    costDisplayMode,
    setRevenueDisplayMode,
    setCostDisplayMode,
    setActiveTab,
  }
}

export default useEnergyBalance
