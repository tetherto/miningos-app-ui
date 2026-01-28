import type { IChartApi } from 'lightweight-charts'
import _filter from 'lodash/filter'
import _isEqual from 'lodash/isEqual'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import { useEffect, useRef, useState } from 'react'

import { getChartDataAvailability } from '../../app/utils/chartUtils'
import ChartLoadingSkeleton from '../ChartLoadingSkeleton/ChartLoadingSkeleton'
import LineChart from '../LineChart/LineChart'
import { LineChartData } from '../LineChart/LineChart.utils'

import { CHART_MIN_HEIGHT } from './helper'
import { LineChartCardContainer, LineChartContainer, NoDataContainer } from './LineChartCard.styles'
import LineChartCardFooter from './LineChartCardFooter'
import LineChartCardHeader from './LineChartCardHeader'
import { processDataset } from './utils'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import type { TailLogDataItem } from '@/hooks/hooks.types'

interface RadioButton {
  value: string
  disabled?: boolean
  label?: string
}

interface DropdownItem {
  value: string
  label: string
  [key: string]: unknown
}

interface DropdownGroup {
  key: string
  type: string
  label: string
  children: DropdownItem[]
}

interface ProcessedDataset {
  [key: string]: Array<{ ts: number; [key: string]: unknown }>
}

interface ChartDataset {
  label: string
  visible?: boolean
  [key: string]: unknown
}

interface ChartData {
  datasets: ChartDataset[]
  yTicksFormatter?: (value: number) => string
  skipRound?: boolean
  minMaxAvg?: UnknownRecord
  secondaryValueLabel?: string
  [key: string]: unknown
}

type DataProcessor = ((data: unknown) => unknown) | null | undefined

interface DecoupledLineChartCardProps {
  dataAdapter?: (data: ProcessedDataset) => ChartData
  radioButtons?: RadioButton[]
  dropdownItems?: DropdownItem[] | DropdownGroup[]
  dataProcessor?: DataProcessor
  skipPolling?: boolean
  isDetailLegends?: boolean
  isRow?: boolean
  shouldResetZoom?: boolean
  tailLogData: TailLogDataItem[] | ProcessedDataset | null | undefined
  tailLogDataUpdates: TailLogDataItem[] | ProcessedDataset | null | undefined
  setTimeline: (value: string) => void
  timeline: string
  isLoading?: boolean
  end?: number
  setEnd: (value: number) => void
}

const DecoupledLineChartCardComponent = ({
  dataAdapter = (data: ProcessedDataset) => data as ChartData,
  radioButtons = [],
  dataProcessor = undefined as DataProcessor,
  skipPolling = false,
  isDetailLegends = false,
  isRow = false,
  shouldResetZoom = true,
  tailLogData,
  tailLogDataUpdates,
  setTimeline,
  timeline,
  isLoading = false,
  end = Date.now(),
  setEnd,
}: DecoupledLineChartCardProps) => {
  const [legendHidden, setLegendHidden] = useState<UnknownRecord>({})
  const [dataset, setDataset] = useState<ProcessedDataset>({})
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!tailLogData) return
    const tailLogDataObj = Array.isArray(tailLogData)
      ? { default: tailLogData }
      : (tailLogData as ProcessedDataset)
    const newDataset = processDataset(
      tailLogDataObj,
      dataset,
      dataProcessor ?? null,
    ) as ProcessedDataset
    if (!_isEqual(newDataset, dataset)) {
      setDataset(newDataset)
    }
  }, [tailLogData, end, dataProcessor, dataset])

  useEffect(() => {
    if (skipPolling || !tailLogDataUpdates) return
    const tailLogDataObj = Array.isArray(tailLogDataUpdates)
      ? { default: tailLogDataUpdates }
      : (tailLogDataUpdates as ProcessedDataset)
    const newDataset = processDataset(
      tailLogDataObj,
      dataset,
      dataProcessor ?? null,
    ) as ProcessedDataset
    if (!_isEqual(newDataset, dataset)) {
      setDataset(newDataset)
    }
  }, [tailLogDataUpdates, end, dataProcessor, skipPolling, dataset, tailLogData])

  const handleTimelineChange = (timeline: string) => {
    chartRef.current?.timeScale().resetTimeScale()
    setTimeline(timeline)
    setEnd(Date.now())
  }

  const handleLegendClick = (label: string) => {
    setLegendHidden((prevState: UnknownRecord) => ({
      ...prevState,
      [label]: !prevState[label],
    }))
  }

  const data = dataAdapter(
    _reduce(
      _keys(dataset),
      (prev, current) => ({
        ...prev,
        [current]: _sortBy(_filter(dataset[current], 'ts'), 'ts'),
      }),
      {},
    ),
  )

  const visibleData = {
    ...data,
    datasets: _map(data.datasets, (dataset: ChartDataset) => ({
      ...dataset,
      visible: !legendHidden[dataset.label],
    })) as ChartDataset[],
    isDetailLegends,
  }

  const isChartDataUnavailable = getChartDataAvailability(
    visibleData.datasets as unknown as import('chart.js').ChartDataset[],
  )

  return (
    <LineChartCardContainer $row={isRow}>
      {isLoading ? (
        <ChartLoadingSkeleton minHeight={CHART_MIN_HEIGHT} />
      ) : (
        <>
          <LineChartCardHeader
            data={isChartDataUnavailable ? ({} as UnknownRecord) : (visibleData as UnknownRecord)}
            radioButtons={
              radioButtons as Array<{ value: string; disabled?: boolean; label?: string }>
            }
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
                yTicksFormatter={data.yTicksFormatter}
                skipRound={data.skipRound}
                timeline={timeline}
                shouldResetZoom={shouldResetZoom}
              />
            )}
          </LineChartContainer>
          {!isChartDataUnavailable ? (
            <LineChartCardFooter
              minMaxAvg={data.minMaxAvg as UnknownRecord}
              secondaryValueLabel={data.secondaryValueLabel as unknown as UnknownRecord}
            />
          ) : null}
        </>
      )}
    </LineChartCardContainer>
  )
}

const decoupledLineChartCardProptypes = {}

DecoupledLineChartCardComponent.propTypes = decoupledLineChartCardProptypes

export const DecoupledLineChartCard = DecoupledLineChartCardComponent
