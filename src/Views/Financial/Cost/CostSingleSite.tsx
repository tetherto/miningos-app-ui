import { subYears } from 'date-fns/subYears'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'

import type { DateRangeChangeHandler } from '../Financial.types'
import { FinancialDateRangeSection } from '../FinancialDateRangeSection'
import {
  HeaderButtons,
  HeaderWithToggle,
  PageRoot,
  PageTitle,
  SetCostButton,
} from '../FinancialShared.styles'

import CostContent from './CostContent'

import { setMultiSiteDateRange, setTimeframeType } from '@/app/slices/multiSiteSlice'
import { PERIOD, TIMEFRAME_TYPE } from '@/constants/ranges'
import { ROUTE } from '@/constants/routes'
import { useCostSummaryData } from '@/hooks/useCostSummaryData'
import { rangeOfYear } from '@/MultiSiteViews/SharedComponents/Header/helper'

/**
 * Single-site version of Cost component
 * Uses useCostSummaryData hook to fetch production costs and calculate metrics
 */
const CostSingleSite = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const lastYear = subYears(new Date(), 1).getFullYear()
    const [yearStart, yearEnd] = rangeOfYear(lastYear)

    dispatch(
      setMultiSiteDateRange({
        start: yearStart.getTime(),
        end: yearEnd.getTime(),
        period: PERIOD.MONTHLY,
      }),
    )
    dispatch(setTimeframeType(TIMEFRAME_TYPE.YEAR))
  }, [dispatch])

  const {
    site,
    data,
    dateRange,
    onTableDateRangeChange,
    isDataLoading,
    isRevenueDataLoading,
    metrcis,
  } = useCostSummaryData()

  const handleReset = () => {
    // Reset to initial page state: last year (January 1 to December 31)
    const lastYear = subYears(new Date(), 1).getFullYear()
    const [yearStart, yearEnd] = rangeOfYear(lastYear)

    dispatch(
      setMultiSiteDateRange({
        start: yearStart.getTime(),
        end: yearEnd.getTime(),
        period: PERIOD.MONTHLY,
      }),
    )
    // Set timeframe type to YEAR so TimeframeControls shows current year selected
    dispatch(setTimeframeType(TIMEFRAME_TYPE.YEAR))
  }

  // Wrapper to convert TimeframeControls signature to useMultiSiteDateRange signature
  const handleRangeChange: DateRangeChangeHandler = (dates, options) => {
    const period = options?.period || dateRange?.period || 'monthly'
    onTableDateRangeChange(dates, { period })
  }

  return (
    <PageRoot>
      <HeaderWithToggle>
        <PageTitle>Cost Summary</PageTitle>
        <HeaderButtons>
          <SetCostButton onClick={() => navigate(ROUTE.REPORTS_FINANCIAL_COST_INPUT)}>
            <img src="/icons/Coins.svg" alt="Coins" />
            Set Monthly Cost
          </SetCostButton>
        </HeaderButtons>
      </HeaderWithToggle>

      <FinancialDateRangeSection
        dateRange={dateRange}
        onRangeChange={handleRangeChange}
        onReset={handleReset}
        isMonthSelectVisible
        isWeekSelectVisible={false}
      />

      <CostContent
        site={site}
        data={data}
        dateRange={dateRange}
        onTableDateRangeChange={onTableDateRangeChange}
        isDataLoading={isDataLoading ?? false}
        isRevenueDataLoading={isRevenueDataLoading ?? false}
        metrcis={metrcis}
        showHeader={false}
      />
    </PageRoot>
  )
}

export default CostSingleSite
