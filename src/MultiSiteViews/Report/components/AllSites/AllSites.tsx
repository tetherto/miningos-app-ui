import _capitalize from 'lodash/capitalize'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _upper from 'lodash/upperCase'
import _values from 'lodash/values'
import { useParams } from 'react-router-dom'

import {
  AllSitesMetricsGrid,
  ChartsContainer,
  IndividualSiteCard,
  IndividualSiteMetricsGrid,
  IndividualSitesContainer,
  SiteMetricsSection,
  SiteTitle,
} from '../../Report.style'
import { DateRangeString, MetricCardData, ReportApiResponse, ReportType } from '../../Report.types'
import { parseDateRange } from '../../Report.util'
import ReportHeader from '../ReportHeader/ReportHeader'

import { buildAllSitesCharts } from './AllSites.util'

import { getConsumptionString, getHashrateString } from '@/app/utils/deviceUtils'
import { formatNumber, getEfficiencyString } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import { formatDataLabel } from '@/MultiSiteViews/Report/lib/chart-builders'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'

interface MetricItem {
  label: string
  value: string | number
  unit?: string
  isHighlighted?: boolean
  formatter?: (value: number) => string
}

const METRICS: Record<string, MetricItem> = {
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
  avgBtcCost: {
    label: 'Avg Bitcoin Prod. Cost',
    unit: CURRENCY.USD,
    value: '',
  },
  avgHashrate: {
    label: 'Avg Hashrate',
    value: '',
    formatter: getHashrateString,
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
  avgDowntime: {
    label: 'Downtime Rate',
    unit: '%',
    value: '',
  },
  avgPowerConsumption: {
    label: 'Avg Power Consumption',
    value: '',
    formatter: getConsumptionString,
  },
}

interface AllSitesProps {
  data: ReportApiResponse
  dateRange: DateRangeString
  reportType?: ReportType
}

interface Site {
  id: string
  name: string
  url?: string
  label?: string
  value?: string
}

const AllSites = ({ data, dateRange, reportType = 'weekly' }: AllSitesProps) => {
  const { siteId } = useParams()
  const { getSiteById, siteList } = useMultiSiteMode()
  const site = getSiteById(siteId ?? '') as Site

  // Parse dateRange string to get startDate and endDate for gap filling
  const { startDate, endDate } = parseDateRange(dateRange)

  const chartsData = buildAllSitesCharts(data, {
    reportType,
    startDate,
    endDate,
  })

  // Extract BTC price from API response
  const btcPrice = data?.data?.summary?.avg?.currentBTCPrice
  const formattedBtcPrice = btcPrice
    ? formatNumber(btcPrice, { maximumFractionDigits: 0 })
    : undefined

  const getMetricValue = (metric: MetricItem): string => {
    if (!metric?.value) return '-'

    if (metric.formatter) {
      return metric.formatter(metric.value as number)
    }

    return formatNumber(metric.value as number)
  }

  const hasSiteName = (s: Site): s is Site => 'name' in s && _isString(s.name)

  const getRevenueConfig = () => ({
    title: `Revenues Per ${reportType === 'yearly' ? 'Month' : 'Day'}`,
    yFormatter: (value: number) => {
      const valueFormatted = formatDataLabel(value)

      return `${valueFormatted} ${CURRENCY.BTC}`
    },
    unit: CURRENCY.BTC,
    barWidth: reportType === 'weekly' ? 180 : 43,
  })

  const getDowntimeConfig = () => {
    const isDaily = reportType === 'weekly'
    return {
      title: isDaily ? 'Daily Avg Downtime Rate' : 'Monthly Avg Downtime Rate',
      barWidth: isDaily ? 24 : 28,
    }
  }

  const getHashrateConfig = (): {
    title: string
    timeframeType?: string
    unit?: string
  } => {
    const config: { title: string; timeframeType?: string; unit?: string } = { title: 'Hashrate' }
    if (reportType === 'yearly') {
      config.timeframeType = TIMEFRAME_TYPE.YEAR
    }
    if (reportType === 'weekly') {
      config.unit = UNITS.ENERGY_MW
    }
    return config
  }

  const revenueConfig = getRevenueConfig()
  const downtimeConfig = getDowntimeConfig()
  const hashrateConfig = getHashrateConfig()

  return (
    <>
      <ReportHeader
        title={`All Sites Summary - ${_capitalize(reportType)}`}
        subtitle={dateRange}
        priceText="Average Price:"
        priceValue={formattedBtcPrice}
      />

      {/* All Sites Summary - only show when not viewing specific site */}
      {!hasSiteName(site) && (
        <SiteMetricsSection key="all-sites">
          <SiteTitle>All Sites</SiteTitle>
          <AllSitesMetricsGrid>
            {_map(_values(chartsData.allSitesMetrics || METRICS) as MetricItem[], (metricItem) => (
              <MetricCard
                key={metricItem.label}
                label={metricItem.label}
                unit={metricItem.unit ?? ''}
                value={getMetricValue(metricItem)}
                isHighlighted={metricItem.isHighlighted}
                bgColor={COLOR.BLACK_ALPHA_05}
                showDashForZero
              />
            ))}
          </AllSitesMetricsGrid>
        </SiteMetricsSection>
      )}

      {/* Individual Site Metrics - Side by Side */}
      {!hasSiteName(site) && siteList.length > 0 && (
        <IndividualSitesContainer>
          {_map(siteList, (item) => (
            <IndividualSiteCard key={item.id}>
              <SiteTitle>{_capitalize(item.name)}</SiteTitle>
              <IndividualSiteMetricsGrid>
                {_map(
                  _values(
                    (chartsData.siteMetrics as Record<string, Record<string, MetricCardData>>)?.[
                      _upper(item.id)
                    ] || METRICS,
                  ) as MetricItem[],
                  (metricItem) => (
                    <MetricCard
                      key={metricItem.label}
                      label={metricItem.label}
                      unit={metricItem.unit ?? ''}
                      value={getMetricValue(metricItem)}
                      isHighlighted={metricItem.isHighlighted}
                      bgColor={COLOR.BLACK_ALPHA_05}
                      noMinWidth
                      showDashForZero
                    />
                  ),
                )}
              </IndividualSiteMetricsGrid>
            </IndividualSiteCard>
          ))}
        </IndividualSitesContainer>
      )}

      {/* When viewing a specific site, show only that site's metrics */}
      {hasSiteName(site) && (
        <SiteMetricsSection>
          <SiteTitle>{_capitalize(site.name)}</SiteTitle>
          <AllSitesMetricsGrid>
            {_map(
              _values(
                (chartsData.siteMetrics as Record<string, Record<string, MetricCardData>>)?.[
                  _upper(site.id)
                ] || METRICS,
              ) as MetricItem[],
              (metricItem) => (
                <MetricCard
                  key={metricItem.label}
                  label={metricItem.label}
                  unit={metricItem.unit ?? ''}
                  value={getMetricValue(metricItem)}
                  isHighlighted={metricItem.isHighlighted}
                  bgColor={COLOR.BLACK_ALPHA_05}
                  showDashForZero
                />
              ),
            )}
          </AllSitesMetricsGrid>
        </SiteMetricsSection>
      )}

      {/* Charts Section */}
      <ChartsContainer $isYearly={reportType === 'yearly'}>
        {/* Revenue Chart */}
        <ThresholdBarChart
          chartTitle={revenueConfig.title}
          data={chartsData.revenueChart}
          isStacked
          barWidth={revenueConfig.barWidth}
          isLegendVisible
          showDataLabels
          displayColors={false}
          yTicksFormatter={revenueConfig.yFormatter}
          unit={revenueConfig.unit}
        />

        {/* Yearly specific: Bitcoin Production Cost Chart */}
        {reportType === 'yearly' && chartsData.productionCostChart && (
          <ThresholdBarChart
            chartTitle="Bitcoin Production Cost"
            data={chartsData.productionCostChart}
            barWidth={14}
            displayColors={false}
            unit="M"
            isLegendVisible
            showDataLabels
            yTicksFormatter={(v) => formatDataLabel(v / 1_000)}
          />
        )}

        {/* Hashrate Chart */}
        <ThresholdLineChart
          title={hashrateConfig.title}
          data={chartsData.hashrateChart}
          unit={hashrateConfig.unit}
          timeframeType={hashrateConfig.timeframeType}
        />

        {/* Downtime Chart */}
        <ThresholdBarChart
          chartTitle={downtimeConfig.title}
          data={chartsData.downtimeChart}
          isStacked
          barWidth={downtimeConfig.barWidth}
          isLegendVisible
          yTicksFormatter={(v) => `${Math.round(v * 100)}%`}
          unit={UNITS.PERCENT}
        />
      </ChartsContainer>
    </>
  )
}

export default AllSites
