import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _last from 'lodash/last'
import _replace from 'lodash/replace'
import { FC } from 'react'

import { useGetFeatureConfigQuery } from '../../../app/services/api'
import { formatPowerConsumption, removeContainerPrefix } from '../../../app/utils/deviceUtils'
import { formatUnit } from '../../../app/utils/format'
import {
  getTimelineRadioButtons,
  timelineDropdownItems,
} from '../../../app/utils/getTimelineDropdownData'
import { getTimeRange } from '../../../app/utils/getTimeRange'
import { CHART_COLORS } from '../../../constants/colors'
import { useHeaderStats } from '../../../hooks/useHeaderStats'
import { Consumption } from '../../Farms/FarmCard/StatBox/Icons/Consumption'
import LineChartCard from '../../LineChartCard/LineChartCard'

import { CHART_TITLES } from '@/constants/charts'

const getChartType = (tag: string): string => {
  if (_includes(tag, 'container')) {
    return 'container'
  }
  if (_includes(tag, 'miner')) {
    return 'miner'
  }
  return _replace(tag, /^t-/, '')
}

const getPowerBEAttribute = (tag: string, totalTransformerConsumption?: boolean): string => {
  if (_includes(tag, 'container')) {
    return `container_power_w_aggr.${removeContainerPrefix(tag)}`
  }
  if (totalTransformerConsumption) return 'transformer_power_w'
  if (_includes(tag, 'powermeter')) {
    return 'site_power_w'
  }
  return 'power_w_sum_aggr'
}

interface TailLogEntry {
  ts?: number
  [key: string]: unknown
}

interface ConsumptionLineChartProps {
  tag?: string
  type?: string
  isDetailed?: boolean
  skipMinMaxAvg?: boolean
  powerAttribute?: string
  label?: string
  dateRange?: { start?: number; end?: number }
}

const ConsumptionLineChart: FC<ConsumptionLineChartProps> = ({
  tag = 't-miner',
  type,
  isDetailed,
  skipMinMaxAvg,
  powerAttribute,
  label,
  dateRange,
}) => {
  const { data: featureConfig } = useGetFeatureConfigQuery({})
  const { consumption } = useHeaderStats()

  const isOneMinEnabled = (featureConfig as { isOneMinItvEnabled?: boolean } | undefined)
    ?.isOneMinItvEnabled
  const totalTransformerConsumption = (
    featureConfig as { totalTransformerConsumptionHeader?: boolean } | undefined
  )?.totalTransformerConsumptionHeader
  const getConsumptionGraphData = (data: TailLogEntry[]) => {
    let totalAvgConsumption = 0
    let minConsumption = Number.MAX_SAFE_INTEGER
    let maxConsumption = Number.MIN_SAFE_INTEGER
    const powerBEAttribute = powerAttribute || getPowerBEAttribute(tag, totalTransformerConsumption)
    const powerConsumptionData: Array<{ x: number | undefined; y: number }> = []
    _forEach(data, (entry: TailLogEntry) => {
      const x = entry.ts
      const sumY = _get(entry, powerBEAttribute) as number
      powerConsumptionData.push({ x, y: sumY || 0 })
      const sumConsumption = (_get(entry, powerBEAttribute) as number) || 0

      totalAvgConsumption += sumConsumption

      if (sumConsumption < minConsumption) {
        minConsumption = sumConsumption
      }

      if (sumConsumption > maxConsumption) {
        maxConsumption = sumConsumption
      }
    })

    const minMaxAvg = {
      min: formatUnit(formatPowerConsumption(minConsumption)),
      max: formatUnit(formatPowerConsumption(maxConsumption)),
      avg: formatUnit(formatPowerConsumption(totalAvgConsumption / (data?.length || 1))),
    }

    const timeRange = getTimeRange(_last(data)?.ts ?? 0, _head(data)?.ts ?? 0)

    const currentValueW: number | string =
      powerBEAttribute === 'site_power_w'
        ? (consumption?.rawConsumptionW as number | string | undefined) || 0
        : (_get(_last(data), powerBEAttribute) as number | undefined) || 0

    return {
      yTicksFormatter: (value: number) => formatUnit(formatPowerConsumption(value)),
      currentValueLabel: formatPowerConsumption(Number(currentValueW)),
      minMaxAvg: !skipMinMaxAvg ? minMaxAvg : undefined,
      timeRange,
      datasets: [
        {
          type: 'line',
          label: label || (tag === 't-miner' ? 'Total Miner Consumption' : 'Total Consumption'),
          data: powerConsumptionData as Array<{ x: number; y: number }>,
          borderColor: CHART_COLORS.SKY_BLUE,
          pointRadius: 1,
          legendIcon: <Consumption />,
          currentValue: formatPowerConsumption(
            (_get(_last(data), powerBEAttribute) as number | undefined) || 0,
          ),
        },
      ],
    }
  }

  return (
    <LineChartCard
      title={CHART_TITLES.POWER_CONSUMPTION}
      tag={tag}
      dateRange={dateRange}
      dataAdapter={getConsumptionGraphData}
      radioButtons={getTimelineRadioButtons({ isOneMinEnabled })}
      dropdownItems={timelineDropdownItems}
      type={type || getChartType(tag)}
      isDetailLegends={isDetailed}
      shouldResetZoom
      statKey={isOneMinEnabled ? '1m' : undefined}
      fields={{ 'last.snap.stats.power_w': 1, info: 1 }}
      aggrFields={{
        site_power_w: 1,
        power_w_sum_aggr: 1,
        container_power_w_aggr: 1,
        transformer_power_w: 1,
      }}
    />
  )
}

export default ConsumptionLineChart
