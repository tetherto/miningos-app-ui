import { MINER_TYPES_REPORT_FILTER_OPTIONS } from './MinerTypesReport.constants'
import {
  MinersStatusChartCardContainer,
  MinersStatusChartCardContent,
  MinersStatusChartCardHeader,
  MinersStatusChartCardTitle,
  MinersStatusChartError,
  MinersStatusChartNoData,
} from './MinerTypesReport.styles'

import BarChart from '@/Components/BarChart/BarChart'
import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import ReportTimeFrameSelector from '@/Components/Reports/ReportTimeFrameSelector/ReportTimeFrameSelector'
import { useMinersStatusChartData } from '@/hooks/useMinersStatusChartData'
import { BAR_WIDTH, CHART_HEIGHT_MEDIUM } from '@/MultiSiteViews/Charts/constants'

// Dataset indices matching the order in transformMinersStatusData (utils.ts)
// Datasets: Online, Not Mining (Sleep + Error), Offline, Maintenance
const DATASET_INDEX = {
  ONLINE: 0,
  NOT_MINING: 1,
  OFFLINE: 2,
  MAINTENANCE: 3,
} as const

// Filter values from constants
const FILTER_VALUE = {
  ALL: MINER_TYPES_REPORT_FILTER_OPTIONS[0].value,
  OFFLINE: MINER_TYPES_REPORT_FILTER_OPTIONS[1].value,
  MAINTENANCE: MINER_TYPES_REPORT_FILTER_OPTIONS[2].value,
} as const

interface MinersStatusChartCardProps {
  selectedFilter?: string
}

/**
 * MinersStatusChartCard displays a stacked bar chart of miner statuses
 * (Online, Error, Offline, Sleep) with a date range selector (1D/7D/30D/Custom)
 */
const MinersStatusChartCard = ({
  selectedFilter = FILTER_VALUE.ALL,
}: MinersStatusChartCardProps) => {
  const {
    chartData,
    isLoading,
    hasData,
    error,
    presetTimeFrame,
    dateRange,
    setPresetTimeFrame,
    setDateRange,
  } = useMinersStatusChartData()

  const renderContent = () => {
    if (error) {
      return <MinersStatusChartError>Failed to load miners data</MinersStatusChartError>
    }

    if (isLoading) {
      return <ChartLoadingSkeleton />
    }

    if (!hasData) {
      return <MinersStatusChartNoData>No miners data available</MinersStatusChartNoData>
    }

    // Determine which datasets should be hidden based on selected filter
    const getHiddenDatasets = (): number[] => {
      if (selectedFilter === FILTER_VALUE.OFFLINE) {
        // Show only Offline - hide all others
        return [DATASET_INDEX.ONLINE, DATASET_INDEX.NOT_MINING, DATASET_INDEX.MAINTENANCE]
      }
      if (selectedFilter === FILTER_VALUE.MAINTENANCE) {
        // Show only Maintenance - hide all others
        return [DATASET_INDEX.ONLINE, DATASET_INDEX.NOT_MINING, DATASET_INDEX.OFFLINE]
      }
      // FILTER_VALUE.ALL - show all datasets
      return []
    }

    return (
      <BarChart
        data={chartData ?? undefined}
        isStacked
        isLegendVisible
        legendPosition="bottom"
        chartHeight={CHART_HEIGHT_MEDIUM}
        barWidth={BAR_WIDTH.WIDE}
        yTicksFormatter={(value) => String(Math.round(value))}
        hiddenDatasets={getHiddenDatasets()}
      />
    )
  }

  return (
    <MinersStatusChartCardContainer>
      <MinersStatusChartCardHeader>
        <MinersStatusChartCardTitle>Miner Status</MinersStatusChartCardTitle>
        <ReportTimeFrameSelector
          presetTimeFrame={presetTimeFrame}
          dateRange={dateRange}
          setPresetTimeFrame={setPresetTimeFrame}
          setDateRange={setDateRange}
        />
      </MinersStatusChartCardHeader>
      <MinersStatusChartCardContent>{renderContent()}</MinersStatusChartCardContent>
    </MinersStatusChartCardContainer>
  )
}

export default MinersStatusChartCard
