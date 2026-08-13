import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _padStart from 'lodash/padStart'
import _reduce from 'lodash/reduce'
import _some from 'lodash/some'
import _sortBy from 'lodash/sortBy'
import _split from 'lodash/split'
import _toUpper from 'lodash/toUpper'
import _uniq from 'lodash/uniq'
import { useParams } from 'react-router-dom'

import { MultisitePageWrapper } from '../MultiSite.styles'

import type { ColorType } from './Dashboard.types'
import type { MonthlyLogItem, RegionItem, SeriesDef } from './Dashboard.types'

import { useGetCostProductionQuery } from '@/app/services/api'
import { BarChartItemStyle, getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatNumber } from '@/app/utils/format'
import BarChart, { type BarChartDataset } from '@/Components/BarChart/BarChart'
import MultiSiteDashboardChart from '@/Components/MultiSiteDashboardChart/MultiSiteDashboardChart'
import { CURRENCY } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useMultiSiteRTRequestParams } from '@/hooks/useMultiSiteRTRequestParams'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

interface CostProductionApiResponse {
  regions?: RegionItem[]
}

interface BarChartDatasetItem {
  label: string
  [monthLabel: string]:
    | string
    | {
        value?: number
        style: BarChartItemStyle
      }
}

const BtcProduction = () => {
  const { siteId } = useParams<{ siteId: string }>()
  const { getSiteById, siteList, selectedSites } = useMultiSiteMode()
  const site = getSiteById(siteId ?? '')
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const EXTRA_SERIES = 'BTC PRICE'
  const colors = ['BLUE', 'RED', 'GREEN'] as const

  const dateRangeTyped = dateRange as DateRange | undefined
  const { start, end, period } = dateRangeTyped ?? {}

  const seriesDefs: SeriesDef[] = _map(
    [
      ..._map(siteId ? [{ id: siteId }] : siteList, ({ id }: { id: string }) => _toUpper(id)),
      EXTRA_SERIES,
    ],
    (site: string, idx: number) => ({
      label: _toUpper(site),
      color: colors[idx % colors.length] as ColorType,
    }),
  )

  const params = buildRequestParams({
    start: start ?? 0,
    end: end ?? 0,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites: siteId ? [siteId] : (selectedSites as string[]),
    groupByRegion: true,
  })

  const options = {
    skip: !dateRangeTyped?.start || !dateRangeTyped?.end || isParamBuilderLoading,
  }

  const {
    data: costProductionData,
    isLoading: isLoadingCostProduction,
    isFetching: isCostProductionFetching,
  } = useGetCostProductionQuery(params, options)

  const typedCostProductionData = costProductionData as CostProductionApiResponse | undefined

  const makeMonthList = (regions: RegionItem[]): string[] => {
    const monthLabels = _uniq(
      _flatMap(regions, ({ log }: RegionItem) =>
        _map(log as MonthlyLogItem[], (item: MonthlyLogItem) => {
          const month = _padStart(String(item.month), 2, '0')
          return `${item.year}-${month}`
        }),
      ),
    )
    return _sortBy(monthLabels, (label: string) => {
      const [yy, mm] = _split(label, '-')
      return new Date(Number(yy), Number(mm) - 1).getTime()
    })
  }

  const buildBarChartDataset = (
    apiResponse: CostProductionApiResponse | undefined,
    seriesDefs: SeriesDef[],
  ): { dataset: BarChartDatasetItem[] } => {
    if (!_get(apiResponse, ['regions'])) {
      return { dataset: [] }
    }
    const months = makeMonthList(apiResponse?.regions ?? [])

    return {
      dataset: _map(seriesDefs, ({ label, color }: SeriesDef) =>
        _reduce(
          months,
          (acc: BarChartDatasetItem, monthLabel: string) => {
            const [yy, mm] = _split(monthLabel, '-')
            let value: number | null
            const year = Number(yy)
            const month = Number(mm)
            if (label === EXTRA_SERIES) {
              const regionWithData = _find(apiResponse?.regions, (r: RegionItem) =>
                _some(r.log as MonthlyLogItem[], { month, year }),
              )
              const logItem = _find(regionWithData?.log as MonthlyLogItem[] | undefined, {
                month,
                year,
              })
              value = logItem ? (logItem.btcPrice ?? null) : null
            } else {
              const regionData = _find(apiResponse?.regions, { region: label })
              const logItem = _find(regionData?.log as MonthlyLogItem[] | undefined, {
                month,
                year,
              })
              value = logItem ? (logItem.productionCostUSD ?? null) : null
            }

            const result: BarChartDatasetItem = {
              ...acc,
              [monthLabel]: {
                value: value ?? undefined,
                style: getBarChartItemStyle(color),
              },
            }
            return result
          },
          { label } as BarChartDatasetItem,
        ),
      ),
    }
  }

  const barChartDataset = buildBarChartDataset(typedCostProductionData, seriesDefs)

  return (
    <MultisitePageWrapper>
      <Header
        pageTitle="Bitcoin Production Costs"
        hasBackButton
        breadcrumbMiddleStep="Dashboard"
        backToDestination="dashboard"
        selected={selectedSites as string[]}
        site={site}
        isExtended
        isMonthSelectVisible={false}
        isWeekSelectVisible={false}
        dateRange={dateRangeTyped}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <MultiSiteDashboardChart
        unit={CURRENCY.USD_LABEL}
        title="Bitcoin Production Costs"
        isLoading={isLoadingCostProduction || isCostProductionFetching}
        data={barChartDataset}
        dataset={barChartDataset.dataset}
      >
        <BarChart
          isLegendVisible
          allowGrouping
          displayColors={false}
          data={barChartDataset as unknown as { dataset: BarChartDataset }}
          yTicksFormatter={(value: number) => formatNumber(value)}
        />
      </MultiSiteDashboardChart>
    </MultisitePageWrapper>
  )
}

export default BtcProduction
