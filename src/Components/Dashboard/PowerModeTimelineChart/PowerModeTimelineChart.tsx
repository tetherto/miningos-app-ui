import { FC } from 'react'
import React from 'react'

import useTimezone from '../../../hooks/useTimezone'
import ChartLoadingSkeleton from '../../ChartLoadingSkeleton/ChartLoadingSkeleton'
import { LineChartCardContainer } from '../../LineChartCard/LineChartCard.styles'
import TimelineChart from '../../TimelineChart/TimelineChart'

import { getPowerModeTimelineChartData } from './PowerModeTimlineChart.helper'

interface PowerModeTimelineEntry {
  ts?: number
  power_mode_group_aggr?: Record<string, string>
  status_group_aggr?: Record<string, string>
  [key: string]: unknown
}

interface PowerModeTimelineChartProps {
  minerTailLogData?: PowerModeTimelineEntry[]
  isLoading?: boolean
  minerTailLogUpdates?: PowerModeTimelineEntry[]
}

const PowerModeTimelineChart: FC<PowerModeTimelineChartProps> = ({
  minerTailLogData = [],
  isLoading,
  minerTailLogUpdates = [],
}) => {
  const { timezone } = useTimezone()

  const initialData = getPowerModeTimelineChartData(minerTailLogData, timezone)

  const newData = getPowerModeTimelineChartData(minerTailLogUpdates, timezone)

  return (
    <LineChartCardContainer>
      {isLoading ? (
        <ChartLoadingSkeleton />
      ) : (
        <TimelineChart
          initialData={initialData}
          newData={newData}
          axisTitleText={{ y: 'Power Mode', x: 'Time' }}
          skipUpdates
          range={undefined}
        />
      )}
    </LineChartCardContainer>
  )
}

export default React.memo(PowerModeTimelineChart)
