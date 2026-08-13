import { getTimezoneOffset } from 'date-fns-tz'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _isFinite from 'lodash/isFinite'
import _keyBy from 'lodash/keyBy'
import _map from 'lodash/map'
import _round from 'lodash/round'
import _sortBy from 'lodash/sortBy'
import _values from 'lodash/values'

import { useGetTailLogQuery, useGetExtDataQuery } from '@/app/services/api'
import { transformCostRevenueData } from '@/app/utils/electricityUtils'
import { formatUnit } from '@/app/utils/format'
import { CHART_COLORS } from '@/constants/colors'
import { CURRENCY } from '@/constants/units'
import useTimezone from '@/hooks/useTimezone'

interface DateRange {
  start: number
  end: number
}

interface UseProfitabilityHistoryDataProps {
  dateRange: DateRange
}

interface ChartDataPoint {
  x: number
  y: number
  currentValueLabel: string
}

interface HourlyRevenue {
  ts: number
  revenue: number
}

interface HourlyEstimate {
  ts: number
  revenue: number
  energyCost: number
}

export const useProfitabilityHistoryData = ({ dateRange }: UseProfitabilityHistoryDataProps) => {
  const { timezone } = useTimezone()

  const { data: estimatedData, isLoading: isEstimatesLoading } = useGetTailLogQuery({
    tag: 't-minerpool',
    type: 'minerpool-ocean',
    key: 'stat-transactions',
    aggrHourly: 1,
    fields: JSON.stringify({ hourlyRevenues: 1 }),
    aggrFields: JSON.stringify({ hourlyRevenues: 1 }),
    start: dateRange.start,
    end: dateRange.end,
    limit: 288,
  })

  const { data: rawActualRevenueData, isLoading: isActualLoading } = useGetExtDataQuery({
    type: 'electricity',
    query: JSON.stringify({
      key: 'cost-revenue',
      start: dateRange.start,
      end: dateRange.end,
      aggrHourly: true,
    }),
  })

  const actualRevenueData = transformCostRevenueData(rawActualRevenueData)

  const getFloatValue = (value: number) => (_isFinite(value) ? parseFloat(value.toFixed(2)) : 0)

  const forecasted = _keyBy(
    (_head(estimatedData as Array<{ hourlyRevenues: HourlyRevenue[] }>)?.hourlyRevenues ||
      []) as HourlyRevenue[],
    'ts',
  )
  const actual = _keyBy(
    (_head(actualRevenueData as Array<{ hourly_estimates: HourlyEstimate[] }>)?.hourly_estimates ||
      []) as HourlyEstimate[],
    'ts',
  )

  const allTimestamps = _map(_sortBy(_values({ ...forecasted, ...actual }), 'ts'), ({ ts }) => ts)
  const uniqueTimestamps = [...new Set(allTimestamps)]

  const forecastedRevenue: ChartDataPoint[] = []
  const actualRevenue: ChartDataPoint[] = []
  const energyCost: ChartDataPoint[] = []
  const tooltipHTMLMap: Record<number, string> = {}

  _forEach(uniqueTimestamps, (ts) => {
    const timestamp = ts as number
    const forecast = getFloatValue((forecasted[timestamp] as HourlyRevenue)?.revenue || 0)
    const actualRev = getFloatValue((actual[timestamp] as HourlyRevenue)?.revenue || 0)
    const cost = getFloatValue((actual[timestamp] as HourlyEstimate)?.energyCost || 0)
    const diffVsForecast = actualRev - forecast

    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    const forecastStr = formatUnit({ value: forecast, unit: 'USD' }, formatOptions)
    const actualStr = formatUnit({ value: actualRev, unit: 'USD' }, formatOptions)
    const costStr = formatUnit({ value: cost, unit: 'USD' }, formatOptions)

    const diffVsForecastStr = formatUnit({ value: diffVsForecast, unit: 'USD' }, formatOptions)
    const profitStr = formatUnit({ value: actualRev - cost, unit: 'USD' }, formatOptions)

    const tooltipHTML = `
      <div>Actual - Forecasted Revenue: ${diffVsForecastStr}</div>
      <div>Actual Revenue - Cost: ${profitStr}</div>
    `

    const processedTime = _round((timestamp + getTimezoneOffset(timezone)) / 1000)
    tooltipHTMLMap[processedTime] = tooltipHTML

    forecastedRevenue.push({
      x: timestamp as number,
      y: forecast,
      currentValueLabel: forecastStr,
    })

    actualRevenue.push({
      x: timestamp as number,
      y: actualRev,
      currentValueLabel: actualStr,
    })

    energyCost.push({
      x: timestamp as number,
      y: cost,
      currentValueLabel: costStr,
    })
  })

  const chartData = {
    yTicksFormatter: (value: number) =>
      formatUnit(
        { value, unit: CURRENCY.USD_LABEL },
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      ),
    timeRange: {
      start: uniqueTimestamps[0],
      end: uniqueTimestamps[uniqueTimestamps.length - 1],
    },
    datasets: [
      {
        type: 'line',
        label: 'Forecasted Revenue',
        data: forecastedRevenue,
        borderColor: CHART_COLORS.VIOLET,
        pointRadius: 1,
        extraTooltipData: tooltipHTMLMap,
      },
      {
        type: 'line',
        label: 'Actual Revenue',
        data: actualRevenue,
        borderColor: CHART_COLORS.green,
        pointRadius: 1,
        extraTooltipData: tooltipHTMLMap,
      },
      {
        type: 'line',
        label: 'Energy Cost',
        data: energyCost,
        borderColor: CHART_COLORS.red,
        pointRadius: 1,
        extraTooltipData: tooltipHTMLMap,
      },
    ],
  }

  return {
    data: chartData,
    isLoading: isEstimatesLoading || isActualLoading,
  }
}
