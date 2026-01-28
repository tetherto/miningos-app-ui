import _isEmpty from 'lodash/isEmpty'

import { PageTitle } from '../FinancialShared.styles'

import { checkIfAllValuesAreZero } from './EBITDA.helpers'
import {
  ChartsContainer,
  ErrorMessage,
  HeaderButtons,
  HeaderWithToggle,
  InfoText,
  MetricCard,
  MetricCardsGrid,
  MetricLabel,
  MetricSubtitle,
  MetricValue,
  PageRoot,
  PeriodSelectLabel,
  SetCostButton,
} from './EBITDA.styles'
import useEBITDA from './useEBITDA.hook'

import { FALLBACK, formatValueUnit } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY } from '@/constants/units'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { DurationButtonsWrapper } from '@/MultiSiteViews/Common.style'
import { TimeframeControls } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

const formatMetricValue = (value: number | string | undefined, unit: string) =>
  value === 0 ? FALLBACK : formatValueUnit(value as number, unit)

const EBITDA = () => {
  const {
    metrics,
    ebitdaChartData,
    btcProducedChartData,
    isLoading,
    handleRangeChange,
    dateRange,
    errors,
    currentBTCPrice,
  } = useEBITDA()

  const hasNoData = checkIfAllValuesAreZero(btcProducedChartData)

  return (
    <PageRoot>
      {isLoading && <Spinner />}

      <HeaderWithToggle>
        <PageTitle>EBITDA</PageTitle>
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
          isWeekSelectVisible={false}
          onRangeChange={handleRangeChange}
          dateRange={dateRange || undefined}
        />
      </DurationButtonsWrapper>

      {!_isEmpty(errors) && (
        <ErrorMessage>
          Error loading EBITDA data. Please try again later.
          {errors.map((error) => (
            <div key={error as string}>• {error as string}</div>
          ))}
        </ErrorMessage>
      )}

      {!dateRange && (
        <InfoText>
          Please select a time period using the Year or Month selectors above to view Bitcoin
          network subsidy and fee data.
        </InfoText>
      )}

      {dateRange && !isLoading && metrics && (
        <>
          <MetricCardsGrid>
            <MetricCard>
              <MetricLabel>Bitcoin Production Cost</MetricLabel>
              <MetricValue>
                {formatMetricValue(metrics.bitcoinProductionCost, CURRENCY.USD)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Bitcoin Price</MetricLabel>
              <MetricValue>{formatMetricValue(metrics.bitcoinPrice, CURRENCY.USD)}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Bitcoin Produced</MetricLabel>
              <MetricValue>{formatMetricValue(metrics.bitcoinProduced, CURRENCY.BTC)}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>EBITDA (Sell scenario - all BTC sold)</MetricLabel>
              <MetricValue $isHighlighted>
                {formatMetricValue(metrics.ebitdaSellingBTC, CURRENCY.USD)}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Actual EBITDA</MetricLabel>
              <MetricValue>{formatMetricValue(metrics.actualEbitda, CURRENCY.USD)}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>EBITDA (HODL scenario - no BTC sold)</MetricLabel>
              <MetricValue>
                {formatMetricValue(metrics.ebitdaNotSellingBTC, CURRENCY.USD)}
              </MetricValue>
              <MetricSubtitle>
                Current price: {formatValueUnit(currentBTCPrice, CURRENCY.USD)}
              </MetricSubtitle>
            </MetricCard>
          </MetricCardsGrid>

          {ebitdaChartData && btcProducedChartData && (
            <ChartsContainer>
              {dateRange?.period !== PERIOD.DAILY && (
                <ThresholdBarChart
                  chartTitle="Monthly EBITDA"
                  data={ebitdaChartData}
                  unit={CURRENCY.USD}
                  yTicksFormatter={(v) => formatValueUnit(v)}
                  barWidth={45}
                  timeframeType={undefined}
                  legendPlacement="bottom"
                  legendAlign="end"
                  showDataLabels
                />
              )}
              <ThresholdBarChart
                chartTitle="Bitcoin Produced"
                data={hasNoData ? { dataset: [] } : btcProducedChartData}
                unit={CURRENCY.BTC}
                yTicksFormatter={(v) => formatValueUnit(v)}
                barWidth={45}
                legendPlacement="bottom"
                timeframeType={undefined}
                legendAlign="end"
                showDataLabels
              />
            </ChartsContainer>
          )}
        </>
      )}

      {dateRange && !isLoading && !metrics && (
        <ErrorMessage>No data available for the selected period.</ErrorMessage>
      )}
    </PageRoot>
  )
}

export default EBITDA
