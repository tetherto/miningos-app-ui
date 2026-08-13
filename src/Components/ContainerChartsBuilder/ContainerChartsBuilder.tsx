import _head from 'lodash/head'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _round from 'lodash/round'
import { FC } from 'react'

import { removeContainerPrefix } from '../../app/utils/deviceUtils'
import { UnknownRecord } from '../../app/utils/deviceUtils/types'
import { formatUnit } from '../../app/utils/format'
import {
  timelineDropdownItems,
  timelineRadioButtons,
} from '../../app/utils/getTimelineDropdownData'
import { getTimeRange } from '../../app/utils/getTimeRange'
import LineChartCard from '../LineChartCard/LineChartCard'

interface ChartLine {
  backendAttribute: string
  label: string
  borderColor: string
  borderWidth?: number
  [key: string]: unknown
}

interface ChartDataPayload {
  unit?: string
  lines?: ChartLine[]
  currentValueLabel?: {
    backendAttribute?: string
    decimals?: number
    [key: string]: unknown
  }
  valueFormatter?: (value: number) => number
  valueDecimals?: number
  [key: string]: unknown
}

interface ContainerChartsBuilderProps {
  tag?: string
  chartDataPayload?: ChartDataPayload
  chartTitle?: string
  dateRange?: { start?: number; end?: number }
}

const ContainerChartsBuilder: FC<ContainerChartsBuilderProps> = ({
  tag,
  chartDataPayload,
  chartTitle,
  dateRange,
}) => {
  const getChartData = (data: Array<UnknownRecord>) => {
    if (!chartDataPayload) return null
    const { unit, lines, currentValueLabel, valueFormatter } = chartDataPayload

    const pureTag = removeContainerPrefix(String(tag || ''))

    const datasetLinesData = _reduce(
      data,
      (acc: Array<Array<{ x: number; y: unknown }>>, entry: UnknownRecord) => {
        const x = entry.ts as number

        const containerStats = entry?.container_specific_stats_group_aggr as
          | Record<string, UnknownRecord>
          | undefined
        const groupData = pureTag
          ? (containerStats?.[pureTag] as UnknownRecord | undefined)
          : undefined

        return _reduce(
          (lines || []) as ChartLine[],
          (lineAcc: Array<Array<{ x: number; y: unknown }>>, line, index: number) => {
            if (!lineAcc[index]) {
              lineAcc[index] = []
            }

            lineAcc[index].push({
              x,
              y: groupData?.[line.backendAttribute],
            })

            return lineAcc
          },
          acc,
        )
      },
      [] as Array<Array<{ x: number; y: unknown }>>,
    )

    const timeRange = getTimeRange(
      (_last(data)?.ts as number | undefined) ?? 0,
      (_head(data)?.ts as number | undefined) ?? 0,
    )

    return {
      yTicksFormatter: (value: number) => {
        const formattedValue = valueFormatter ? valueFormatter(value) : value
        return formatUnit({ value: _round(formattedValue, 3), unit })
      },
      roundPrecision: chartDataPayload.valueDecimals,
      timeRange,
      currentValueLabel: {
        value: (
          _last(data)?.container_specific_stats_group_aggr as
            | Record<string, UnknownRecord>
            | undefined
        )?.[pureTag]?.[currentValueLabel?.backendAttribute as string] as number | undefined,
        unit,
        decimals: currentValueLabel?.decimals as number | undefined,
      },
      datasets: _map(lines || [], (line: ChartLine, index: number) => ({
        type: 'line',
        label: line.label,
        data: datasetLinesData[index],
        borderColor: line.borderColor,
        borderWidth: line.borderWidth || 2, // adjust this to modify the line thickness
        pointRadius: 1,
      })),
    }
  }

  return (
    <LineChartCard
      title={chartTitle}
      type="container"
      dateRange={dateRange}
      tag={tag}
      dataAdapter={getChartData}
      radioButtons={timelineRadioButtons}
      dropdownItems={timelineDropdownItems}
      aggrFields={{
        container_specific_stats_group_aggr: 1,
      }}
    />
  )
}

export default ContainerChartsBuilder
