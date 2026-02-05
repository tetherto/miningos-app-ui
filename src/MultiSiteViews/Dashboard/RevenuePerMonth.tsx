import { format } from 'date-fns/format'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _keyBy from 'lodash/keyBy'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _some from 'lodash/some'
import _toUpper from 'lodash/toUpper'
import { useParams } from 'react-router'

import { MultisitePageWrapper } from '../MultiSite.styles'

import type { ColorType, RegionItem, SeriesDef, TimeseriesLogItem } from './Dashboard.types'

import { useGetRevenueQuery } from '@/app/services/api'
import { BarChartItemStyle, getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatNumber } from '@/app/utils/format'
import BarChart from '@/Components/BarChart/BarChart'
import MultiSiteDashboardChart from '@/Components/MultiSiteDashboardChart/MultiSiteDashboardChart'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useMultiSiteRTRequestParams from '@/hooks/useMultiSiteRTRequestParams'
import { getStackedComparisonDataset } from '@/MultiSiteViews/Charts/helper'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'

interface RevenueApiResponse {
  regions?: RegionItem[]
}

interface StackedConfig {
  dataKeys: string[]
  selectedLabels: string[]
  seriesDefs: SeriesDef[]
  defaultColor?: ColorType
}

interface StackedConfigResult {
  stackOnTop: boolean
  labelName: string
  keyA: string
  keyB: string
  labels: Record<string, string>
  colors: Record<string, ColorType>
}

interface RevenueLabel {
  ts: number
  label: string
}

interface RevChartDatasetItem {
  label: string
  revenue1?: number
  revenue2?: number
}

interface BarChartDatasetItem {
  label: string
  stackGroup?: string
  [monthLabel: string]: string | { value: number; style: Record<string, string> } | undefined
}

const RevenuePerMonth = () => {
  const { siteId } = useParams<{ siteId: string }>()
  const { getSiteById, siteList, selectedSites, isLoading: isLoadingSiteList } = useMultiSiteMode()
  const site = getSiteById(siteId ?? '') as {
    id: string
    name: string
    url: string
    label: string
    value: string
  }
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams } = useMultiSiteRTRequestParams()
  const { start, end, period } = dateRange ?? {}

  const makeStackedConfig = ({
    dataKeys,
    selectedLabels,
    seriesDefs,
    defaultColor = 'BLUE',
  }: StackedConfig): StackedConfigResult => {
    const byLabel = _keyBy(seriesDefs, 'label')
    const [keyA, keyB] = dataKeys
    const [labelA, labelB] = selectedLabels

    return {
      stackOnTop: true,
      labelName: 'label',
      keyA,
      keyB,
      labels: {
        [keyA]: labelA,
        [keyB]: labelB,
      },
      colors: {
        [keyA]: _get(byLabel, [labelA, 'color'], defaultColor) as ColorType,
        [keyB]: _get(byLabel, [labelB, 'color'], defaultColor) as ColorType,
      },
    }
  }

  const params = buildRequestParams({
    start,
    end,
    period: (period as 'daily' | 'weekly' | 'monthly') || PERIOD.DAILY,
    sites: siteId ? [siteId] : selectedSites,
    groupByRegion: true,
  })

  const options = {
    skip: isLoadingSiteList,
  }

  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    isFetching: isRevenueFetching,
  } = useGetRevenueQuery(params, options)

  const typedRevenueData = revenueData as RevenueApiResponse | undefined

  const colors: readonly ColorType[] = ['BLUE', 'RED', 'GREEN'] as const

  const seriesDefs: SeriesDef[] = _map(
    [..._map(siteId ? [{ id: siteId }] : siteList, ({ id }: { id: string }) => _toUpper(id))],
    (site, idx) => ({
      label: _toUpper(site),
      color: colors[idx] as ColorType,
    }),
  )

  const timestampFormatTemplate = period === PERIOD.MONTHLY ? 'MM-dd' : 'yyyy-MM-dd'

  const revenueLabels: RevenueLabel[] = _map(
    _head(typedRevenueData?.regions)?.log as TimeseriesLogItem[] | undefined,
    (item: TimeseriesLogItem) => ({
      ts: item.ts,
      label: format(item.ts, timestampFormatTemplate),
    }),
  )

  const revChartDataset: RevChartDatasetItem[] = _map(revenueLabels, ({ label }, idx) => ({
    label,
    revenue1: (typedRevenueData?.regions?.[0]?.log as TimeseriesLogItem[] | undefined)?.[idx]
      ?.totalRevenueBTC,
    revenue2: (typedRevenueData?.regions?.[1]?.log as TimeseriesLogItem[] | undefined)?.[idx]
      ?.totalRevenueBTC,
  }))

  const config = makeStackedConfig({
    dataKeys: ['revenue1', 'revenue2'],
    selectedLabels: _map(siteList, ({ id }) => _toUpper(id)),
    seriesDefs,
  })

  const revenueBarChartDataset = {
    dataset: [
      {
        label: _toUpper(site?.id),
        ..._reduce(
          revenueLabels,
          (acc, { label }, idx) => ({
            ...acc,
            [label]: {
              value:
                (_head(typedRevenueData?.regions)?.log as TimeseriesLogItem[] | undefined)?.[idx]
                  ?.totalRevenueBTC || 0,
              style: getBarChartItemStyle('BLUE'),
            },
          }),
          {} as Record<string, { value: number; style: BarChartItemStyle }>,
        ),
      } as BarChartDatasetItem,
    ],
  }

  const stackedChartDatasetRaw = getStackedComparisonDataset(revChartDataset, config, undefined)

  const stackedChartDataset = _map(
    stackedChartDatasetRaw as RevChartDatasetItem[],
    (ds: RevChartDatasetItem) => ({
      ...ds,
      stackGroup: 'revenue',
    }),
  ) as BarChartDatasetItem[]

  const hasRevenueData = _some(
    revChartDataset,
    ({ revenue1, revenue2 }) =>
      (revenue1 !== undefined && revenue1 !== 0) || (revenue2 !== undefined && revenue2 !== 0),
  )

  const hasNoData =
    _isEmpty(typedRevenueData?.regions) || _isEmpty(revenueLabels) || !hasRevenueData

  const chartData = siteId ? revenueBarChartDataset : { dataset: stackedChartDataset }
  const chartDataset = siteId ? revenueBarChartDataset.dataset : stackedChartDataset

  return (
    <MultisitePageWrapper>
      <Header
        pageTitle="Revenues"
        selected={[site.id]}
        hasBackButton
        backToDestination="dashboard"
        breadcrumbMiddleStep="Dashboard"
        site={site}
        isExtended
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <MultiSiteDashboardChart
        title="Revenues"
        unit={CURRENCY.BTC}
        isLoading={isLoadingRevenue || isRevenueFetching}
        data={hasNoData ? undefined : chartData}
        dataset={hasNoData ? undefined : chartDataset}
      >
        <BarChart
          isStacked
          isLegendVisible
          data={hasNoData ? undefined : chartData}
          yTicksFormatter={(value: number) =>
            formatNumber(value, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
          }
        />
      </MultiSiteDashboardChart>
    </MultisitePageWrapper>
  )
}

export default RevenuePerMonth
