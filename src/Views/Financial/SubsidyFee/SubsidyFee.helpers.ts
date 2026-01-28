import _isNil from 'lodash/isNil'
import _map from 'lodash/map'

import { getPeriodKey } from '../common/financial.helpers'
import { PeriodType } from '../common/financial.types'

import type { AggregatedPeriodData, MempoolBlockData } from './SubsidyFee.types'

import { formatNumber } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'

const BTC_SATS = 100000000

/**
 * Aggregate block data by period
 * @param blocks - Array of mempool block data
 * @param periodType - Type of period to aggregate by
 * @returns Array of aggregated period data
 */
export const aggregateBlocksByPeriod = (
  blocks: MempoolBlockData[],
  periodType: PeriodType,
): AggregatedPeriodData[] => {
  // Group blocks by period
  const grouped: Record<
    string,
    {
      totalSubsidySats: number
      totalFeesSats: number
      totalBlockSize: number
      blockCount: number
      firstTs: number
    }
  > = {}

  blocks.forEach((block) => {
    const periodKey = getPeriodKey(block.ts, periodType)

    if (!grouped[periodKey]) {
      grouped[periodKey] = {
        totalSubsidySats: 0,
        totalFeesSats: 0,
        totalBlockSize: 0,
        blockCount: 0,
        firstTs: block.ts,
      }
    }

    const subsidySats = block.blockReward - block.blockTotalFees

    grouped[periodKey].totalSubsidySats += subsidySats
    grouped[periodKey].totalFeesSats += block.blockTotalFees
    grouped[periodKey].totalBlockSize += block.blockSize
    grouped[periodKey].blockCount++
  })

  // Convert to array and calculate derived values
  const result = Object.entries(grouped).map(([period, data]) => {
    const subsidyBTC = data.totalSubsidySats / BTC_SATS
    const feesBTC = data.totalFeesSats / BTC_SATS
    const totalBTC = subsidyBTC + feesBTC
    const feePercent = totalBTC > 0 ? (feesBTC / totalBTC) * 100 : 0
    const avgSatsPerVByte = data.totalBlockSize > 0 ? data.totalFeesSats / data.totalBlockSize : 0

    return {
      period,
      subsidyBTC,
      feesBTC,
      feePercent,
      avgSatsPerVByte,
      blockCount: data.blockCount,
      firstTs: data.firstTs,
    }
  })

  // Sort by timestamp to ensure chronological order (oldest to newest)
  return result.sort((a, b) => a.firstTs - b.firstTs)
}

/**
 * Transform aggregated data to ThresholdBarChart format for Subsidy/Fees chart
 * @param aggregatedData - Aggregated period data
 * @returns Data object for ThresholdBarChart (stacked bars + line)
 */
export const transformToSubsidyFeesChartData = (aggregatedData: AggregatedPeriodData[]) => {
  const labels = aggregatedData.map((d) => d.period)
  const subsidyValues = aggregatedData.map((d) => d.subsidyBTC)
  const feesValues = aggregatedData.map((d) => d.feesBTC)
  const feePercentValues = aggregatedData.map((d) => d.feePercent / 100) // Convert to decimal for percentage

  // Custom formatter for stacked bar data labels
  const stackedBarFormatter = (value: number, context: unknown) => {
    // Only show label on top of stack (Fees layer)
    const isTopOfStack = (context as { datasetIndex: number })?.datasetIndex === 1

    if (!isTopOfStack) return ''
    if (_isNil(value)) return ''

    // Get total value (subsidy + fees)
    const dataIndex = (context as { dataIndex: number })?.dataIndex
    const total = subsidyValues[dataIndex] + feesValues[dataIndex]

    if (total === 0) return '0'

    // Show up to 2 decimal places, removing trailing zeros
    return formatNumber(total)
  }

  return {
    labels,
    series: [
      {
        label: 'Subsidy',
        values: subsidyValues,
        color: CHART_COLORS.blue,
        stack: 'stack1',
        datalabels: {
          formatter: stackedBarFormatter,
        },
      },
      {
        label: 'Fees',
        values: feesValues,
        color: CHART_COLORS.purple,
        stack: 'stack1',
        datalabels: {
          formatter: stackedBarFormatter,
        },
      },
    ],
    lines: [
      {
        label: 'Fee %',
        values: feePercentValues,
        color: CHART_COLORS.red,
        yAxisID: 'y1',
      },
    ],
  }
}

// Custom formatter for average fees data labels
const avgFeesFormatter = (value: number) => {
  if (_isNil(value)) return ''
  if (value === 0) return '0'

  // Show up to 2 decimal places, removing trailing zeros
  return formatNumber(value)
}

/**
 * Transform aggregated data to ThresholdBarChart format for Average Fees chart
 * @param aggregatedData - Aggregated period data
 * @returns Data object for ThresholdBarChart (simple bars)
 */
export const transformToAverageFeesChartData = (aggregatedData: AggregatedPeriodData[]) => {
  const labels = _map(aggregatedData, 'period')
  const avgFeesValues = _map(aggregatedData, 'avgSatsPerVByte')

  return {
    labels,
    series: [
      {
        label: 'Average Fees in Sats/vByte',
        values: avgFeesValues,
        color: CHART_COLORS.purple,
        datalabels: {
          formatter: avgFeesFormatter,
        },
      },
    ],
  }
}
