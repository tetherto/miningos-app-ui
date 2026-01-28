import _map from 'lodash/map'
import { useState } from 'react'

import { HighlightableButton } from '../../Reports.styles'
import MinerReportUpdateAlert from '../MinerReportUpdateAlert/MinerReportUpdateAlert'

import MinersStatusChartCard from './MinersStatusChartCard'
import { MINER_TYPES_REPORT_FILTER_OPTIONS } from './MinerTypesReport.constants'
import {
  MinerStatusFilters,
  MinerTypeReportBody,
  MinerTypesReportContent,
  DoughnutChartCardWrapper,
  MinerTypesReportWrapper,
} from './MinerTypesReport.styles'
import { getChartData } from './MinerTypesReport.utils'

import { useGetTailLogQuery } from '@/app/services/api'
import { getLastMinuteTime } from '@/app/utils/dateTimeUtils'
import DoughnutChartCard from '@/Components/DoughnutChartCard/DoughnutChartCard'
import { POLLING_2m } from '@/constants/pollingIntervalConstants'
import { STAT_REALTIME } from '@/constants/tailLogStatKeys.constants'
import { useSmartPolling } from '@/hooks/useSmartPolling'

const MinerTypesReport = () => {
  const [time, setTime] = useState(getLastMinuteTime())
  const smartPollingInterval = useSmartPolling(POLLING_2m)

  const [filter, setFilter] = useState('ALL')

  const handleFilterClick = (value: string) => {
    setFilter(value)
  }

  const handleRefresh = () => {
    setTime(getLastMinuteTime())
  }

  const {
    data: tailLogData,
    isLoading: isTailLogDataLoading,
    isFetching: isTailLogDataFetching,
  } = useGetTailLogQuery(
    {
      key: STAT_REALTIME,
      type: 'miner',
      tag: 't-miner',
      limit: 1,
      start: time.valueOf(),
    },
    {
      pollingInterval: smartPollingInterval,
    },
  )

  const chartData = getChartData({
    filter,
    tailLogData,
  })

  const isLoading = isTailLogDataFetching || isTailLogDataLoading

  return (
    <MinerTypesReportWrapper>
      <MinerReportUpdateAlert lastUpdatedAt={time.valueOf()} onRefresh={handleRefresh} />

      <MinerTypesReportContent>
        <MinerStatusFilters>
          {_map(MINER_TYPES_REPORT_FILTER_OPTIONS, ({ label, value }) => (
            <HighlightableButton
              key={value}
              className={value === filter ? 'active' : undefined}
              onClick={() => handleFilterClick(value)}
            >
              {label}
            </HighlightableButton>
          ))}
        </MinerStatusFilters>
        <MinerTypeReportBody>
          <DoughnutChartCardWrapper>
            <DoughnutChartCard data={chartData} isLoading={isLoading} useBracketsForPct />
          </DoughnutChartCardWrapper>
        </MinerTypeReportBody>
      </MinerTypesReportContent>

      <MinersStatusChartCard selectedFilter={filter} />
    </MinerTypesReportWrapper>
  )
}

export default MinerTypesReport
