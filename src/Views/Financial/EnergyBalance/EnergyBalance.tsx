import { format } from 'date-fns/format'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

import { checkIfAllValuesAreZero } from '../EBITDA/EBITDA.helpers'
import { PageTitle } from '../FinancialShared.styles'

import {
  ChartsContainer,
  ChartWithToggle,
  ErrorMessage,
  HeaderButtons,
  HeaderWithToggle,
  InfoText,
  MetricCard,
  MetricCardsGrid,
  MetricLabel,
  MetricsRow,
  MetricValue,
  PageRoot,
  PeriodSelectLabel,
  SetCostButton,
  Tab,
  TabsWrapper,
  ToggleButton,
  ToggleWrapper,
} from './EnergyBalance.styles'
import type { EnergyBalanceTab } from './EnergyBalance.types'
import useEnergyBalance from './useEnergyBalance.hook'

import { formatNumber, formatValueUnit } from '@/app/utils/format'
import { Mosaic } from '@/Components/Mosaic/Mosaic'
import { Spinner } from '@/Components/Spinner/Spinner'
import { PERIOD } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'
import { DurationButtonsWrapper } from '@/MultiSiteViews/Common.style'
import { TimeframeControls } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

type RevenueDisplayMode = typeof CURRENCY.USD_LABEL | typeof CURRENCY.BTC_LABEL

const TAB_ITEMS = [
  { key: 'revenue', label: 'Energy Revenue' },
  { key: 'cost', label: 'Energy Cost' },
]

/**
 * Formats a timestamp to MM-yy format
 * Returns empty string if timestamp is invalid
 */
const monthYearFormatter = (ts: number | string) => {
  if (!ts) return ''
  const date = new Date(ts)
  return Number.isNaN(date.getTime()) ? '' : format(date, 'MM-yy')
}

const EnergyBalance = () => {
  const {
    isLoading,
    handleRangeChange,
    dateRange,
    periodType,
    errors,
    revenueMetrics,
    costMetrics,
    energyRevenueChartData,
    downtimeChartData,
    powerChartData,
    powerChartDataCostTab,
    energyCostChartData,
    hasData,
    activeTab,
    revenueDisplayMode,
    costDisplayMode,
    setRevenueDisplayMode,
    setCostDisplayMode,
    setActiveTab,
  } = useEnergyBalance()

  const handleRevenueDisplayToggle = (mode: RevenueDisplayMode) => {
    setRevenueDisplayMode(mode)
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key as EnergyBalanceTab)
  }

  const revenueNoData = checkIfAllValuesAreZero(energyRevenueChartData)

  return (
    <PageRoot>
      {isLoading && <Spinner />}

      <HeaderWithToggle>
        <PageTitle>Energy Balance</PageTitle>
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

      <TabsWrapper>
        {_map(TAB_ITEMS, (tab) => (
          <Tab
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabsWrapper>

      {!_isEmpty(errors) && (
        <ErrorMessage>
          Error loading Energy Balance data. Please try again later.
          {_map(errors, (error) => (
            <div key={error as string}>• {error as string}</div>
          ))}
        </ErrorMessage>
      )}

      {!dateRange && (
        <InfoText>
          Please select a time period using the Year, Month, or Week selectors above to view energy
          balance data.
        </InfoText>
      )}

      {dateRange && !isLoading && !hasData && (
        <ErrorMessage>No data available for the selected period.</ErrorMessage>
      )}

      {/* Energy Revenue Tab Content */}
      {dateRange && !isLoading && hasData && activeTab === 'revenue' && revenueMetrics && (
        <Mosaic template={['revenue revenue', 'left power']} gap="24px" columns="1fr 1fr">
          {/* Row 1 - Energy Revenue Chart (spans 2 cols) */}
          <Mosaic.Item area="revenue">
            <ChartWithToggle>
              <ToggleWrapper>
                <ToggleButton
                  $isActive={revenueDisplayMode === CURRENCY.USD_LABEL}
                  onClick={() => handleRevenueDisplayToggle(CURRENCY.USD_LABEL)}
                >
                  {CURRENCY.USD_LABEL}
                </ToggleButton>
                <ToggleButton
                  $isActive={revenueDisplayMode === CURRENCY.BTC_LABEL}
                  onClick={() => handleRevenueDisplayToggle(CURRENCY.BTC_LABEL)}
                >
                  {CURRENCY.BTC_LABEL}
                </ToggleButton>
              </ToggleWrapper>
              <ThresholdBarChart
                chartTitle="Site Energy Revenue"
                data={revenueNoData ? undefined : energyRevenueChartData}
                unit={
                  revenueDisplayMode === CURRENCY.USD_LABEL
                    ? `${CURRENCY.USD}/${UNITS.ENERGY_MWH}`
                    : `${CURRENCY.BTC}/${UNITS.ENERGY_MWH}`
                }
                yTicksFormatter={(v) => formatValueUnit(v)}
                barWidth={45}
                timeframeType={undefined}
                legendPlacement="bottom"
                legendAlign="end"
                showDataLabels
              />
            </ChartWithToggle>
          </Mosaic.Item>

          {/* Row 2, Col 1 - Metrics + Downtime Chart */}
          <Mosaic.Item area="left">
            <Mosaic template={['metrics', 'downtime']} gap="16px">
              <Mosaic.Item area="metrics">
                <MetricsRow>
                  <MetricCard>
                    <MetricLabel>Curtailment Rate</MetricLabel>
                    <MetricValue>
                      {formatNumber(revenueMetrics.curtailmentRate, {}, '0')} {UNITS.PERCENT}
                    </MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricLabel>Op. Issues Rate</MetricLabel>
                    <MetricValue>
                      {formatNumber(revenueMetrics.operationalIssuesRate, {}, '0')} {UNITS.PERCENT}
                    </MetricValue>
                  </MetricCard>
                </MetricsRow>
              </Mosaic.Item>
              <Mosaic.Item area="downtime">
                <ThresholdBarChart
                  chartTitle="Average Downtime"
                  data={downtimeChartData}
                  unit={UNITS.PERCENT}
                  isStacked
                  yTicksFormatter={(v) => formatValueUnit(v)}
                  barWidth={45}
                  timeframeType={undefined}
                  legendPlacement="bottom"
                  legendAlign="end"
                  showDataLabels
                />
              </Mosaic.Item>
            </Mosaic>
          </Mosaic.Item>

          {/* Row 2, Col 2 - Power Chart */}
          <Mosaic.Item area="power">
            <ThresholdLineChart
              title="Power"
              data={powerChartData}
              unit={UNITS.ENERGY_MW}
              legendPlacement="bottom"
              timeframeType={undefined}
              fullHeight
              labelFormatter={periodType === 'month' ? monthYearFormatter : undefined}
            />
          </Mosaic.Item>
        </Mosaic>
      )}

      {/* Energy Cost Tab Content */}
      {dateRange && !isLoading && hasData && activeTab === 'cost' && costMetrics && (
        <>
          <MetricCardsGrid>
            <MetricCard>
              <MetricLabel>Avg Power Consumption</MetricLabel>
              <MetricValue>
                {formatNumber(costMetrics.avgPowerConsumption)} {UNITS.ENERGY_MW}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg Energy Cost</MetricLabel>
              <MetricValue>
                {formatNumber(costMetrics.avgEnergyCost)} {CURRENCY.USD}/{UNITS.ENERGY_MWH}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg All-In Cost</MetricLabel>
              <MetricValue>
                {formatNumber(costMetrics.avgAllInCost)} {CURRENCY.USD}/{UNITS.ENERGY_MWH}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg Power Availability</MetricLabel>
              <MetricValue>
                {formatNumber(costMetrics.avgPowerAvailability)} {UNITS.ENERGY_MW}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg Operations Cost</MetricLabel>
              <MetricValue>
                {formatNumber(costMetrics.avgOperationsCost)} {CURRENCY.USD}/{UNITS.ENERGY_MWH}
              </MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Avg Energy Revenue</MetricLabel>
              <MetricValue>
                {formatNumber(costMetrics.avgEnergyRevenue)} {CURRENCY.USD}/{UNITS.ENERGY_MWH}
              </MetricValue>
            </MetricCard>
          </MetricCardsGrid>

          <ChartsContainer>
            {dateRange?.period !== PERIOD.DAILY && (
              <ChartWithToggle>
                <ToggleWrapper>
                  <ToggleButton
                    $isActive={costDisplayMode === CURRENCY.USD_LABEL}
                    onClick={() => setCostDisplayMode(CURRENCY.USD_LABEL)}
                  >
                    {CURRENCY.USD_LABEL}
                  </ToggleButton>
                  <ToggleButton
                    $isActive={costDisplayMode === CURRENCY.BTC_LABEL}
                    onClick={() => setCostDisplayMode(CURRENCY.BTC_LABEL)}
                  >
                    {CURRENCY.BTC_LABEL}
                  </ToggleButton>
                </ToggleWrapper>
                <ThresholdBarChart
                  chartTitle="Site Revenue vs Cost"
                  data={energyCostChartData}
                  unit={
                    costDisplayMode === CURRENCY.USD_LABEL
                      ? `${CURRENCY.USD}/${UNITS.ENERGY_MWH}`
                      : `${energyCostChartData.btcUnit}/${UNITS.ENERGY_MWH}`
                  }
                  timeframeType={undefined}
                  yTicksFormatter={(v) => formatValueUnit(v)}
                  barWidth={45}
                  legendPlacement="bottom"
                  legendAlign="end"
                  showDataLabels
                />
              </ChartWithToggle>
            )}
            <ThresholdLineChart
              title="Power"
              legendPlacement="bottom"
              data={powerChartDataCostTab}
              unit={UNITS.ENERGY_MW}
              timeframeType={undefined}
              labelFormatter={periodType === 'month' ? monthYearFormatter : undefined}
            />
          </ChartsContainer>
        </>
      )}
    </PageRoot>
  )
}

export default EnergyBalance
