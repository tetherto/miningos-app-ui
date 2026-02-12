import { getPeriodType } from '../common/financial.helpers'
import { useFinancialDateRange } from '../common/useFinancialDateRange'
import { PageTitle } from '../FinancialShared.styles'

import {
  aggregateBlocksByPeriod,
  transformToAverageFeesChartData,
  transformToSubsidyFeesChartData,
} from './SubsidyFee.helpers'
import {
  ChartsContainer,
  ErrorMessage,
  HeaderButtons,
  HeaderWithToggle,
  InfoText,
  PageRoot,
  PeriodSelectLabel,
  SetCostButton,
} from './SubsidyFee.styles'
import type { MempoolBlockData } from './SubsidyFee.types'

import { useGetExtDataQuery } from '@/app/services/api'
import { isDemoMode } from '@/app/services/api.utils'
import { formatValueUnit } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { DurationButtonsWrapper } from '@/MultiSiteViews/Common.style'
import { TimeframeControls } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

const SubsidyFee = () => {
  const { dateRange, handleRangeChange } = useFinancialDateRange()
  const periodType = getPeriodType(dateRange)

  const queryParams = dateRange
    ? {
        type: 'mempool',
        query: JSON.stringify({
          key: 'HISTORICAL_BLOCKSIZES',
          start: dateRange.start,
          end: dateRange.end,
        }),
      }
    : undefined

  const {
    data: blockData,
    isLoading,
    isError,
  } = useGetExtDataQuery(queryParams!, {
    skip: !queryParams,
    refetchOnMountOrArgChange: true,
  })

  // Process and aggregate data
  const getAggregatedData = () => {
    if (!dateRange || !blockData) return []

    const blocks = (
      Array.isArray(blockData) && blockData[0] ? blockData[0] : []
    ) as MempoolBlockData[]

    return aggregateBlocksByPeriod(blocks, periodType)
  }

  const aggregatedData = getAggregatedData()

  // Transform for charts
  const subsidyFeesChartData = transformToSubsidyFeesChartData(aggregatedData)

  const averageFeesChartData = transformToAverageFeesChartData(aggregatedData)

  // Chart formatters
  const formatBTCValue = (value: number) => formatValueUnit(value)
  const formatPercentValue = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <PageRoot>
      {isLoading && <Spinner />}

      <HeaderWithToggle>
        <PageTitle>Subsidy / Fee</PageTitle>
        <HeaderButtons>
          <SetCostButton to="/reports/financial/cost-input">
            <img src="/icons/Coins.svg" alt="Coins" />
            Set Monthly Cost
          </SetCostButton>
        </HeaderButtons>
      </HeaderWithToggle>

      <PeriodSelectLabel>SELECT A PERIOD IN ONE OF THE TIMEFRAMES</PeriodSelectLabel>

      <DurationButtonsWrapper>
        <TimeframeControls
          isMonthSelectVisible
          isWeekSelectVisible
          onRangeChange={handleRangeChange}
          dateRange={dateRange || undefined}
        />
      </DurationButtonsWrapper>

      {!isDemoMode && isError && (
        <ErrorMessage>Error loading block data. Please try again later.</ErrorMessage>
      )}

      {!dateRange && (
        <InfoText>
          Please select a time period using the Year, Month, or Week selectors above to view Bitcoin
          network subsidy and fee data.
        </InfoText>
      )}

      {dateRange && !isLoading && aggregatedData.length > 0 && (
        <ChartsContainer>
          <ThresholdBarChart
            chartTitle="Subsidy/Fees"
            data={subsidyFeesChartData}
            unit="BTC"
            isStacked
            yTicksFormatter={formatBTCValue}
            yRightTicksFormatter={formatPercentValue as never}
            barWidth={45}
            legendPlacement="bottom"
            timeframeType={undefined}
            isLegendVisible
            showDataLabels
          />

          <ThresholdBarChart
            chartTitle="Average Fees in Sats/vByte"
            data={averageFeesChartData}
            unit="Sats/vByte"
            yTicksFormatter={formatBTCValue}
            barWidth={45}
            legendPlacement="bottom"
            timeframeType={undefined}
            isLegendVisible
            showDataLabels
          />
        </ChartsContainer>
      )}

      {dateRange && !isLoading && aggregatedData.length === 0 && (
        <ErrorMessage>No data available for the selected period.</ErrorMessage>
      )}
    </PageRoot>
  )
}

export default SubsidyFee
