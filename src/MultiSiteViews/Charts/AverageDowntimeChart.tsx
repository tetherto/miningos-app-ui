import Empty from 'antd/es/empty'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'

import {
  getSiteOperationConfigEnd,
  getSiteOperationConfigStart,
} from '../SiteOperations/SiteOperations.helper'

import { useGetDowntimeQuery } from '@/app/services/api'
import { formatChartDate, formatNumber } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import { PERIOD } from '@/constants/ranges'
import { UNITS } from '@/constants/units'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useMultiSiteRTRequestParams from '@/hooks/useMultiSiteRTRequestParams'
import { BAR_WIDTH, CHART_HEIGHT } from '@/MultiSiteViews/Charts/constants'
import { getStackedComparisonDataset } from '@/MultiSiteViews/Charts/helper'
import { ChartTitle, ChartWrapper, NoDataWrapper, Unit } from '@/MultiSiteViews/Common.style'
import type { MultiSiteDateRange } from '@/types/redux.d'

interface DowntimeEntry {
  ts: string | number
  curtailmentRate?: number
  downtimeRate?: number
}

interface TransformedDowntimeData {
  month: string
  curtailment: number
  operationalIssues: number
}

interface AverageDowntimeChartProps {
  dateRange: MultiSiteDateRange
}

export const getDataset = (data: TransformedDowntimeData[], period?: string) =>
  getStackedComparisonDataset(
    data,
    {
      keyA: 'curtailment',
      keyB: 'operationalIssues',
      labels: {
        curtailment: 'Curtailment',
        operationalIssues: 'Op. Issues',
      },
      colors: {
        curtailment: 'BLUE',
        operationalIssues: 'RED',
      },
    },
    period,
  )

const transformDowntimeData = (
  data: DowntimeEntry[] | undefined,
  isChartDateShort = false,
  multiplier = 100,
): TransformedDowntimeData[] => {
  if (!data || !_isArray(data)) return []

  return _map(data, (entry) => ({
    month: formatChartDate(Number(entry.ts), !isChartDateShort),
    curtailment: entry.curtailmentRate ? Number(entry.curtailmentRate) * multiplier : 0,
    operationalIssues: entry.downtimeRate ? Number(entry.downtimeRate) * multiplier : 0,
  }))
}

// TODO: For the single-site follow the same pattern as the Cost component
// i.e. Crete wrapper component that will conditionally render the appropriate component
export const AverageDowntimeChart = ({ dateRange }: AverageDowntimeChartProps) => {
  const { siteId, selectedSites, isMultiSiteModeEnabled } = useMultiSiteMode()

  const startDate = getSiteOperationConfigStart(dateRange)
  const endDate = getSiteOperationConfigEnd(dateRange)

  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  let sites: string[] = []
  if (_isEmpty(selectedSites)) {
    if (siteId) {
      sites = [siteId]
    }
  } else {
    sites = selectedSites
  }

  const params = buildRequestParams({
    start: startDate ?? new Date(),
    end: endDate ? new Date(endDate) : new Date(),
    period: (dateRange?.period as 'daily' | 'weekly' | 'monthly' | undefined) ?? 'daily',
    sites,
  })

  // Skip API call when params are invalid or in single-site mode to prevent failures
  const shouldSkip = !isMultiSiteModeEnabled || isParamBuilderLoading || _isEmpty(params)
  const { data: downtimeQuery, isLoading: isLoadingDowntime } = useGetDowntimeQuery(params, {
    skip: shouldSkip,
  })

  // In single-site mode, show empty state
  if (!isMultiSiteModeEnabled) {
    return (
      <ChartWrapper>
        <ChartTitle>Monthly Average Downtime</ChartTitle>
        <Unit>{UNITS.PERCENT}</Unit>
        <NoDataWrapper>
          <Empty description="No data available" />
        </NoDataWrapper>
      </ChartWrapper>
    )
  }

  const chartData = transformDowntimeData(downtimeQuery?.log, dateRange?.period === PERIOD.MONTHLY)
  const dataset = getDataset(chartData, dateRange?.period)

  const hasNoData = _isEmpty(_keys(dataset))

  const renderChartContent = () => {
    if (isLoadingDowntime || isParamBuilderLoading) {
      return <ChartLoadingSkeleton />
    }

    if (!isLoadingDowntime && !isParamBuilderLoading && hasNoData) {
      return <Empty description="No data available" />
    }

    return (
      <BarChart
        isStacked
        isLegendVisible
        hasSuffix
        data={{ dataset }}
        barWidth={BAR_WIDTH.WIDE}
        chartHeight={CHART_HEIGHT}
        yTicksFormatter={(value) => formatNumber(value * 100)}
      />
    )
  }

  return (
    <ChartWrapper>
      <ChartTitle>Monthly Average Downtime</ChartTitle>
      <Unit>{UNITS.PERCENT}</Unit>
      <NoDataWrapper>{renderChartContent()}</NoDataWrapper>
    </ChartWrapper>
  )
}
