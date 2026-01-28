import _every from 'lodash/every'
import _isEmpty from 'lodash/isEmpty'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _values from 'lodash/values'

import { MetricCard } from '../SharedComponents/MetricCard'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatNumber } from '@/app/utils/format'
import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { useHashCostData } from '@/hooks/useHashCostData'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import { HashpriceChart } from '@/MultiSiteViews/Charts/HashpriceChart/HashpriceChart'
import { MetricCardWrapper, PageRoot } from '@/MultiSiteViews/Common.style'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { Metric } from '@/types'

interface HashCostDataItem {
  cost?: number | null
  revenue?: number | null
  networkHashprice?: number | null
}

const HashCost = () => {
  const { site } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()

  const { data, isLoading, metrics } = useHashCostData({
    dateRange: dateRange as unknown as UnknownRecord,
  })

  const isPeriodMonthly = dateRange?.period === PERIOD.MONTHLY

  const hashCostNoData =
    _isEmpty(data) ||
    _every(data as HashCostDataItem[], (entry) => {
      const costValue = entry?.cost
      const revenueValue = entry?.revenue
      const hashpriceValue = entry?.networkHashprice

      const costInvalid = !_isNumber(costValue) || costValue === 0
      const revenueInvalid = !_isNumber(revenueValue) || revenueValue === 0
      const hashpriceInvalid = !_isNumber(hashpriceValue) || hashpriceValue === 0

      return costInvalid && revenueInvalid && hashpriceInvalid
    })

  return (
    <PageRoot>
      <Header
        isExtended
        pageTitle="Hash Cost"
        hasBackButton
        isMonthSelectVisible={false}
        isWeekSelectVisible={false}
        backToDestination="revenue-and-cost/ebitda"
        breadcrumbMiddleStep="Revenue and cost"
        site={site}
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />

      <MetricCardWrapper>
        {_map(_values(metrics), (metric: Metric) => (
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

      <HashpriceChart
        isLoading={isLoading}
        isDateShort={isPeriodMonthly}
        data={hashCostNoData ? [] : data}
      />
    </PageRoot>
  )
}

export default HashCost
