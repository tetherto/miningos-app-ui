import _fromPairs from 'lodash/fromPairs'
import _head from 'lodash/head'
import _isString from 'lodash/isString'
import _keyBy from 'lodash/keyBy'
import _last from 'lodash/last'
import _map from 'lodash/map'
import { FC } from 'react'

import { UnknownRecord } from '../../app/utils/deviceUtils/types'
import {
  convertEnergyToRange,
  getRangeStatsKey,
  getUteEnergyAggrValue,
} from '../../app/utils/electricityUtils'
import { formatValueUnit } from '../../app/utils/format'
import { getTimeRange, timeRangeWalker } from '../../app/utils/getTimeRange'
import { getKunaEnergyAggr } from '../../app/utils/reportingToolsUtils'
import { DATE_RANGE, DATE_RANGE_DURATIONS } from '../../constants'
import type { TailLogDataItem } from '../../hooks/hooks.types'
import LineChartCard from '../LineChartCard/LineChartCard'

const VALUE_DECIMALS_DEFAULT = 3 // precision

interface ChartLine {
  backendAttribute: string
  [key: string]: unknown
}

interface ChartDataPayload {
  lines: ChartLine[]
  valueDecimals?: number
  unit?: string
  currentValueLabel?: {
    backendAttribute?: string
  }
  [key: string]: unknown
}

interface ElectricityChartBuilderProps {
  chartDataPayload?: ChartDataPayload
  dateRange?: { start: number; end: number } | null
  statKey?: string
  showGaps?: boolean
  statistics?: Array<{ label: string; value: string | number; [key: string]: unknown }>
  statisticsItemsPerCol?: number
  queryItemsLimit?: number
  onElectricityDataChange?: (data: TailLogDataItem[]) => void
  chartTitle?: string | null
}

const ElectricityChartBuilder: FC<ElectricityChartBuilderProps> = ({
  chartDataPayload,
  dateRange = null,
  statKey = DATE_RANGE.H1,
  showGaps = true,
  statistics = [],
  statisticsItemsPerCol = 1,
  queryItemsLimit = undefined,
  onElectricityDataChange = undefined,
  chartTitle = null,
}) => {
  const getDatasetsLineData = (data: Array<UnknownRecord>) => {
    if (!chartDataPayload?.lines) {
      return []
    }

    const datasetLinesDataLookup = _fromPairs(
      _map(chartDataPayload.lines, (line: ChartLine) => [line.backendAttribute, []]),
    )

    const dateWiseDataLookup = _keyBy(data, 'ts')

    const startTs = _head(data)?.ts as number | undefined
    const endTs = _last(data)?.ts as number | undefined

    if (!startTs || !endTs) {
      return []
    }

    const duration = DATE_RANGE_DURATIONS[statKey as keyof typeof DATE_RANGE_DURATIONS]

    const walker = timeRangeWalker(startTs, endTs, duration)

    for (const currentTs of walker) {
      const x = currentTs
      for (const line of chartDataPayload.lines) {
        const entry = dateWiseDataLookup[currentTs] as UnknownRecord | undefined
        const y = entry?.[line.backendAttribute]
        const pointData: { x: number; y?: unknown } = {
          x,
        }
        if (y !== undefined) {
          pointData.y = y
        }

        const lineKey = line.backendAttribute
        const lineData = datasetLinesDataLookup[lineKey] as Array<{ x: number; y?: unknown }>
        lineData.push(pointData)
      }
    }

    return _map(
      chartDataPayload.lines,
      (line: ChartLine) => datasetLinesDataLookup[line.backendAttribute],
    )
  }

  const getChartData = (data: TailLogDataItem[]) => {
    if (!chartDataPayload) {
      return {
        datasets: [],
        footerStats: statistics,
        footerStatsItemsPerCol: statisticsItemsPerCol,
      }
    }

    const validData = data.filter(
      (item): item is TailLogDataItem & { ts: number } => item.ts !== undefined,
    )
    const kunaAggrData = getKunaEnergyAggr(validData)

    const convertedData = convertEnergyToRange(kunaAggrData)

    const datasetLinesData = getDatasetsLineData(convertedData)

    const lastItem = _last(data)

    const lastItemTs = lastItem?.ts
    const firstItemTs = _head(data)?.ts
    const timeRange = lastItemTs && firstItemTs ? getTimeRange(lastItemTs, firstItemTs) : undefined

    const decimals = chartDataPayload.valueDecimals || VALUE_DECIMALS_DEFAULT

    return {
      yTicksFormatter: (value: number) =>
        formatValueUnit(value, chartDataPayload.unit ?? '', {
          maximumSignificantDigits: undefined,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      timeRange,
      currentValueLabel: {
        value: getUteEnergyAggrValue(lastItem as UnknownRecord, {
          valueKey: chartDataPayload.currentValueLabel?.backendAttribute,
        }),
        unit: chartDataPayload.unit,
        decimals: decimals,
      },
      datasets: _map(chartDataPayload.lines, (line: ChartLine, index: number) => ({
        type: 'line',
        label: (line.label ?? '') as string,
        data: datasetLinesData[index],
        borderColor: (line.borderColor ?? '') as string,
        borderWidth: (line.borderWidth ?? 2) as number,
        pointRadius: 1,
      })),
      footerStats: statistics,
      footerStatsItemsPerCol: statisticsItemsPerCol,
    }
  }

  return (
    <div>
      <LineChartCard
        title={chartTitle}
        tag="t-electricity"
        statKey={
          statKey && _isString(statKey)
            ? getRangeStatsKey(statKey as Parameters<typeof getRangeStatsKey>[0])
            : undefined
        }
        skipPolling
        skipUpdates
        type="electricity"
        dataAdapter={getChartData}
        dateRange={dateRange}
        showGaps={showGaps}
        queryLimit={queryItemsLimit}
        onTailLogDataChange={onElectricityDataChange}
        groupRange={statKey}
      />
    </div>
  )
}

export default ElectricityChartBuilder
