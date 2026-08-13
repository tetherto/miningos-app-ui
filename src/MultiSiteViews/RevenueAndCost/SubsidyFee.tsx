import { MultisitePageWrapper } from '../MultiSite.styles'

import { useGetRevenueQuery } from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'
import useMultiSiteRTRequestParams from '@/hooks/useMultiSiteRTRequestParams'
import { AverageFeeChart } from '@/MultiSiteViews/Charts/AverageFeeChart/AverageFeesChart'
import { SubsidyFeesChart } from '@/MultiSiteViews/Charts/SubsidyFeesChart/SubsidyFeesChart'
import { Header } from '@/MultiSiteViews/SharedComponents/Header/Header'
import { RevenueData } from '@/types'

const SubsidyFee = () => {
  const { siteId, site } = useMultiSiteMode()
  const { dateRange, onTableDateRangeChange } = useMultiSiteDateRange()
  const { buildRequestParams, isLoading: isParamBuilderLoading } = useMultiSiteRTRequestParams()

  const { start, end, period } = dateRange ?? {}

  const params = buildRequestParams({
    start,
    end,
    period: period as 'daily' | 'weekly' | 'monthly',
    sites: [siteId as string],
  })

  const options = {
    skip: !dateRange?.start || !dateRange?.end || isParamBuilderLoading,
  }

  const {
    isLoading: isRevenueLoading,
    isFetching: isRevenueFetching,
    data: revenueData,
  } = useGetRevenueQuery(params, options) as {
    isLoading: boolean
    isFetching: boolean
    data?: RevenueData
  }

  const isLoading = isRevenueLoading || isRevenueFetching
  const isPeriodMonthly = period === PERIOD.MONTHLY

  return (
    <MultisitePageWrapper>
      <Header
        isExtended
        pageTitle="Subsidy/Fee"
        hasBackButton
        backToDestination="revenue-and-cost/ebitda"
        breadcrumbMiddleStep="Revenue and cost"
        site={site}
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
      />
      <SubsidyFeesChart
        data={revenueData?.log as never[]}
        isLoading={isLoading}
        isDateShort={isPeriodMonthly}
      />
      <AverageFeeChart
        data={revenueData?.log as never[]}
        isLoading={isLoading}
        isDateShort={isPeriodMonthly}
      />
    </MultisitePageWrapper>
  )
}

export default SubsidyFee
