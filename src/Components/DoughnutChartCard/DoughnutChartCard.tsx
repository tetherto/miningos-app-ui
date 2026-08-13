import Empty from 'antd/es/empty'
import type { Chart as ChartJS } from 'chart.js'
import _every from 'lodash/every'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isNumber from 'lodash/isNumber'
import _keys from 'lodash/keys'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import ChartLoadingSkeleton from '../ChartLoadingSkeleton/ChartLoadingSkeleton'
import DoughnutChart from '../DoughnutChart/DoughnutChart'

import {
  DOUGHNUT_CHART_DEFAULT_MIN_HEIGHT,
  MAX_FRACTION_DIGITS_FOR_LEGEND_LABELS,
} from './DoughnutChartCard.const'
import {
  DoughnutChartCardContainer,
  DoughnutChartInfoCard,
  DoughnutChartInfoCardContainer,
  DoughnutChartInfoCardLabel,
  DoughnutChartInfoCardValue,
  DoughnutChartWrapper,
  LegendLabelsContainer,
} from './DoughnutChartCard.styles'
import { LegendLabels } from './LegendLabels'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { CHART_EMPTY_DESCRIPTION } from '@/constants/charts'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

interface DoughnutChartCardProps {
  data?: UnknownRecord
  flexCol?: boolean
  flexRevCol?: boolean
  isLoading?: boolean
  isReversed?: boolean
  useBracketsForPct?: boolean
  legendPercentOnTop?: boolean
  maximumFractionDigits?: number
}

const DoughnutChartCard = ({
  data,
  flexCol = false,
  flexRevCol = false,
  isLoading = false,
  isReversed = false,
  useBracketsForPct = false,
  legendPercentOnTop = false,
  maximumFractionDigits = MAX_FRACTION_DIGITS_FOR_LEGEND_LABELS,
}: DoughnutChartCardProps) => {
  const { isMultiSiteModeEnabled } = useMultiSiteMode()

  const chartRef = useRef<ChartJS<'doughnut'> | null>(null)
  const [hiddenLegendItems, setHiddenLegendItems] = useState<Record<number, boolean>>({})

  const datasetKeySignature = useMemo(() => {
    const datasetKeys = _keys(
      (data as { dataset?: Record<string, unknown> } | undefined)?.dataset || {},
    )
    return datasetKeys.join('|')
  }, [data])

  useEffect(() => {
    setHiddenLegendItems({})
  }, [datasetKeySignature])

  const onToggleItem = useCallback((index: number) => {
    const chart = chartRef.current
    if (!chart) return

    chart.toggleDataVisibility(index)
    chart.update()
    setHiddenLegendItems((prev) => ({
      ...prev,
      [index]: !chart.getDataVisibility(index),
    }))
  }, [])
  const unit = data?.unit || ''
  const dataset = data?.dataset || {}

  const hasNoData =
    _isEmpty(dataset) ||
    _every(dataset, (entry) => {
      const value = _get(entry, ['value'])

      return !_isNumber(value) || value === 0
    })

  if (isLoading) {
    return <ChartLoadingSkeleton minHeight={DOUGHNUT_CHART_DEFAULT_MIN_HEIGHT} />
  }

  return (
    <DoughnutChartCardContainer $isReversed={isReversed} $isMultiSite={isMultiSiteModeEnabled}>
      {!isLoading && hasNoData ? (
        <Empty description={CHART_EMPTY_DESCRIPTION} />
      ) : (
        <>
          <DoughnutChartInfoCardContainer>
            {data && data.label !== null && data.value !== null && (
              <DoughnutChartInfoCard>
                <DoughnutChartInfoCardLabel>{String(data.label)}</DoughnutChartInfoCardLabel>
                {data.value !== null && (
                  <DoughnutChartInfoCardValue>
                    {`${String(data.value)} ${unit}`}
                  </DoughnutChartInfoCardValue>
                )}
              </DoughnutChartInfoCard>
            )}
            <LegendLabelsContainer $isMultiSite={isMultiSiteModeEnabled}>
              <LegendLabels
                data={data}
                flexCol={flexCol}
                flexRevCol={flexRevCol}
                useBracketsForPct={useBracketsForPct}
                legendPercentOnTop={legendPercentOnTop}
                maximumFractionDigits={maximumFractionDigits}
                hiddenItems={hiddenLegendItems}
                onToggleItem={onToggleItem}
              />
            </LegendLabelsContainer>
          </DoughnutChartInfoCardContainer>
          <DoughnutChartWrapper>
            <DoughnutChart
              data={data}
              chartRef={chartRef}
              tooltipValueFormatter={(value: number | undefined) => {
                if (!_isNumber(value)) return ''

                return `${formatNumber(value, { maximumFractionDigits })} ${unit}`
              }}
            />
          </DoughnutChartWrapper>
        </>
      )}
    </DoughnutChartCardContainer>
  )
}

export default DoughnutChartCard
