import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _some from 'lodash/some'
import _values from 'lodash/values'

import { MetricCardWrapper } from '../../Common.style'
import { MetricCard } from '../../SharedComponents/MetricCard'

import { formatNumber } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { AverageDowntimeChart } from '@/MultiSiteViews/Charts/AverageDowntimeChart'
import { OperationsEnergyCostChart } from '@/MultiSiteViews/Charts/OperationsEnergyCostChart/OperationsEnergyCostChart'
import { ProductionCostPriceChart } from '@/MultiSiteViews/Charts/ProductionCostPriceChart/ProductionCostPriceChart'
import { SiteEnergyVsCostChart } from '@/MultiSiteViews/Charts/SiteEnergyVsCostChart/SiteEnergyVsCostChart'
import { DataWrapper, PageRoot } from '@/MultiSiteViews/Common.style'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
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
    btcData?: unknown[]
  }
  dateRange?: MultiSiteDateRange
  onTableDateRangeChange: (
    dates: [Date | string | number, Date | string | number] | null,
    options: { period: string },
  ) => void
  isDataLoading: boolean
  isRevenueDataLoading: boolean
  metrcis: Record<string, Metric>
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
}: CostContentProps) => {
  const isPeriodMonthly = dateRange?.period === PERIOD.MONTHLY

  const revenuesNoData = !_some(data?.revenueData as never[], (entry) =>
    _some(_omit(entry, ['label', 'stackGroup']), (item) => _get(item, ['value'], 0) > 0),
  )

  return (
    <PageRoot>
      {isDataLoading && <Spinner />}

      <Header
        site={site}
        pageTitle="Cost"
        isExtended
        hasSiteSelect
        isWeekSelectVisible={false}
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <DataWrapper>
        <ProductionCostPriceChart
          costData={(data?.costData as unknown as never[]) ?? []}
          btcPriceData={(data?.btcData as unknown as never[]) ?? []}
          isLoading={isDataLoading}
        />

        {dateRange && <AverageDowntimeChart dateRange={dateRange} />}
      </DataWrapper>

      <DataWrapper>
        <OperationsEnergyCostChart
          data={
            data?.costData as { energyCostsUSD?: number; operationalCostsUSD?: number } | undefined
          }
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

        <SiteEnergyVsCostChart
          chartHeightUnset
          title="Avg All-in Power Cost"
          revenueData={data?.revenueData as never[]}
          showNoDataPlaceholder={revenuesNoData}
          isLoading={isRevenueDataLoading}
          isDateShort={isPeriodMonthly}
        />
      </DataWrapper>
    </PageRoot>
  )
}

export default CostContent
