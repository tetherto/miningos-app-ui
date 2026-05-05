import _head from 'lodash/head'

import {
  ChartHeader,
  ChartHeaderActions,
  ChartTitle,
  EnergyReportMinerTypeViewContainer,
} from './EnergyReportMinerView.styles'
import {
  ENERGY_REPORT_MINER_VIEW_SLICES,
  type EnergyReportMinerViewSlice,
  sliceConfig,
  transformToBarData,
} from './EnergyReportMinerView.utils'

import { useGetListThingsQuery, useGetMetricsConsumptionGroupedQuery } from '@/app/services/api'
import { formatPowerConsumption } from '@/app/utils/deviceUtils'
import { formatUnit } from '@/app/utils/format'
import { BarSteppedLineChart } from '@/Components/BarSteppedLineChart/BarSteppedLineChart'
import ReportTimeFrameSelector, {
  useReportTimeFrameSelectorState,
} from '@/Components/Reports/ReportTimeFrameSelector/ReportTimeFrameSelector'
import { Spinner } from '@/Components/Spinner/Spinner'

interface EnergyReportMinerViewProps {
  slice?: EnergyReportMinerViewSlice
}

const EnergyReportMinerView = ({
  slice = ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE,
}: EnergyReportMinerViewProps) => {
  const reportTimeFrameState = useReportTimeFrameSelectorState()
  const { start, end } = reportTimeFrameState
  const { groupBy, title } = sliceConfig[slice]

  const {
    data: consumptionResponse,
    isLoading: isConsumptionLoading,
    isFetching: isConsumptionFetching,
  } = useGetMetricsConsumptionGroupedQuery({
    start: start.valueOf(),
    end: end.valueOf(),
    groupBy,
  })

  const { data: containerListData, isLoading: isContainerListDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      tags: {
        $in: ['t-container'],
      },
    }),
  })

  const containers = (_head(containerListData as unknown[][]) ?? []) as Array<{
    type?: string
    info?: { container?: string }
  }>

  const chartData = transformToBarData(consumptionResponse, slice, containers)

  const isLoading = isConsumptionLoading || isConsumptionFetching || isContainerListDataLoading

  return (
    <EnergyReportMinerTypeViewContainer>
      {isLoading ? (
        <Spinner />
      ) : (
        <div>
          <ChartHeader>
            <ChartTitle>{title}</ChartTitle>
            <ChartHeaderActions>
              <ReportTimeFrameSelector {...reportTimeFrameState} />
            </ChartHeaderActions>
          </ChartHeader>
          <BarSteppedLineChart
            chartData={chartData}
            yTicksFormatter={(value) => formatUnit(formatPowerConsumption(value))}
          />
        </div>
      )}
    </EnergyReportMinerTypeViewContainer>
  )
}

export default EnergyReportMinerView
