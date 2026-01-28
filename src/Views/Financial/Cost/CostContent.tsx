import { differenceInDays } from 'date-fns/differenceInDays'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _values from 'lodash/values'

import { formatNumber } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { OperationsEnergyCostChart } from '@/MultiSiteViews/Charts/OperationsEnergyCostChart/OperationsEnergyCostChart'
import { ProductionCostPriceChart } from '@/MultiSiteViews/Charts/ProductionCostPriceChart/ProductionCostPriceChart'
import { SiteEnergyVsCostChart } from '@/MultiSiteViews/Charts/SiteEnergyVsCostChart/SiteEnergyVsCostChart'
import { DataWrapper, MetricCardWrapper, PageRoot } from '@/MultiSiteViews/Common.style'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { MetricCard } from '@/MultiSiteViews/SharedComponents/MetricCard'
import { Metric } from '@/types'
import type { MultiSiteDateRange } from '@/types/redux'

interface Site {
  name?: string
}

interface CostContentProps {
  site?: Site
  data: {
    costData?: unknown
    revenueData?: unknown[] | unknown
    btcData?: { log?: unknown[] } | unknown[]
  }
  dateRange?: MultiSiteDateRange
  onTableDateRangeChange: (
    dates: [Date | string | number, Date | string | number] | null,
    options: { period: string },
  ) => void
  isDataLoading: boolean
  isRevenueDataLoading: boolean
  metrcis: Record<string, Metric>
  showHeader?: boolean
}

/**
 * Shared component for rendering Cost page content
 * Used by both single-site and multi-site versions
 */
const CostContent = ({
  site,
  data,
  dateRange,
  onTableDateRangeChange,
  isDataLoading,
  isRevenueDataLoading,
  metrcis,
  showHeader = true,
}: CostContentProps) => {
  const isPeriodMonthly = dateRange?.period === PERIOD.MONTHLY
  const isWeeklySelection =
    dateRange?.period === PERIOD.DAILY &&
    dateRange?.start !== undefined &&
    dateRange?.end !== undefined &&
    differenceInDays(new Date(dateRange.end), new Date(dateRange.start)) < 8
  const isSingleSite = showHeader === false
  const shouldShowErrorMessage = isSingleSite && isWeeklySelection && !isRevenueDataLoading

  const content = (
    <>
      {isDataLoading && <Spinner />}

      {showHeader && (
        <Header
          site={site}
          pageTitle="Cost"
          isExtended
          hasSiteSelect
          isWeekSelectVisible={false}
          dateRange={dateRange}
          onTableDateRangeChange={onTableDateRangeChange}
        />
      )}

      <DataWrapper>
        <ProductionCostPriceChart
          costData={
            data?.costData as { summary?: Array<{ ts: number; totalCost: number }> } as never
          }
          btcPriceData={(data?.btcData as unknown as never[]) ?? []}
          isLoading={isDataLoading}
        />

        <SiteEnergyVsCostChart
          chartHeightUnset
          title="Avg All-in Cost"
          revenueData={data?.revenueData as never[]}
          isLoading={isRevenueDataLoading}
          isDateShort={isPeriodMonthly}
          showNoDataPlaceholder={shouldShowErrorMessage}
          isSingleSite={isSingleSite}
        />
      </DataWrapper>

      <DataWrapper>
        <OperationsEnergyCostChart
          data={
            data?.costData as { energyCostsUSD?: number; operationalCostsUSD?: number } | undefined
          }
          title="Operations/Energy Cost"
          isLoading={isDataLoading}
        />

        {!_isEmpty(metrcis) && (
          <MetricCardWrapper>
            {_map(_values(metrcis), (metric: Metric) => (
              <MetricCard
                key={metric.label}
                isHighlighted={metric.isHighlighted}
                label={metric.label}
                unit={metric.unit as string}
                value={formatNumber(metric.value)}
                bgColor={COLOR.BLACK_ALPHA_05}
              />
            ))}
          </MetricCardWrapper>
        )}
      </DataWrapper>
    </>
  )

  // If header is shown (multi-site), wrap in PageRoot
  // If header is hidden (single-site), return content without PageRoot (it's already wrapped)
  if (showHeader) {
    return <PageRoot>{content}</PageRoot>
  }

  return content
}

export default CostContent
