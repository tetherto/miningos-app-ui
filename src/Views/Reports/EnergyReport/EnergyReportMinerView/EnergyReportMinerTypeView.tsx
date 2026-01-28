import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _keys from 'lodash/keys'
import _map from 'lodash/map'

import {
  ChartHeader,
  ChartHeaderActions,
  ChartTitle,
  EnergyReportMinerTypeViewContainer,
} from './EnergyReportMinerView.styles'
import { ENERGY_REPORT_MINER_VIEW_SLICES, sliceConfig } from './EnergyReportMinerView.utils'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'
import { formatPowerConsumption } from '@/app/utils/deviceUtils'
import { formatUnit } from '@/app/utils/format'
import { BarSteppedLineChart } from '@/Components/BarSteppedLineChart/BarSteppedLineChart'
import ReportTimeFrameSelector, {
  useReportTimeFrameSelectorState,
} from '@/Components/Reports/ReportTimeFrameSelector/ReportTimeFrameSelector'
import { Spinner } from '@/Components/Spinner/Spinner'

interface EnergyReportMinerViewProps {
  slice?: string
}

const EnergyReportMinerView = ({
  slice = ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE,
}: EnergyReportMinerViewProps) => {
  const reportTimeFrameState = useReportTimeFrameSelectorState()

  const start = reportTimeFrameState.start
  const end = reportTimeFrameState.end

  const {
    data: tailLogData,
    isLoading: isMinerTailLogLoading,
    isFetching: isMinerTailLogFetching,
  } = useGetTailLogQuery({
    key: 'stat-5m',
    type: 'miner',
    tag: 't-miner',
    limit: 1,
    start: start.valueOf(),
    end: end.valueOf(),
  })

  const { data: containerListData, isLoading: isContainerListDataLoading } = useGetListThingsQuery({
    query: JSON.stringify({
      tags: {
        $in: ['t-container'],
      },
    }),
  })

  const containers = (_head(containerListData) ?? []) as Array<{
    type?: string
    info?: { container?: string }
  }>

  const { title, key: tailLogField, getLabelName, filterCategory } = sliceConfig[slice]

  const categories = _filter(_keys(_get(_head(tailLogData), [tailLogField], {})), (category) => {
    if (filterCategory) {
      return filterCategory(category)
    }
    return true
  })

  const labels = _map(categories, (category) => getLabelName(category, containers))
  const chartData = {
    labels,
    dataSet1: {
      label: 'Power Consumption',
      data: _map(categories, (label) => _get(_head(tailLogData), [tailLogField, label])),
    },
  }

  const isLoading = isMinerTailLogLoading || isMinerTailLogFetching || isContainerListDataLoading

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
