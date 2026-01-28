import _head from 'lodash/head'

import LineChartCard from '../../LineChartCard/LineChartCard'

import { HashRateLogEntry } from './HashRateLineChart.types'
import { getHashRateGraphData } from './HashRateLineChart.utils'

import { useGetFeatureConfigQuery, useGetTailLogQuery } from '@/app/services/api'
import { getTimelineRadioButtons, timelineDropdownItems } from '@/app/utils/getTimelineDropdownData'
import { DATE_RANGE, TIME } from '@/constants'
import { CHART_TITLES } from '@/constants/charts'
import { POLLING_5s } from '@/constants/pollingIntervalConstants'
import { STAT_REALTIME } from '@/constants/tailLogStatKeys.constants'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import useSubtractedTime from '@/hooks/useSubtractedTime'

interface HashRateLineChartDefaultProps {
  tag: string
  dateRange?: { start?: number; end?: number }
}

export const HashRateLineChartDefault = ({
  dateRange,
  tag = 't-miner',
}: HashRateLineChartDefaultProps) => {
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const featureConfig = useGetFeatureConfigQuery({}).data as { isOneMinItvEnabled?: boolean }
  const isOneMinEnabled = featureConfig?.isOneMinItvEnabled
  const time = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)

  const timelineRadioButtons = getTimelineRadioButtons({ isOneMinEnabled })

  const timeStatKey = isOneMinEnabled ? DATE_RANGE.M1 : undefined

  const { data: realtimeHashrateData } = useGetTailLogQuery(
    {
      key: STAT_REALTIME,
      type: 'miner',
      tag,
      limit: 1,
      start: dateRange?.start || time,
      end: dateRange?.end,
      aggrFields: JSON.stringify({
        hashrate_mhs_1m_sum_aggr: 1,
      }),
      fields: JSON.stringify({
        hashrate_mhs_1m_sum: 1,
      }),
    },
    {
      pollingInterval: smartPolling5s,
    },
  )

  const hashRateGraphDataAdapter = (data: HashRateLogEntry[]) =>
    getHashRateGraphData(data, _head(realtimeHashrateData))

  return (
    <LineChartCard
      tag={tag}
      dateRange={dateRange}
      statKey={timeStatKey}
      shouldResetZoom={false}
      title={CHART_TITLES.HASH_RATE}
      radioButtons={timelineRadioButtons}
      dropdownItems={timelineDropdownItems}
      dataAdapter={hashRateGraphDataAdapter}
      fields={{
        'last.snap.stats.hashrate_mhs.t_5m': 1,
      }}
      aggrFields={{
        hashrate_mhs_1m_sum_aggr: 1,
      }}
    />
  )
}
