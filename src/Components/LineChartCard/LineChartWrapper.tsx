import type { IChartApi } from 'lightweight-charts'
import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _keyBy from 'lodash/keyBy'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _values from 'lodash/values'
import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { useGetTailLogQuery } from '../../app/services/api'
import { TIME } from '../../constants'
import { CHART_TYPES } from '../../constants/charts'
import { POLLING_5s } from '../../constants/pollingIntervalConstants'
import useSubtractedTime from '../../hooks/useSubtractedTime'
import ChartLoadingSkeleton from '../ChartLoadingSkeleton/ChartLoadingSkeleton'
import { withErrorBoundary } from '../ErrorBoundary'
import LineChart from '../LineChart/LineChart'

import { CHART_MIN_HEIGHT, LIMIT, timelineToMs, getTimelineDateFormat } from './helper'
import { LineChartCardContainer, LineChartContainer, NoDataContainer } from './LineChartCard.styles'
import LineChartCardFooter from './LineChartCardFooter'
import LineChartCardHeader from './LineChartCardHeader'

import type { DateRange } from '@/hooks/hooks.types'
import { useChartDataCheck } from '@/hooks/useChartDataCheck'

type LineDataPoint = { x: number; y: number | null | undefined }
type LineDataset = {
  label?: string
  visible?: boolean
  borderColor: string
  borderWidth?: number
  data: LineDataPoint[]
  [key: string]: unknown
}
type LineChartData = { datasets: LineDataset[] }

interface DatasetProp {
  datasets: unknown[]
}

interface ChartDataPoint {
  ts: number
  [key: string]: unknown
}

interface RadioButton {
  value: string
  disabled?: boolean
  label?: string
}

interface FooterStatItem {
  label: string
  value: string | number
}

interface MinMaxAvgData {
  min?: number
  max?: number
  avg?: number
  [key: string]: unknown
}

interface SecondaryValueLabel {
  title?: string
  value?: string | number
  [key: string]: unknown
}

interface LineChartWrapperProps {
  tag?: string
  title?: string | null
  dataAdapter?: (data: unknown) => unknown
  radioButtons?: RadioButton[]
  dropdownItems?: unknown[]
  type?: string
  dataProcessor?: ((data: unknown) => unknown) | null
  priceFormatter?: ((value: number) => string) | null
  skipPolling?: boolean
  skipUpdates?: boolean
  isDetailLegends?: boolean
  chartRef?: RefObject<IChartApi | null>
  statKey?: string
  dateRange?: DateRange | null
  isRow?: boolean
  fields?: unknown
  aggrFields?: unknown
  groupRange?: unknown
  isFieldsCompulsory?: boolean
  isChartLoading?: boolean
  shouldResetZoom?: boolean
  queryLimit?: number
  onTailLogDataChange?: ((data: unknown) => void) | undefined
  aggrDaily?: boolean
  datasetProp?: DatasetProp | null
}

const LineChartWrapperComponent = ({
  tag = `t-${CHART_TYPES.MINER}`,
  title = null,
  dataAdapter = (data: unknown) => data,
  radioButtons = [],
  type = 'miner',
  dataProcessor = null,
  priceFormatter = null,
  skipPolling = false,
  skipUpdates = false,
  isDetailLegends = false,
  chartRef,
  statKey = '',
  dateRange = null,
  isRow = false,
  fields = undefined,
  aggrFields = undefined,
  groupRange = undefined,
  isFieldsCompulsory = false,
  isChartLoading = false,
  shouldResetZoom = true,
  queryLimit = LIMIT,
  onTailLogDataChange = undefined,
  aggrDaily = false,
  datasetProp = null,
}: LineChartWrapperProps) => {
  const [legendHidden, setLegendHidden] = useState<Record<string, boolean>>({})
  const [timeline, setTimeline] = useState(statKey ? statKey : '5m')
  const [end, setEnd] = useState<number | undefined>()
  const [dataset, setDataset] = useState<ChartDataPoint[]>([])
  const time = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)
  const { start: startRange, end: endRange } = (dateRange as DateRange) || {}
  const chartReqParams: {
    key: string
    type: string
    tag: string
    fields?: string
    aggrFields?: string
    aggrDaily?: string
  } = {
    key: `stat-${timeline}`,
    type,
    tag,
  }
  if (fields) chartReqParams.fields = JSON.stringify(fields)
  if (aggrFields) chartReqParams.aggrFields = JSON.stringify(aggrFields)
  if (aggrDaily) chartReqParams.aggrDaily = '1'

  useEffect(() => {
    if (datasetProp) {
      setDataset((datasetProp.datasets || []) as ChartDataPoint[])
    }
  }, [datasetProp])

  const { data: tailLogData, isLoading } = useGetTailLogQuery(
    {
      ...chartReqParams,
      limit: queryLimit,
      // eslint-disable-next-line no-nested-ternary
      start: dateRange ? startRange : end ? end - timelineToMs(timeline) * queryLimit : undefined,
      end: dateRange ? endRange : end,
      groupRange,
    },
    { skip: !!datasetProp || (isFieldsCompulsory && _isEmpty(fields)) },
  )

  const { data: tailLogDataUpdates } = useGetTailLogQuery(
    {
      ...chartReqParams,
      limit: 1,
      start: time,
    },
    {
      pollingInterval: skipPolling ? undefined : POLLING_5s,
      skip: !!datasetProp || (isFieldsCompulsory && _isEmpty(fields)) || skipUpdates,
    },
  )

  useEffect(() => {
    const dataToProcess = datasetProp || _head(tailLogData)
    const processedData = dataProcessor ? dataProcessor(dataToProcess) : dataToProcess

    setDataset((state: ChartDataPoint[]) => {
      if (!end) return (processedData as ChartDataPoint[]) || []
      const dataArray = (processedData as ChartDataPoint[]) || []
      return _values({ ..._keyBy(state, 'ts'), ..._keyBy(dataArray, 'ts') }) as ChartDataPoint[]
    })
  }, [tailLogData, end, dataProcessor, datasetProp])

  useEffect(() => {
    const updatedData = _head(tailLogDataUpdates)
    const tailLogDataSize = updatedData ? _size(updatedData as string | unknown[]) : 0
    if (skipPolling || tailLogDataSize > 1 || datasetProp) return
    const processedData = dataProcessor ? dataProcessor(updatedData) : updatedData
    const dataArray = (processedData as ChartDataPoint[]) || []
    setDataset(
      (state: ChartDataPoint[]) =>
        _values({ ..._keyBy(state, 'ts'), ..._keyBy(dataArray, 'ts') }) as ChartDataPoint[],
    )
  }, [tailLogDataUpdates, end, skipPolling, dataProcessor, datasetProp])

  const handleTimelineChange = (timeline: string) => {
    chartRef?.current?.timeScale().resetTimeScale()
    setTimeline(timeline)
    setEnd(undefined)
  }

  const handleLegendClick = (label: string) => {
    setLegendHidden((prevState: Record<string, boolean>) => ({
      ...prevState,
      [label]: !prevState[label],
    }))
  }

  useEffect(() => {
    setTimeline(statKey ? statKey : '5m')
  }, [statKey])

  useEffect(() => {
    onTailLogDataChange?.(tailLogData)
  }, [onTailLogDataChange, tailLogData])

  useEffect(() => {
    const tailLogDataSize = tailLogDataUpdates ? _size(tailLogDataUpdates as string | unknown[]) : 0
    if (tailLogDataSize > 1) return
    onTailLogDataChange?.(tailLogDataUpdates)
  }, [onTailLogDataChange, tailLogDataUpdates])

  const visibleData = (() => {
    const rawData = datasetProp || dataAdapter(_sortBy(_filter(dataset, 'ts'), 'ts'))
    const data = rawData as {
      datasets?: Array<{ label?: string; [key: string]: unknown }>
      yTicksFormatter?: (value: number) => string
      skipRound?: boolean
      roundPrecision?: number
      minMaxAvg?: MinMaxAvgData
      secondaryValueLabel?: SecondaryValueLabel
      footerStats?: FooterStatItem[]
      footerStatsItemsPerCol?: number
      [key: string]: unknown
    }

    return {
      ...data,
      datasets: _map(data.datasets || [], (d: { label?: string; [key: string]: unknown }) => ({
        ...d,
        visible: d.label ? !legendHidden[d.label] : true,
      })),
      isDetailLegends,
    } as typeof data & {
      datasets: Array<{ label?: string; visible: boolean; [key: string]: unknown }>
      isDetailLegends: boolean
    }
  })()

  const isChartDataUnavailable = useChartDataCheck({ data: visibleData })

  return (
    <LineChartCardContainer $row={isRow} $noWrap>
      {isLoading || isChartLoading ? (
        <ChartLoadingSkeleton minHeight={CHART_MIN_HEIGHT} />
      ) : (
        <>
          <LineChartCardHeader
            data={isChartDataUnavailable ? {} : visibleData}
            title={title ?? null}
            radioButtons={radioButtons || []}
            timeline={timeline}
            legendHidden={legendHidden as Record<string, boolean>}
            onChangeTimeline={handleTimelineChange}
            onClickLegend={handleLegendClick}
          />
          <LineChartContainer key={String(isChartDataUnavailable)}>
            {isChartDataUnavailable ? (
              <NoDataContainer>No records found</NoDataContainer>
            ) : (
              <LineChart
                chartRef={chartRef}
                data={visibleData as unknown as LineChartData}
                yTicksFormatter={visibleData.yTicksFormatter || ((value: number) => String(value))}
                skipRound={visibleData.skipRound}
                roundPrecision={visibleData.roundPrecision}
                timeline={timeline}
                customDateFormat={getTimelineDateFormat(timeline)}
                shouldResetZoom={shouldResetZoom}
                priceFormatter={priceFormatter || undefined}
                customLabel={title || undefined}
              />
            )}
          </LineChartContainer>
          {!isChartDataUnavailable ? (
            <LineChartCardFooter
              minMaxAvg={visibleData.minMaxAvg}
              secondaryValueLabel={visibleData.secondaryValueLabel}
              stats={visibleData.footerStats || []}
              statsItemsPerCol={visibleData.footerStatsItemsPerCol}
            />
          ) : null}
        </>
      )}
    </LineChartCardContainer>
  )
}

export const LineChartWrapper = withErrorBoundary(LineChartWrapperComponent, 'LineChartWrapper')
