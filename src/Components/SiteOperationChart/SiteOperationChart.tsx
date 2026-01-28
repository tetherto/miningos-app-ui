import _compact from 'lodash/compact'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _toNumber from 'lodash/toNumber'
import _uniqBy from 'lodash/uniqBy'
import { useRef, useState } from 'react'

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

import {
  ChartFooter,
  ChartHeader,
  ChartWrapper,
  Legend,
  LegendItem,
  LegendLabel,
  LegendSquare,
  StyledLink,
  Title,
  Unit,
} from './SiteOperationChart.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'
import LineChart from '@/Components/LineChart/LineChart'
import { CHART_COLORS, COLOR } from '@/constants/colors'
import { useChartDataCheck } from '@/hooks/useChartDataCheck'
import { CHART_HEIGHT_SMALL } from '@/MultiSiteViews/Charts/constants'

type LineDataPoint = { x: number; y: number | null | undefined }
type LineDataset = {
  label?: string
  visible?: boolean
  borderColor: string
  borderWidth?: number
  extraTooltipData?: Record<number, string>
  data: LineDataPoint[]
}
type LineChartData = { datasets: LineDataset[] }

const SITE_OPERATION_CHART_COLORS = [CHART_COLORS.METALLIC_BLUE, CHART_COLORS.red]

export interface SiteOperationsChartProps {
  title?: string
  isLoading?: boolean
  data?: unknown[] | { dataset?: unknown[]; log?: unknown[]; [key: string]: unknown }
  propName?: string
  unit?: string
  nominalValue?: number
  legend?: Array<{ label: string; color?: string }>
  redirectTo?: string
  legendPosition?: 'center' | 'left' | 'right'
  yTicksFormatter?: (value: number) => string
  customDateFormat?: string
  showDateInTooltip?: boolean
  uniformDistribution?: boolean
  hasSmallUnitPadding?: boolean
  skipMinWidth?: boolean
  backgroundColor?: string
  beginAtZero?: boolean
}

const SiteOperationsChart = ({
  title,
  isLoading,
  data = [],
  propName,
  unit,
  nominalValue,
  legend,
  redirectTo = '',
  legendPosition,
  hasSmallUnitPadding = false,
  yTicksFormatter = (value: number) => String(value),
  customDateFormat = 'yyyy-MM-dd',
  showDateInTooltip = false,
  uniformDistribution = false,
  skipMinWidth = true,
  beginAtZero = false,
  backgroundColor = COLOR.TRANSPARENT,
}: SiteOperationsChartProps) => {
  const [legendHidden, setLegendHidden] = useState<Record<string, boolean>>({})
  const chartRef = useRef(null)

  const handleLegendClick = (label: string) => {
    setLegendHidden((prevState: Record<string, boolean>) => ({
      ...prevState,
      [label]: !prevState[label],
    }))
  }

  const dataObj = data as
    | { dataset?: unknown[]; log?: unknown[]; [key: string]: unknown }
    | undefined
  const hasDataset = !_isEmpty(_get(dataObj, ['dataset']))
  const dataLog = _isArray(data) ? data : (_get(dataObj, ['log']) as unknown[] | undefined)

  const getLogData = (_data: unknown): unknown[] =>
    _isArray(_data) ? _data : (_get(_data as UnknownRecord, ['log']) as unknown[] | undefined) || []

  const getMajorDatasetItems = (dataLogParam: unknown) => {
    if (isLoading) return undefined
    return _map(getLogData(dataLogParam), (item: unknown) => {
      const timestamp = _toNumber((item as { ts?: number }).ts)
      return {
        x: _isFinite(timestamp) ? timestamp : 0,
        y: propName ? (item as Record<string, unknown>)[propName] : undefined,
      }
    })
  }

  const majorDatasetItems = getMajorDatasetItems(dataLog)

  const isNominalLineVisible = _isFinite(nominalValue) && !_isEmpty(dataLog)

  const normalizeDatasets = (datasets: unknown): LineDataset[] =>
    _map(datasets as unknown[], (dataset: unknown, index: number) => {
      const label = legend?.[index]?.label
      const datasetData = (dataset as { data?: Array<{ x: number; y?: unknown }> }).data || []
      const uniqIteratee = uniformDistribution
        ? (item: { x?: number }) => (item.x || 0) - ((item.x || 0) % MILLISECONDS_IN_DAY)
        : 'x'

      const processedData = _uniqBy(datasetData, uniqIteratee).sort(
        (a: { x: number }, b: { x: number }) => a.x - b.x,
      )

      return {
        ...(dataset as Record<string, unknown>),
        data: processedData,
        borderColor: SITE_OPERATION_CHART_COLORS[index],
        label,
        visible: label ? !legendHidden[label] : true,
      } as LineDataset
    })

  const getChartData = (): LineChartData => {
    if (isLoading) return { datasets: [] }

    // Base "major" series from log
    const baseSeries = _compact([
      { data: majorDatasetItems },
      isNominalLineVisible &&
        majorDatasetItems && {
          data: _map(majorDatasetItems, (item: { x: number; y?: unknown }) => ({
            ...item,
            y: nominalValue,
          })),
        },
    ])

    // If we have dataset array, map through it
    const rawDatasets =
      hasDataset && dataObj?.dataset
        ? _map(dataObj.dataset, (dataset: unknown) => ({
            ...(dataset as Record<string, unknown>),
            data: getMajorDatasetItems(dataset),
          }))
        : baseSeries

    return { datasets: normalizeDatasets(rawDatasets) }
  }

  const chartData = getChartData()
  const hasNoData = useChartDataCheck({ data: chartData })

  return (
    <ChartWrapper $backgroundColor={backgroundColor}>
      <ChartHeader $hasUnit={!!unit}>
        {title && <Title>{title}</Title>}
        {redirectTo && <StyledLink to={redirectTo}>Expand</StyledLink>}
      </ChartHeader>
      {unit && <Unit $hasSmallUnitPadding={hasSmallUnitPadding}>{unit}</Unit>}

      <ChartContainer
        data={chartData as UnknownRecord}
        isLoading={isLoading}
        minHeight={CHART_HEIGHT_SMALL}
      >
        <LineChart
          data={chartData}
          chartRef={chartRef}
          yTicksFormatter={yTicksFormatter}
          fadedBackground
          disableAutoRange
          skipMinWidth={skipMinWidth}
          customDateFormat={customDateFormat}
          showDateInTooltip={showDateInTooltip}
          uniformDistribution={uniformDistribution}
          beginAtZero={beginAtZero}
          backgroundColor={COLOR.TRANSPARENT}
          unit={unit}
        />
      </ChartContainer>

      {!hasNoData && (
        <ChartFooter>
          {!_isEmpty(legend) && (
            <Legend $alignment={legendPosition}>
              {_map(legend, (item: { label: string; color?: string }, index: number) => (
                <LegendItem
                  key={index}
                  $isHidden={legendHidden[item.label] || false}
                  onClick={() => handleLegendClick(item.label)}
                >
                  <LegendSquare $color={item.color} />
                  <LegendLabel>{item.label}</LegendLabel>
                </LegendItem>
              ))}
            </Legend>
          )}
        </ChartFooter>
      )}
    </ChartWrapper>
  )
}

export default SiteOperationsChart
