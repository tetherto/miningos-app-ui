import { format } from 'date-fns/format'
import _capitalize from 'lodash/capitalize'
import _cloneDeep from 'lodash/cloneDeep'
import _every from 'lodash/every'
import _find from 'lodash/find'
import _flatMap from 'lodash/flatMap'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _padStart from 'lodash/padStart'
import _reduce from 'lodash/reduce'
import _some from 'lodash/some'
import _sortBy from 'lodash/sortBy'
import _split from 'lodash/split'
import _toUpper from 'lodash/toUpper'
import _uniq from 'lodash/uniq'
import _values from 'lodash/values'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { getEfficiencyString } from '../../app/utils/format'
import { CHART_COLORS } from '../../constants/colors'
import { CHART_HEIGHT } from '../Charts/constants'
import { MultisitePageWrapper } from '../MultiSite.styles'
import { MetricCard } from '../SharedComponents/MetricCard'

import { updateMetricFromData } from './Dashboard.helpers'
import { ChartsSection, DashboardCardWrapper } from './Dashboard.styles'
import type {
  ColorType,
  DashboardApiResponse,
  MetricValue,
  MetricsState,
  MonthlyLogItem,
  RegionItem,
  SeriesDef,
  TimeseriesLogItem,
} from './Dashboard.types'

import {
  useGetCostProductionQuery,
  useGetDowntimeQuery,
  useGetOperationsConsumptionQuery,
  useGetOperationsEfficiencyQuery,
  useGetOperationsHashrateQuery,
  useGetRevenueQuery,
} from '@/app/services/api'
import { BarChartItemStyle, getBarChartItemStyle } from '@/app/utils/chartUtils'
import { getConsumptionString, getHashrateUnit } from '@/app/utils/deviceUtils'
import { formatHashrateUnit, formatNumber } from '@/app/utils/format'
import Accordion from '@/Components/Accordion/Accordion'
import BarChart from '@/Components/BarChart/BarChart'
import type { BarChartData } from '@/Components/BarChart/BarChart'
import MultiSiteDashboardChart from '@/Components/MultiSiteDashboardChart/MultiSiteDashboardChart'
import SiteOperationsChart from '@/Components/SiteOperationChart/SiteOperationChart'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useMultiSiteRTRequestParams } from '@/hooks/useMultiSiteRTRequestParams'
import { ALL_SITES } from '@/MultiSiteViews/constants'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

interface Site {
  id: string
  name: string
  url: string
  label: string
  value: string
}

interface BarChartDatasetItem {
  label: string
  [monthLabel: string]:
    | string
    | number
    | {
        value: number | null
        style: BarChartItemStyle
      }
}

interface BarChartDataset {
  dataset: BarChartDatasetItem[]
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
  [label: string]: string | number | { value: number; style: Record<string, string> }
}

const METRICS: Record<string, Omit<MetricValue, 'value'> & { value: string | number }> = {
  btcMined: {
    label: 'Bitcoin mined',
    unit: CURRENCY.BTC,
    value: '',
    isHighlighted: true,
  },
  avgEnergyCost: {
    label: 'Avg Energy All-in Cost',
    unit: `${CURRENCY.USD}/${UNITS.ENERGY_MW}`,
    value: '',
  },
  avgHashrate: {
    label: 'Avg Hashrate',
    value: '',
    formatter: (value) => formatHashrateUnit(getHashrateUnit(value, 2, UNITS.HASHRATE_PH_S)),
  },
  avgBtcCost: {
    label: 'Avg Bitcoin Prod. Cost',
    unit: CURRENCY.USD,
    value: '',
  },
  avgEfficiency: {
    isHighlighted: true,
    label: 'Avg Efficiency',
    value: '',
    formatter: getEfficiencyString,
  },
  avgEnergyRevenue: {
    label: 'Avg Energy Revenue',
    unit: `${CURRENCY.USD}/${UNITS.ENERGY_MW}`,
    value: '',
  },
  avgPowerConsumption: {
    label: 'Avg Power Consumption',
    value: '',
    formatter: getConsumptionString,
  },
  avgDowntime: {
    label: 'Avg Downtime',
    unit: '%',
    value: '',
  },
}

const Dashboard = () => {
  const { siteId } = useParams<{ siteId: string }>()
  const { getSiteById, siteList, selectedSites } = useMultiSiteMode()
  const site = getSiteById(siteId!) as Site | undefined
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const [metricInitialized, setMetricInitialized] = useState(false)
  const [metric, setMetric] = useState<MetricsState>({})
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const dateRangeTyped = dateRange as DateRange | undefined
  const { start, end, period } = dateRangeTyped ?? {}

  const params = buildRequestParams({
    start: start ?? 0,
    end: end ?? 0,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites: siteId ? [siteId] : (selectedSites as string[]),
    groupByRegion: true,
  })

  const options = {
    skip:
      !dateRangeTyped?.start || !dateRangeTyped?.end || isParamBuilderLoading || _isEmpty(metric),
  }

  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    isFetching: isRevenueFetching,
  } = useGetRevenueQuery(params, options)

  const {
    data: downtimeData,
    isLoading: isLoadingDowntime,
    isFetching: isDowntimeFetching,
  } = useGetDowntimeQuery(params, options)

  const {
    data: hashrateData,
    isLoading: isLoadingHashrate,
    isFetching: isHashrateFetching,
  } = useGetOperationsHashrateQuery(params, options)

  const { data: efficiencyData } = useGetOperationsEfficiencyQuery(params, options)

  const { data: powerData } = useGetOperationsConsumptionQuery(params, options)

  const {
    data: costProductionData,
    isLoading: isLoadingCostProduction,
    isFetching: isCostProductionFetching,
  } = useGetCostProductionQuery(params, options)

  // Type guard for API responses
  const isDashboardApiResponse = (data: unknown): data is DashboardApiResponse =>
    _isObject(data) && data !== null && ('regions' in data || 'data' in data)

  const typedRevenueData = isDashboardApiResponse(revenueData) ? revenueData : undefined
  const typedDowntimeData = isDashboardApiResponse(downtimeData) ? downtimeData : undefined
  const typedHashrateData = isDashboardApiResponse(hashrateData) ? hashrateData : undefined
  const typedEfficiencyData = isDashboardApiResponse(efficiencyData) ? efficiencyData : undefined
  const typedPowerData = isDashboardApiResponse(powerData) ? powerData : undefined
  const typedCostProductionData = isDashboardApiResponse(costProductionData)
    ? costProductionData
    : undefined

  const addMetrics = (regions: string[] = []) => {
    setMetric((prevMetrics: MetricsState) => {
      _forEach(regions, (region: string) => {
        const regionKey = _toUpper(region)
        if (!_get(prevMetrics, [regionKey])) {
          prevMetrics[regionKey] = _cloneDeep(METRICS)
        }
      })
      return { ...prevMetrics }
    })
    setMetricInitialized(true)
  }

  useEffect(() => {
    if (siteList && siteList.length && !metricInitialized) {
      const list = _map(
        siteId ? [{ id: siteId }] : [{ id: ALL_SITES }, ...siteList],
        ({ id }: { id: string }) => id,
      )
      addMetrics(list)
    }
  }, [siteList, metricInitialized, siteId])

  useEffect(() => {
    if (!typedDowntimeData) return
    setMetric((prev: MetricsState) =>
      updateMetricFromData(prev, typedDowntimeData, {
        metricKey: 'avgDowntime',
        regionSource: { kind: 'summaryPath', path: ['avg', 'downtimeRate'] },
        allSitesPath: ['data', 'summary', 'avg', 'downtimeRate'],
      }),
    )
  }, [typedDowntimeData])

  useEffect(() => {
    if (typedCostProductionData) {
      setMetric((prev: MetricsState) => {
        let next = updateMetricFromData(prev, typedCostProductionData, {
          metricKey: 'avgEnergyCost',
          regionSource: { kind: 'summaryPath', path: ['sum', 'energyCostsUSD'] },
          allSitesPath: ['data', 'summary', 'avg', 'energyCostsUSD'],
        })
        next = updateMetricFromData(next, typedCostProductionData, {
          metricKey: 'avgBtcCost',
          regionSource: { kind: 'summaryPath', path: ['sum', 'productionCostUSD'] },
          allSitesPath: ['data', 'summary', 'avg', 'productionCostUSD'],
        })
        return next
      })
    }
  }, [typedCostProductionData])

  useEffect(() => {
    if (!typedHashrateData) return
    setMetric((prev: MetricsState) =>
      updateMetricFromData(prev, typedHashrateData, {
        metricKey: 'avgHashrate',
        regionSource: { kind: 'logMean', field: 'hashrate' },
        allSitesPath: ['data', 'summary', 'avg', 'hashrate'],
      }),
    )
  }, [typedHashrateData])

  useEffect(() => {
    if (typedEfficiencyData) {
      setMetric((prev: MetricsState) =>
        updateMetricFromData(prev, typedEfficiencyData, {
          metricKey: 'avgEfficiency',
          regionSource: { kind: 'logMean', field: 'efficiency' },
          allSitesPath: ['data', 'summary', 'avg', 'efficiency'],
        }),
      )
    }
  }, [typedEfficiencyData])

  useEffect(() => {
    if (typedPowerData) {
      setMetric((prev: MetricsState) =>
        updateMetricFromData(prev, typedPowerData, {
          metricKey: 'avgPowerConsumption',
          regionSource: { kind: 'logMean', field: 'consumption' },
          allSitesPath: ['data', 'summary', 'avg', 'consumption'],
        }),
      )
    }
  }, [typedPowerData])

  useEffect(() => {
    if (typedRevenueData) {
      setMetric((prev: MetricsState) => {
        let next = updateMetricFromData(prev, typedRevenueData, {
          metricKey: 'btcMined',
          regionSource: { kind: 'summaryPath', path: ['sum', 'totalRevenueBTC'] },
          allSitesPath: ['data', 'summary', 'sum', 'totalRevenueBTC'],
        })
        next = updateMetricFromData(next, typedRevenueData, {
          metricKey: 'avgEnergyRevenue',
          regionSource: { kind: 'summaryPath', path: ['avg', 'energyRevenueUSD_MW'] },
          allSitesPath: ['data', 'summary', 'avg', 'energyRevenueUSD_MW'],
        })
        return next
      })
    }
  }, [typedRevenueData])

  const getMetricValue = (metric: MetricValue): string => {
    if (!metric?.value) return '-'

    if (metric.formatter) {
      return metric.formatter(Number(metric.value))
    }

    return formatNumber(Number(metric.value))
  }

  const timestampFormatTemplate = period === PERIOD.MONTHLY ? 'MM-dd' : 'yyyy-MM-dd'

  const formatTimestamps = (ts: number): string =>
    format(new Date(Number(ts)), timestampFormatTemplate)

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
    apiResponse: DashboardApiResponse | undefined,
    seriesDefs: SeriesDef[],
  ): BarChartDataset => {
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

            return {
              ...acc,
              [monthLabel]: {
                value,
                style: getBarChartItemStyle(color),
              },
            }
          },
          { label } as BarChartDatasetItem,
        ),
      ),
    }
  }

  const colors: readonly ColorType[] = ['BLUE', 'RED', 'GREEN'] as const
  const EXTRA_SERIES = 'BTC PRICE'

  const seriesDefs: SeriesDef[] = _map(
    [
      ..._map(siteId ? [{ id: siteId }] : siteList, ({ id }: { id: string }) => _toUpper(id)),
      EXTRA_SERIES,
    ],
    (site: string, idx: number) => ({
      label: _toUpper(site),
      color: colors[idx] as ColorType,
    }),
  )

  const barChartDataset = buildBarChartDataset(typedCostProductionData, seriesDefs)

  // Check if we have meaningful revenue data (non-null values)
  const hasMeaningfulRevenueData =
    typedRevenueData?.regions &&
    typedRevenueData.regions.length > 0 &&
    _some(typedRevenueData.regions, (region: RegionItem) => region.log && region.log.length > 0) &&
    _some(typedRevenueData.regions, (region: RegionItem) =>
      _some(
        region.log as TimeseriesLogItem[],
        (logItem: TimeseriesLogItem) => !_isNil(logItem.totalRevenueBTC),
      ),
    )

  // Fix: Collect all unique timestamps from all regions to ensure consistent date range
  const allRevenueTimestamps = hasMeaningfulRevenueData
    ? _uniq(
        _flatMap(typedRevenueData!.regions, (region: RegionItem) =>
          _map((region.log as TimeseriesLogItem[]) || [], (item: TimeseriesLogItem) => item.ts),
        ),
      ).sort((a: number, b: number) => a - b)
    : []

  const revenueBarChartDataset = {
    dataset: _map(typedRevenueData?.regions || [], (regionData: RegionItem, idx: number) => {
      const regionKey = _toUpper(regionData.region || '')
      return _reduce(
        allRevenueTimestamps,
        (acc: BarChartDatasetItem, ts: number) => {
          const label = formatTimestamps(ts)
          const logItem = (regionData.log as TimeseriesLogItem[] | undefined)?.find(
            (item: TimeseriesLogItem) => item.ts === ts,
          )
          const value = logItem?.totalRevenueBTC || 0

          return {
            ...acc,
            [label]: {
              value,
              style: getBarChartItemStyle(colors[idx] as ColorType),
            },
          }
        },
        {
          label: regionKey,
          stackGroup: 'revenue',
        } as BarChartDatasetItem,
      )
    }),
  }

  const revenuesNoData =
    _isEmpty(revenueBarChartDataset?.dataset) ||
    _every(revenueBarChartDataset.dataset, (entry) =>
      _every(_omit(entry, ['label', 'stackGroup']), (item) => {
        const value = _get(item, 'value')

        return !_isNumber(value) || value === 0
      }),
    )

  const downTimeTimestamps = _flatMap(typedDowntimeData?.regions, ({ log }: RegionItem) =>
    _map((log as TimeseriesLogItem[]) || [], ({ ts }: TimeseriesLogItem) => ts),
  )

  const sortedLabels = _map(_sortBy(_uniq(downTimeTimestamps)), (ts: number) =>
    formatTimestamps(ts),
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
            style: getBarChartItemStyle(
              // TEMP: until we migrate colors
              color as
                | 'BLUE'
                | 'RED'
                | 'GREEN'
                | 'LIGHT_BLUE'
                | 'SKY_BLUE'
                | 'METALLIC_BLUE'
                | 'PURPLE'
                | 'BLUE_SEA'
                | 'YELLOW'
                | 'VIOLET'
                | 'ORANGE',
            ) as unknown as Record<string, string>,
          }
          return acc
        },
        {
          label,
          stackGroup,
        } as DatasetItem,
      ),
  )

  const lineColors = [CHART_COLORS.METALLIC_BLUE, CHART_COLORS.red]

  const hashrateChartData = typedHashrateData?.regions
    ? { dataset: typedHashrateData.regions }
    : { dataset: [] }

  return (
    <MultisitePageWrapper>
      <Header
        site={site}
        isExtended
        pageTitle="Dashboard"
        dateRange={dateRangeTyped}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      {_map(
        site?.name
          ? [site as Site]
          : [
              {
                name: 'All Site',
                id: ALL_SITES,
                url: '',
                label: 'All Site',
                value: ALL_SITES,
              } as Site,
              ...(siteList || []),
            ],
        (item: Site) => (
          <Accordion
            title={_capitalize(item.name)}
            noBorder
            key={item.id}
            isOpened={item.id === ALL_SITES || !!siteId}
          >
            <DashboardCardWrapper>
              {_map(_values(metric[_toUpper(item.id)]), (metricValue: MetricValue) => (
                <MetricCard
                  bgColor={COLOR.BLACK_ALPHA_05}
                  isHighlighted={metricValue.isHighlighted}
                  key={metricValue.label}
                  label={metricValue.label}
                  unit={metricValue.unit ?? ''}
                  value={getMetricValue(metricValue)}
                />
              ))}
            </DashboardCardWrapper>
          </Accordion>
        ),
      )}

      <ChartsSection>
        <MultiSiteDashboardChart
          title="Revenues"
          unit={CURRENCY.BTC}
          isLoading={isLoadingRevenue || isRevenueFetching}
          data={hasMeaningfulRevenueData ? revenueBarChartDataset : { dataset: [] }}
          dataset={hasMeaningfulRevenueData ? revenueBarChartDataset.dataset : []}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/dashboard/revenue`}
        >
          <BarChart
            isStacked
            isLegendVisible
            displayColors={false}
            data={revenuesNoData ? { dataset: [] } : (revenueBarChartDataset as BarChartData)}
            chartHeight={_isEmpty(revenueBarChartDataset?.dataset) ? undefined : CHART_HEIGHT}
            yTicksFormatter={(value: number) =>
              formatNumber(value, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })
            }
          />
        </MultiSiteDashboardChart>

        <MultiSiteDashboardChart
          title="Bitcoin Production Costs"
          unit={CURRENCY.USD_LABEL}
          data={barChartDataset}
          dataset={barChartDataset.dataset}
          isLoading={isLoadingCostProduction || isCostProductionFetching}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/dashboard/btc-production-cost`}
        >
          <BarChart
            allowGrouping
            isLegendVisible
            data={barChartDataset as BarChartData}
            yTicksFormatter={(value: number) => formatNumber(value)}
          />
        </MultiSiteDashboardChart>

        <SiteOperationsChart
          title="Hashrate"
          propName="hashrate"
          data={hashrateChartData}
          backgroundColor={COLOR.BLACK_ALPHA_05}
          isLoading={isLoadingHashrate || isHashrateFetching}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/dashboard/hashrate`}
          legend={_map(
            siteId ? [siteId] : (selectedSites as string[]),
            (item: string, idx: number) => ({
              label: _toUpper(item),
              color: lineColors[idx] || CHART_COLORS.METALLIC_BLUE,
            }),
          )}
          legendPosition="left"
          unit={UNITS.HASHRATE_PH_S}
          yTicksFormatter={(value: number) => {
            if (!value) return '0'
            const unitResult = getHashrateUnit(value)
            return unitResult.value !== null ? String(unitResult.value) : '0'
          }}
          customDateFormat={timestampFormatTemplate}
          uniformDistribution
        />

        <MultiSiteDashboardChart
          unit={UNITS.PERCENT}
          title="Avg Downtime"
          isLoading={isLoadingDowntime || isDowntimeFetching}
          data={{ dataset: groupedStackedDataset }}
          dataset={groupedStackedDataset}
          redirectTo={`${siteId ? `/sites/${siteId}` : ''}/dashboard/monthly-avg-downtime`}
        >
          <BarChart
            isStacked
            allowGrouping
            isLegendVisible
            data={{ dataset: groupedStackedDataset } as BarChartData}
            yTicksFormatter={(value: number) => formatNumber(value)}
          />
        </MultiSiteDashboardChart>
      </ChartsSection>
    </MultisitePageWrapper>
  )
}

export default Dashboard
