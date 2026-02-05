import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'

import { FinancialDateRangeSection } from '../FinancialDateRangeSection'

import { useRevenueSummaryData } from './hooks/useRevenueSummaryData'
import {
  ChartsContainer,
  ChartsRow,
  HeaderButtons,
  HeaderWithToggle,
  InfoText,
  MetricCard,
  MetricCardsGrid,
  MetricLabel,
  MetricValue,
  PageRoot,
  PageTitle,
  SetCostButton,
  TotalBitcoinCard,
  TotalBitcoinLabel,
  TotalBitcoinValue,
} from './RevenueSummary.styles'

import { setTimeframeType } from '@/app/slices/multiSiteSlice'
import { formatNumber } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { TIMEFRAME_TYPE } from '@/constants/ranges'
import { ROUTE } from '@/constants/routes'
import { CURRENCY, UNITS } from '@/constants/units'
import { RevenueChart } from '@/MultiSiteViews/Charts/RevenueChart/RevenueChart'
import { SubsidyFeesDoughnutChart } from '@/MultiSiteViews/Charts/SubsidyFeesChart/SubsidyFeesDoughnutChart'
const RevenueSummary = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Revenue Summary should default to current month on refresh.
  // TimeframeControls reads a global `timeframeType` value; force it to MONTH for this view.
  useEffect(() => {
    dispatch(setTimeframeType(TIMEFRAME_TYPE.MONTH))
  }, [dispatch])

  // Fetch and process all revenue summary data
  const {
    isLoading,
    dateRange,
    handleRangeChange,
    handleReset,
    revenueData,
    metrics,
    revenueChartData,
    siteList,
  } = useRevenueSummaryData()

  const handleResetWithYearSelected = () => {
    dispatch(setTimeframeType(TIMEFRAME_TYPE.YEAR))
    handleReset()
  }

  return (
    <PageRoot>
      {isLoading && <Spinner />}

      <HeaderWithToggle>
        <PageTitle>Revenue Summary</PageTitle>
        <HeaderButtons>
          <SetCostButton onClick={() => navigate(ROUTE.REPORTS_FINANCIAL_COST_SUMMARY)}>
            <img src="/icons/Coins.svg" alt="Coins" />
            Set Monthly Cost
          </SetCostButton>
        </HeaderButtons>
      </HeaderWithToggle>

      <FinancialDateRangeSection
        dateRange={dateRange}
        onRangeChange={handleRangeChange}
        onReset={handleResetWithYearSelected}
        isMonthSelectVisible
        isWeekSelectVisible
      />
      {!dateRange && (
        <InfoText>
          Please select a time period using the Year, Month, or Week selectors above to view revenue
          summary data.
        </InfoText>
      )}

      {dateRange && !isLoading && (
        <>
          {/* Total Bitcoin Card */}
          <TotalBitcoinCard>
            <TotalBitcoinLabel>Total Bitcoin</TotalBitcoinLabel>
            <TotalBitcoinValue>
              {metrics.totalBitcoin} {CURRENCY.BTC_LABEL}
            </TotalBitcoinValue>
          </TotalBitcoinCard>

          {/* Revenue Chart */}
          <ChartsContainer>
            <RevenueChart data={revenueChartData} isLoading={isLoading} siteList={siteList} />
          </ChartsContainer>

          {/* Charts Row: Subsidy/Fees Donut and Metrics Grid */}
          <ChartsRow>
            <SubsidyFeesDoughnutChart revenueData={revenueData} isLoading={isLoading} />

            {/* Metrics Grid */}
            <MetricCardsGrid $marginTop="0">
              <MetricCard>
                <MetricLabel>Avg Energy Revenue - At Prod. Date Price</MetricLabel>
                <MetricValue>{metrics.avgEnergyRevenueAtProdDate} $/MWh</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Avg Hash Revenue - At Prod. Date Price</MetricLabel>
                <MetricValue>{metrics.avgHashRevenueAtProdDate} $/PH/s/day</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Avg Energy Revenue - In Bitcoin Terms</MetricLabel>
                <MetricValue>{metrics.avgEnergyRevenueAtProdDateSats} Sats/MWh</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Avg Hash Revenue - In Bitcoin Terms</MetricLabel>
                <MetricValue>{metrics.avgHashRevenueAtProdDateSats} Sats/PH/s/day</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Avg Power Consumption</MetricLabel>
                <MetricValue>
                  {metrics.avgPowerConsumption} {metrics.avgPowerConsumptionUnit}
                </MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Avg Hashrate</MetricLabel>
                <MetricValue>
                  {metrics.avgHashrate} {metrics.avgHashrateUnit}
                </MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Energy Curtailment Rate</MetricLabel>
                <MetricValue>
                  {formatNumber(metrics.energyCurtailmentRate, {}, '0')} {UNITS.PERCENT}
                </MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Hashrate Capacity Factors</MetricLabel>
                <MetricValue>
                  {formatNumber(metrics.hashrateCapacityFactors, {}, '0')} {UNITS.PERCENT}
                </MetricValue>
              </MetricCard>
            </MetricCardsGrid>
          </ChartsRow>
        </>
      )}
    </PageRoot>
  )
}

export default RevenueSummary
