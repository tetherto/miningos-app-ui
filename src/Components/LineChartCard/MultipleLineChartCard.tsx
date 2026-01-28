import type { IChartApi } from 'lightweight-charts'
import _compact from 'lodash/compact'
import _concat from 'lodash/concat'
import _find from 'lodash/find'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import { useEffect, useState } from 'react'
import type { ComponentProps, RefObject } from 'react'

import { aggregateF2PoolSnapLog } from '../../app/utils/reportingToolsUtils'
import { TIME } from '../../constants'
import { CHART_TYPES } from '../../constants/charts'
import { COLOR } from '../../constants/colors'
import useLineChartData from '../../hooks/useLineChartData'
import useSubtractedTime from '../../hooks/useSubtractedTime'
import ChartLoadingSkeleton from '../ChartLoadingSkeleton/ChartLoadingSkeleton'
import { withErrorBoundary } from '../ErrorBoundary'
import LineChart from '../LineChart/LineChart'

import { CHART_MIN_HEIGHT } from './helper'
import {
  LineChartCardContainer,
  LineChartContainer,
  LoaderContainer,
  NoDataContainer,
} from './LineChartCard.styles'
import LineChartCardFooter from './LineChartCardFooter'
import LineChartCardHeader from './LineChartCardHeader'
import { multipleLineChartCardProptypes } from './propTypes'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { DateRange } from '@/hooks/hooks.types'
import { useChartDataCheck } from '@/hooks/useChartDataCheck'

interface RadioButton {
  value: string
  disabled?: boolean
  label?: string
}

interface ReferenceLine {
  display?: boolean
  label?: string
  value?: number
  currentValue?: string | number
  legendIcon?: string
}

interface MultipleLineChartCardProps {
  firstLineTag?: string
  firstLineType?: string
  secondLineTag?: string
  secondLineType?: string
  referenceLine?: ReferenceLine
  dataAdapters?:
    | Record<string, (data: unknown, yesterday?: unknown) => unknown>
    | Array<(data: unknown) => unknown>
  dataProcessors?: Record<string, (data: unknown) => unknown> | Array<(data: unknown) => unknown>
  skipPolling?: boolean
  skipUpdates?: boolean
  radioButtons?: RadioButton[]
  isDetailLegends?: boolean
  chartRef?: RefObject<IChartApi | null>
  dateRange?: DateRange | null | undefined
  isRow?: boolean
  fields?: Record<string, Record<string, number>>
  aggrFields?: Record<string, Record<string, number>>
  isChartLoading?: boolean
  isFieldsCompulsory?: boolean
  statKey?: string
  secondaryStatKey?: string
  shouldResetZoom?: boolean
  extraTailLogParams?: Record<string, UnknownRecord>
  aggrDaily?: boolean
  title?: string | null
}

const MultipleLineChartCard = ({
  firstLineTag = `t-${CHART_TYPES.MINER}`,
  firstLineType = CHART_TYPES.MINER,
  secondLineTag = `t-${CHART_TYPES.MINERPOOL}`,
  secondLineType = CHART_TYPES.MINERPOOL,
  referenceLine = { display: false },
  dataAdapters = undefined,
  dataProcessors = {
    [CHART_TYPES.MINER]: (data: unknown) => data,
    [CHART_TYPES.CONTAINER]: (data: unknown) => data,
    [CHART_TYPES.MINERPOOL]: aggregateF2PoolSnapLog as (data: unknown) => unknown,
  } as Record<string, (data: unknown) => unknown>,
  skipPolling = false,
  skipUpdates = false,
  radioButtons = undefined,
  isDetailLegends = false,
  chartRef = undefined,
  dateRange = null,
  isRow = false,
  fields = undefined,
  aggrFields = undefined,
  isChartLoading = false,
  isFieldsCompulsory = false,
  statKey = '',
  secondaryStatKey = '',
  shouldResetZoom = true,
  extraTailLogParams = undefined,
  aggrDaily = false,
  title = null,
}: MultipleLineChartCardProps) => {
  const [legendHidden, setLegendHidden] = useState<Record<string, boolean>>({})
  const [timeline, setTimeline] = useState(statKey || '5m')
  const [end, setEnd] = useState<number | undefined>()

  useEffect(() => {
    if (radioButtons) {
      const disabledTimeline = _find(
        radioButtons,
        (button: RadioButton) => button.value === timeline && button.disabled,
      )

      if (disabledTimeline) {
        const nextAvailableButton = _find(
          radioButtons,
          (button: RadioButton) => !button.disabled,
        )?.value
        if (nextAvailableButton) {
          setTimeline(nextAvailableButton)
        }
      }
    }
  }, [timeline, radioButtons])

  const handleTimelineChange = (timeline: string) => {
    chartRef?.current?.timeScale().resetTimeScale()
    setTimeline(timeline)
    setEnd(undefined)
  }

  const handleLegendClick = (index: string) => {
    setLegendHidden((hidden: Record<string, boolean>) => ({
      ...hidden,
      [index]: !hidden[index],
    }))
  }
  const time = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)

  const { isLineLoading: isFirstLineLoading, lineData: firstLineData } = useLineChartData({
    timeline,
    end,
    lineType: firstLineType || '',
    lineTag: firstLineTag || '',
    time,
    skipPolling,
    skipUpdates,
    dataAdapters: dataAdapters as Array<(data: unknown) => unknown> | undefined,
    dataProcessors: dataProcessors as Array<(data: unknown) => unknown> | undefined,
    addYesterdayAggr: isDetailLegends,
    dateRange: dateRange || undefined,
    fields: fields?.[firstLineType || ''] as Record<string, number> | undefined,
    aggrFields: aggrFields?.[firstLineType || ''] as Record<string, number> | undefined,
    isChartLoading,
    isFieldsCompulsory,
    extraTailLogParams: extraTailLogParams?.[firstLineType || ''] as UnknownRecord | undefined,
    aggrDaily,
  })

  const { isLineLoading: isSecondLineLoading, lineData: secondLineData } = useLineChartData({
    timeline: secondaryStatKey || timeline,
    end,
    lineType: secondLineType || '',
    lineTag: secondLineTag || '',
    time,
    skipPolling,
    skipUpdates,
    dataAdapters: dataAdapters as Array<(data: unknown) => unknown> | undefined,
    dataProcessors: dataProcessors as Array<(data: unknown) => unknown> | undefined,
    addYesterdayAggr: isDetailLegends,
    dateRange: dateRange || undefined,
    fields: fields?.[secondLineType || ''] as Record<string, number> | undefined,
    aggrFields: aggrFields?.[secondLineType || ''] as Record<string, number> | undefined,
    isChartLoading,
    isFieldsCompulsory,
    extraTailLogParams: extraTailLogParams?.[secondLineType || ''] as UnknownRecord | undefined,
  })

  const visibleData = (() => {
    const firstDatasets =
      (firstLineData &&
      _isObject(firstLineData) &&
      firstLineData !== null &&
      'datasets' in firstLineData
        ? (firstLineData as { datasets?: unknown[] }).datasets
        : []) || []
    const secondDatasets =
      (secondLineData &&
      _isObject(secondLineData) &&
      secondLineData !== null &&
      'datasets' in secondLineData
        ? (secondLineData as { datasets?: unknown[] }).datasets
        : []) || []
    const longestDataset = _reduce<unknown, Array<{ x: number; y?: number | null }>>(
      _concat(firstDatasets, secondDatasets, []),
      (max: Array<{ x: number; y?: number | null }>, item: unknown) => {
        const itemObj = item as { data?: Array<{ x: number; y?: number | null }> }
        const itemData = itemObj?.data
        return itemData && itemData.length > max.length ? itemData : max
      },
      [] as Array<{ x: number; y?: number | null }>,
    )

    const allDataSets = _concat(
      referenceLine.display && firstDatasets.length && secondDatasets.length
        ? {
            type: 'line',
            label: referenceLine.label,
            currentValue: referenceLine.currentValue,
            legendIcon: referenceLine.legendIcon,
            borderColor: COLOR.YELLOW,
            data: _map(longestDataset, (d: { x: number; y?: number | null }) => ({
              ...d,
              y: referenceLine.value,
            })),
            yesterdayAvg: null,
          }
        : [],
      firstDatasets,
      secondDatasets,
      [],
    )

    const firstDataObj = (
      firstLineData && _isObject(firstLineData) && firstLineData !== null ? firstLineData : {}
    ) as UnknownRecord
    const secondDataObj = (
      secondLineData && _isObject(secondLineData) && secondLineData !== null ? secondLineData : {}
    ) as UnknownRecord
    const data = {
      ...firstDataObj,
      ...secondDataObj,
      datasets: _map(
        _compact(allDataSets),
        (dataset: { label?: string; [key: string]: unknown }) => {
          const isHidden = dataset.label ? legendHidden[dataset.label] : false
          return { ...dataset, visible: !isHidden }
        },
      ),
      isDetailLegends,
    }
    return data
  })()

  const isChartDataUnavailable = useChartDataCheck({
    data: visibleData as { datasets?: unknown[] },
  })

  const getYTicksFormatter = (): ((value: number) => string) | undefined => {
    if (
      firstLineData &&
      _isObject(firstLineData) &&
      firstLineData !== null &&
      'yTicksFormatter' in firstLineData
    ) {
      return (firstLineData as { yTicksFormatter?: (value: number) => string }).yTicksFormatter
    }
    return undefined
  }

  if (isFirstLineLoading || isSecondLineLoading || isChartLoading) {
    return (
      <LoaderContainer>
        <ChartLoadingSkeleton minHeight={CHART_MIN_HEIGHT} />
      </LoaderContainer>
    )
  }

  const headerProps = {
    title: (title ?? null) as string | null,
    data: isChartDataUnavailable ? {} : (visibleData as UnknownRecord),
    timeline,
    legendHidden,
    radioButtons: (radioButtons || []) as Array<{
      value: string
      disabled?: boolean
      label?: string
    }>,
    onChangeTimeline: handleTimelineChange as (timeline: string) => void,
    onClickLegend: handleLegendClick as (index: string) => void,
  } as ComponentProps<typeof LineChartCardHeader>

  const lineChartData = visibleData as unknown as {
    datasets: Array<{
      label?: string
      visible?: boolean
      borderColor?: string
      data: Array<{ x: number; y?: number | null }>
    }>
  }

  return (
    <LineChartCardContainer $row={isRow} $noWrap>
      <LineChartCardHeader {...headerProps} />
      <LineChartContainer key={String(isChartDataUnavailable)}>
        {isChartDataUnavailable ? (
          <NoDataContainer>No records found</NoDataContainer>
        ) : (
          <LineChart
            {...({
              chartRef,
              data: lineChartData,
              yTicksFormatter: getYTicksFormatter(),
              timeline,
              shouldResetZoom,
            } as ComponentProps<typeof LineChart>)}
          />
        )}
      </LineChartContainer>
      {!isChartDataUnavailable ? (
        <LineChartCardFooter
          minMaxAvg={(visibleData as UnknownRecord).minMaxAvg as UnknownRecord | undefined}
          secondaryValueLabel={
            (visibleData as UnknownRecord).secondaryValueLabel as UnknownRecord | undefined
          }
          stats={
            (((visibleData as UnknownRecord).footerStats as
              | Array<{ label: string; value: string | number }>
              | undefined) || []) as unknown as never[]
          }
          statsItemsPerCol={
            (visibleData as UnknownRecord).footerStatsItemsPerCol as number | undefined
          }
        />
      ) : null}
    </LineChartCardContainer>
  )
}

MultipleLineChartCard.propTypes = multipleLineChartCardProptypes

export default withErrorBoundary(MultipleLineChartCard)
