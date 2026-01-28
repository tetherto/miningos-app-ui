import _get from 'lodash/get'
import _map from 'lodash/map'
import _some from 'lodash/some'
import _values from 'lodash/values'

import { MultisitePageWrapper } from '../MultiSite.styles'
import { MetricCard } from '../SharedComponents/MetricCard'

import { formatNumber } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { useEnergyCostData } from '@/hooks/useEnergyCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { PowerChart } from '@/MultiSiteViews/Charts/PowerChart/PowerChart'
import { SiteEnergyVsCostChart } from '@/MultiSiteViews/Charts/SiteEnergyVsCostChart/SiteEnergyVsCostChart'
import { MetricCardsGrid } from '@/MultiSiteViews/Common.style'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { Metric } from '@/types'

const EnergyCost = () => {
  const { site } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()

  const { isLoading, metrics, revenueData, isRevenueDataLoading, powerData } = useEnergyCostData({
    dateRange,
  })

  const isPeriodMonthly = dateRange?.period === PERIOD.MONTHLY

  const revenuesNoData = !_some(revenueData as never[], (entry) =>
    _some(['revenueUSD', 'hashCostUSD_PHS_d'], (key) => _get(entry, key, 0) < 0),
  )

  return (
    <MultisitePageWrapper>
      {isLoading && <Spinner />}
      <Header
        isExtended
        site={site}
        hasBackButton
        dateRange={dateRange}
        pageTitle="Energy Cost"
        isWeekSelectVisible={false}
        isMonthSelectVisible={false}
        breadcrumbMiddleStep="Revenue and cost"
        backToDestination="revenue-and-cost/ebitda"
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <MetricCardsGrid>
        {_map(_values(metrics), (metric: Metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            unit={metric.unit}
            bgColor={COLOR.BLACK_ALPHA_05}
            value={formatNumber(metric.value)}
            isHighlighted={metric.isHighlighted}
          />
        ))}
      </MetricCardsGrid>

      <SiteEnergyVsCostChart
        isLoading={isRevenueDataLoading}
        isDateShort={isPeriodMonthly}
        revenueData={revenueData as never[]}
        showNoDataPlaceholder={revenuesNoData}
      />

      <PowerChart data={powerData} isLoading={isLoading} isDateShort={isPeriodMonthly} />
    </MultisitePageWrapper>
  )
}

export default EnergyCost
