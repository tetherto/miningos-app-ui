import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _last from 'lodash/last'
import _sum from 'lodash/sum'
import { FC } from 'react'

import { formatPowerConsumption, removeContainerPrefix } from '../../../../../app/utils/deviceUtils'
import { UnknownRecord } from '../../../../../app/utils/deviceUtils/types'
import { formatUnit } from '../../../../../app/utils/format'
import {
  timelineDropdownItems,
  timelineRadioButtons,
} from '../../../../../app/utils/getTimelineDropdownData'
import { getTimeRange } from '../../../../../app/utils/getTimeRange'
import { CHART_COLORS } from '../../../../../constants/colors'
import LineChartCard from '../../../../LineChartCard/LineChartCard'

interface BitMainPowerChartsProps {
  tag?: string
  dateRange?: { start?: number; end?: number }
}

const BitMainPowerCharts: FC<BitMainPowerChartsProps> = ({ tag, dateRange }) => {
  const getPowerGraphData = (data: Array<UnknownRecord>) => {
    const totalPower: Array<{ x: number; y: number }> = []
    const box1Power: Array<{ x: number; y: number }> = []
    const box2Power: Array<{ x: number; y: number }> = []
    _forEach(data, (entry: UnknownRecord) => {
      if (!entry?.ts) return

      const containerKey = removeContainerPrefix(String(tag || ''))
      const containerStatsGroup = entry?.container_specific_stats_group_aggr as
        | Record<string, UnknownRecord>
        | undefined
      const containerStats = containerKey ? containerStatsGroup?.[containerKey] : undefined

      if (!containerStats) return

      const box1PowerY = Number(containerStats?.distribution_box1_power_group ?? 0)
      const box2PowerY = Number(containerStats?.distribution_box2_power_group ?? 0)
      const totalPowerY = box1PowerY + box2PowerY

      totalPower.push({ x: Number(entry.ts), y: totalPowerY * 1000 })
      box1Power.push({ x: Number(entry.ts), y: box1PowerY * 1000 })
      box2Power.push({ x: Number(entry.ts), y: box2PowerY * 1000 })
    })

    const timeRange = getTimeRange(Number(_last(data)?.ts), Number(_head(data)?.ts))

    const containerKey = removeContainerPrefix(String(tag || ''))
    const lastDataStats = _last(data)?.container_specific_stats_group_aggr as
      | Record<string, UnknownRecord>
      | undefined
    const lastData = containerKey ? lastDataStats?.[containerKey] : undefined
    const lastDataPowerConsumption = _sum([
      Number(lastData?.distribution_box1_power_group ?? 0),
      Number(lastData?.distribution_box2_power_group ?? 0),
    ])

    return {
      yTicksFormatter: (value: number) => formatUnit(formatPowerConsumption(value)),
      currentValueLabel: { ...formatPowerConsumption(lastDataPowerConsumption), decimals: 2 },
      timeRange,
      datasets: [
        {
          type: 'line',
          label: 'Total Power',
          data: totalPower,
          borderColor: CHART_COLORS.SKY_BLUE,
          pointRadius: 1,
        },
        {
          type: 'line',
          label: 'Dist. Box 1 Power',
          data: box1Power,
          borderColor: CHART_COLORS.VIOLET,
          pointRadius: 1,
        },
        {
          type: 'line',
          label: 'Dist. Box 2 Power',
          data: box2Power,
          borderColor: CHART_COLORS.red,
          pointRadius: 1,
        },
      ],
    }
  }
  return (
    <LineChartCard
      type="container"
      tag={tag}
      dateRange={dateRange}
      dataAdapter={getPowerGraphData}
      radioButtons={timelineRadioButtons}
      dropdownItems={timelineDropdownItems}
      aggrFields={{
        container_specific_stats_group_aggr: 1,
      }}
    />
  )
}

export default BitMainPowerCharts
