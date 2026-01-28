import Button from 'antd/es/button'
import { Chart, registerables } from 'chart.js'
import _capitalize from 'lodash/capitalize'
import _compact from 'lodash/compact'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import _sum from 'lodash/sum'
import _toNumber from 'lodash/toNumber'
import { useEffect, FC, ComponentProps } from 'react'

import { BarSteppedLineChart } from '../BarSteppedLineChart/BarSteppedLineChart'
import { ChartCardContainer } from '../Card/Card.styles'
import ChartLoadingSkeleton from '../ChartLoadingSkeleton/ChartLoadingSkeleton'

import { formatValue } from './ConsumedVsAvailableEnergy.utils'
import EditExclusionThresholdModal from './EditExclusionThresholdModal'
import { ConsumedVsAvailableEnergyBarChartRoot, ThresholdNotice } from './styles'

import { useGetExtDataQuery, useGetGlobalDataQuery, useGetSiteQuery } from '@/app/services/api'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import {
  convertEnergyToRange,
  getExtDataGroupRange,
  getRangeStatsKey,
  prepareDataForCharts,
  transformStatsHistoryData,
} from '@/app/utils/electricityUtils'
import { formatNumber } from '@/app/utils/format'
import { getKunaEnergyAggr } from '@/app/utils/reportingToolsUtils'
import { DATE_RANGE } from '@/constants'
import { useContextualModal } from '@/hooks/useContextualModal'

Chart.register(...registerables)

const ENERGY_DATASETS_ORDER = {
  available: 1,
  consumed: 0,
}

type RangeType = '1m' | '5m' | '15m' | '30m' | '1h' | '3h' | '1D' | '1W' | '1M'

interface DateRange {
  start: number
  end: number
}

interface BarChartDataSet {
  data: number[]
  label?: string
  order?: number
  customLabel?: string
}

interface BarChartData {
  labels?: string[]
  dataSet1?: BarChartDataSet
}

interface FooterStatsDataset {
  hasFooterStats?: boolean
  data?: unknown[]
  label?: string
}

interface ConsumedVsAvailableEnergyBarChartProps {
  dateRange?: DateRange
  range?: RangeType
  barOptions?: UnknownRecord
  lineOptions?: UnknownRecord
  statOptions?: UnknownRecord
  showUnavailableEnergy?: boolean
  onStatsData?: (data: unknown) => void
}

export const ConsumedVsAvailableEnergyBarChart: FC<ConsumedVsAvailableEnergyBarChartProps> = ({
  dateRange,
  range,
  barOptions,
  lineOptions,
  statOptions,
  showUnavailableEnergy = false,
  onStatsData,
}) => {
  const statsHistoryQuery = {
    type: 'electricity',
    query: JSON.stringify({
      key: 'stats-history',
      start: dateRange?.start,
      end: dateRange?.end,
      groupRange: getExtDataGroupRange(range as (typeof DATE_RANGE)[keyof typeof DATE_RANGE]),
      dataInterval:
        getRangeStatsKey(range as (typeof DATE_RANGE)[keyof typeof DATE_RANGE]) === DATE_RANGE.H1
          ? '1h'
          : '15min',
    }),
  }

  const { data: rawTailLogData, isLoading } = useGetExtDataQuery(statsHistoryQuery)

  const tailLogData = transformStatsHistoryData(rawTailLogData) as unknown[]

  const { data: siteData } = useGetSiteQuery(undefined)
  const currentSite = _capitalize(_get(siteData, ['site']))

  const {
    data: siteEnergyGlobalData,
    isLoading: isGlobalDataLoading,
    refetch: refetchSiteEnergyGlobalData,
  } = useGetGlobalDataQuery(
    {
      type: 'siteEnergy',
      query: JSON.stringify({ site: { $eq: currentSite } }),
      overwriteCache: true,
    },
    {
      skip: _isEmpty(currentSite),
    },
  )

  const siteEnergyDataThresholdMWh =
    (
      _last(siteEnergyGlobalData as Array<{ energyExclusionThresholdMwh?: number }>) as
        | { energyExclusionThresholdMwh?: number }
        | undefined
    )?.energyExclusionThresholdMwh || null

  const {
    modalOpen: editExclusionThresholdModalOpen,
    handleOpen: openEditExclusionThresholdModal,
    handleClose: closeEditExclusionThresholdModal,
  } = useContextualModal({
    onClose: () => {
      void refetchSiteEnergyGlobalData()
    },
  })

  const handleEditThreshold = () => {
    openEditExclusionThresholdModal(undefined)
  }

  const { barChartData, overConsumptionStat } = (() => {
    const kunaAggrData = getKunaEnergyAggr(
      tailLogData as Array<{ ts: number; [key: string]: unknown }>,
    )
    const convertedData = convertEnergyToRange(
      kunaAggrData as Array<{ ts?: number; [key: string]: unknown }>,
    )

    const {
      labels,
      datasets: [energyConsumed],
    } = prepareDataForCharts(
      convertedData as Array<{
        ts: number
        usedEnergy: number
        availableEnergy: number
        label?: string
        date?: string
        [key: string]: unknown
      }>,
      lineOptions as { label: string; propName: string } | undefined,
      barOptions
        ? ({
            label: barOptions.label || '',
            propName: barOptions.propName || '',
            color: barOptions.color,
            hasFooterStats: barOptions.hasFooterStats,
          } as { label: string; propName: string; color?: string; hasFooterStats?: boolean })
        : ({ label: '', propName: '' } as { label: string; propName: string }),
      showUnavailableEnergy,
      siteEnergyDataThresholdMWh,
    )

    return {
      barChartData: {
        labels,
        dataSet1: {
          ...energyConsumed,
          order: ENERGY_DATASETS_ORDER.consumed,
          customLabel: barOptions?.customLabel,
        },
      },
      overConsumptionStat: statOptions
        ? {
            data: _map(convertedData, (item: UnknownRecord) =>
              Math.max(
                0,
                (item[statOptions?.propName as string] as number) -
                  (item[lineOptions?.propName as string] as number),
              ),
            ),
            label: (statOptions as { label?: string })?.label,
            hasFooterStats: true,
          }
        : {},
    }
  })()

  const { labels, dataSet1 } = barChartData || {}

  const footerStats = _reduce(
    ([dataSet1, overConsumptionStat] as FooterStatsDataset[]).filter(
      (d): d is FooterStatsDataset & { hasFooterStats: true; data: unknown[] } =>
        Boolean(d?.hasFooterStats && !_isEmpty(d.data)),
    ),
    (
      acc: Array<{ label: string; value: string }>,
      dataset: FooterStatsDataset & { hasFooterStats: true; data: unknown[] },
    ) => {
      const filteredData = _compact(dataset.data)

      const totalStatValue = _sum(_map(filteredData, _toNumber))

      const totalStat = {
        label: `Total ${dataset.label || ''}`,
        value: formatValue(totalStatValue),
      }
      const avgStat = {
        label: `Avg ${dataset.label || ''}`,
        value: formatValue(totalStatValue / _size(filteredData)),
      }

      return [...acc, totalStat, avgStat]
    },
    [] as Array<{ label: string; value: string }>,
  )

  useEffect(() => {
    if (dataSet1?.data && onStatsData) {
      onStatsData([
        {
          ...footerStats,
          [dataSet1.label || '']: _map(
            labels,
            (_label: unknown, index: number) => dataSet1?.data[index] || 0,
          ),
        },
      ])
    }
  }, [dataSet1?.data, labels, footerStats, onStatsData, dataSet1?.label])

  return (
    <ConsumedVsAvailableEnergyBarChartRoot>
      {isLoading || isGlobalDataLoading ? (
        <ChartLoadingSkeleton />
      ) : (
        <>
          <ChartCardContainer $tall={statOptions && !_isEmpty(footerStats)} $noBorder>
            <BarSteppedLineChart
              {...({
                showDifference: true,
                chartData: barChartData as BarChartData,
                yTicksFormatter: formatValue,
                isBarDynamicallyColored: true,
                footerStats,
              } as ComponentProps<typeof BarSteppedLineChart>)}
            />
          </ChartCardContainer>
          <ThresholdNotice>
            {siteEnergyDataThresholdMWh && (
              <p>
                Notice: Hours with consumptions &lt;{' '}
                {formatNumber(siteEnergyDataThresholdMWh * 1000)} KWh are excluded from the
                calculations
              </p>
            )}
            <Button onClick={handleEditThreshold}>Edit Exclusion Threshold</Button>
          </ThresholdNotice>
          {editExclusionThresholdModalOpen && (
            <EditExclusionThresholdModal
              isOpen={editExclusionThresholdModalOpen}
              onClose={closeEditExclusionThresholdModal}
              threshold={siteEnergyDataThresholdMWh ?? undefined}
              site={currentSite}
            />
          )}
        </>
      )}
    </ConsumedVsAvailableEnergyBarChartRoot>
  )
}
