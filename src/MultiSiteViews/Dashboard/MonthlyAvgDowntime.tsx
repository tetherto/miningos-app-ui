import { format } from 'date-fns/format'
import _flatMap from 'lodash/flatMap'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'
import _uniq from 'lodash/uniq'
import { useParams } from 'react-router-dom'

import { MultisitePageWrapper } from '../MultiSite.styles'

import type { RegionItem, TimeseriesLogItem } from './Dashboard.types'
import type { ColorType } from './Dashboard.types'

import { useGetDowntimeQuery } from '@/app/services/api'
import { BarChartItemStyle, getBarChartItemStyle } from '@/app/utils/chartUtils'
import { formatNumber } from '@/app/utils/format'
import BarChart, { type BarChartDataset } from '@/Components/BarChart/BarChart'
import MultiSiteDashboardChart from '@/Components/MultiSiteDashboardChart/MultiSiteDashboardChart'
import { PERIOD } from '@/constants/ranges'
import { UNITS } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useMultiSiteRTRequestParams } from '@/hooks/useMultiSiteRTRequestParams'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'

interface DowntimeApiResponse {
  regions?: RegionItem[]
}

interface DowntimeValues {
  curtailment: number
  opIssues: number
}

interface ByRegionLabel {
  [region: string]: {
    [label: string]: DowntimeValues
  }
}

interface LegendDef {
  label: string
  stackGroup: string
  color: string
}

interface DatasetItem {
  label: string
  stackGroup: string
  [label: string]:
    | string
    | number
    | {
        value: number
        style: BarChartItemStyle
      }
}

const MonthlyAvgDowntime = () => {
  const { siteId } = useParams<{ siteId: string }>()
  const { getSiteById, selectedSites } = useMultiSiteMode()
  const site = getSiteById(siteId ?? '')
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}

  const params = buildRequestParams({
    start,
    end,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites: siteId ? [siteId] : (selectedSites as string[]),
    groupByRegion: true,
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
  }

  const {
    data: downtimeData,
    isLoading: isLoadingDowntime,
    isFetching: isDowntimeFetching,
  } = useGetDowntimeQuery(params, options)

  const typedDowntimeData = downtimeData as DowntimeApiResponse | undefined

  const formatTimestamps = (ts: number): string => {
    const timestampFormatTemplate = period === PERIOD.MONTHLY ? 'MM-dd' : 'yyyy-MM-dd'

    return format(new Date(Number(ts)), timestampFormatTemplate)
  }

  const downTimeTimestamps = _flatMap(typedDowntimeData?.regions, ({ log }: RegionItem) =>
    _map((log as TimeseriesLogItem[]) || [], ({ ts }: TimeseriesLogItem) => ts),
  )

  const sortedLabels = _map(_sortBy(_uniq(downTimeTimestamps)), (ts: unknown) =>
    formatTimestamps(ts as number),
  )

  const byRegionLabel: ByRegionLabel = _reduce(
    typedDowntimeData?.regions,
    (acc: ByRegionLabel, { region, log }: RegionItem) => {
      acc[region!] = _reduce(
        (log as TimeseriesLogItem[]) || [],
        (memo: { [label: string]: DowntimeValues }, item: TimeseriesLogItem) => {
          const { ts, curtailmentRate, operationalIssues } = item
          const labelDatapoint = formatTimestamps(ts)
          const curtailment = curtailmentRate || 0
          const opIssues = operationalIssues || 0
          memo[labelDatapoint] = { curtailment, opIssues }
          return memo
        },
        {} as { [label: string]: DowntimeValues },
      )
      return acc
    },
    {} as ByRegionLabel,
  )

  const regionColors = [
    { curtailment: 'BLUE', opIssues: 'RED' },
    { curtailment: 'METALLIC_BLUE', opIssues: 'PURPLE' },
  ] as const

  const legendDefs: LegendDef[] = _flatMap(
    typedDowntimeData?.regions,
    ({ region }: RegionItem, idx: number) => [
      {
        label: `${region} - Curtailment`,
        stackGroup: region!,
        color: regionColors[idx]?.curtailment,
      },
      { label: `${region} - Op. Issues`, stackGroup: region!, color: regionColors[idx]?.opIssues },
    ],
  )

  const groupedStackedDataset: DatasetItem[] = _map(
    legendDefs,
    ({ label, stackGroup, color }: LegendDef) =>
      _reduce(
        sortedLabels,
        (acc: DatasetItem, lbl: string) => {
          const vals = _get(byRegionLabel, [stackGroup, lbl], {
            curtailment: 0,
            opIssues: 0,
          }) as DowntimeValues
          const isCurtailment = /Curtailment$/.test(label)
          const value = isCurtailment ? vals.curtailment : vals.opIssues

          acc[lbl] = {
            value,
            style: getBarChartItemStyle(color as ColorType),
          }
          return acc
        },
        {
          label,
          stackGroup,
        } as DatasetItem,
      ),
  )

  return (
    <MultisitePageWrapper>
      <Header
        site={site}
        isExtended
        hasSiteSelect
        hasBackButton
        backToDestination="dashboard"
        breadcrumbMiddleStep="Dashboard"
        pageTitle="Avg Downtime"
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <MultiSiteDashboardChart
        title="Avg Downtime"
        unit={UNITS.PERCENT}
        isLoading={isLoadingDowntime || isDowntimeFetching}
        data={{ dataset: groupedStackedDataset }}
        dataset={groupedStackedDataset}
      >
        <BarChart
          isStacked
          allowGrouping
          isLegendVisible
          data={{ dataset: groupedStackedDataset as unknown as BarChartDataset }}
          yTicksFormatter={(value: number) => formatNumber(value)}
        />
      </MultiSiteDashboardChart>
    </MultisitePageWrapper>
  )
}

export default MonthlyAvgDowntime
