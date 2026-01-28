import _map from 'lodash/map'
import _values from 'lodash/values'

import { MetricCardWrapper } from '../Common.style'
import { MetricCard } from '../SharedComponents/MetricCard'

import { formatNumber } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { useRevenueData } from '@/hooks/useRevenueData'
import { RevenueChart } from '@/MultiSiteViews/Charts/RevenueChart/RevenueChart'
import { SubsidyFeesDoughnutChart } from '@/MultiSiteViews/Charts/SubsidyFeesChart/SubsidyFeesDoughnutChart'
import { DataWrapper, PageRoot } from '@/MultiSiteViews/Common.style'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { Metric } from '@/types'

const Revenue = () => {
  const { site, siteId, siteList, selectedSites } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()

  const {
    revenueData,
    transformedBTCMetrics,
    chartData,
    firstMetricsChunk,
    secondMetricsChunk,
    isLoading,
    isRevenueLoading,
    isRevenueFetching,
  } = useRevenueData({
    selectedSites,
    siteList,
    siteId,
    siteName: (site as { name?: string })?.name || '',
    dateRange,
    onTableDateRangeChange: onTableDateRangeChange as unknown as (
      dates: [Date, Date] | null,
      options?: { period?: string | undefined } | undefined,
    ) => void,
  })

  const isChartLoading = isRevenueLoading || isRevenueFetching

  return (
    <PageRoot>
      {isLoading && <Spinner />}

      <Header
        site={site}
        pageTitle="Revenue"
        isExtended
        hasSiteSelect
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <MetricCardWrapper>
        {_map(_values(transformedBTCMetrics) as Metric[], (metric: Metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            unit={metric.unit}
            value={formatNumber(metric.value)}
            isHighlighted={metric.isHighlighted}
            bgColor={COLOR.BLACK_ALPHA_05}
          />
        ))}
      </MetricCardWrapper>

      <RevenueChart
        data={chartData as unknown as never[]}
        isLoading={isChartLoading}
        siteList={siteList as never[]}
      />

      <DataWrapper>
        <SubsidyFeesDoughnutChart revenueData={revenueData} isLoading={isChartLoading} />

        <MetricCardWrapper>
          {_map(_values(firstMetricsChunk) as Metric[], (metric: Metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              unit={metric.unit}
              value={formatNumber(metric.value)}
              isTransparentColor
              isValueMedium
              isHighlighted={metric.isHighlighted}
              bgColor={COLOR.BLACK_ALPHA_05}
            />
          ))}
        </MetricCardWrapper>

        <MetricCardWrapper>
          {_map(_values(secondMetricsChunk) as Metric[], (metric: Metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              unit={metric.unit}
              value={formatNumber(metric.value)}
              isTransparentColor
              isValueMedium
              isHighlighted={metric.isHighlighted}
              bgColor={COLOR.BLACK_ALPHA_05}
            />
          ))}
        </MetricCardWrapper>
      </DataWrapper>
    </PageRoot>
  )
}

export default Revenue
