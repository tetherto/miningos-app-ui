import Button from 'antd/es/button'
import { Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  DatePickerContainer,
  HashBalanceRoot,
  Header,
  HeaderButtons,
  SelectTimePeriodLabel,
  SetCostButton,
  Tab,
  TabsWrapper,
  TimeFrameContainer,
} from './HashBalance.styles'
import HashCostTab from './HashCostTab/HashCostTab'
import HashRevenueTab from './HashRevenueTab/HashRevenueTab'
import { getDefaultRange } from './utils/hashRevenueCostHelpers'

import { getRangeTimestamps } from '@/app/utils/dateUtils'
import { PERIOD } from '@/constants/ranges'
import { ROUTE } from '@/constants/routes'
import useMultiSiteDateRange from '@/hooks/useMultiSiteDateRange'
import useTimezone from '@/hooks/useTimezone'
import { TimeframeControls } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

const HashBalance = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'revenue' | 'cost'>('revenue')
  const { timezone } = useTimezone()
  const { dateRange, onTableDateRangeChange, timeframeType } = useMultiSiteDateRange()

  const onRangeChangeHandler = (
    dates: [Date, Date] | null,
    options?: { year?: number; month?: number; period?: string },
  ) => {
    if (!dates) return
    const timestamps = getRangeTimestamps(dates, timezone)

    if (!timestamps[0] || !timestamps[1]) return

    const period = options?.period || PERIOD.DAILY
    onTableDateRangeChange([timestamps[0], timestamps[1]], { period })
  }

  const handleReset = () => {
    const { start, end, period } = getDefaultRange(timeframeType)
    onTableDateRangeChange([start, end], { period })
  }

  const navigateToCostInput = () => {
    navigate(ROUTE.REPORTS_FINANCIAL_COST_INPUT)
  }

  return (
    <HashBalanceRoot>
      <Header>
        Hash Balance
        <HeaderButtons onClick={navigateToCostInput}>
          <SetCostButton>
            <img src="/icons/Coins.svg" alt="Coins" />
            Set Monthly Cost
          </SetCostButton>
        </HeaderButtons>
      </Header>

      <DatePickerContainer>
        <SelectTimePeriodLabel>Select a Period in one of the timeframes</SelectTimePeriodLabel>
        <TimeFrameContainer>
          <TimeframeControls
            isMonthSelectVisible
            isWeekSelectVisible
            onRangeChange={onRangeChangeHandler}
            dateRange={dateRange}
          />
          <Button onClick={handleReset}>Reset</Button>
        </TimeFrameContainer>
      </DatePickerContainer>

      <TabsWrapper>
        <Tab $active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')}>
          Hash Revenue
        </Tab>
        <Tab $active={activeTab === 'cost'} onClick={() => setActiveTab('cost')}>
          Hash Cost
        </Tab>
      </TabsWrapper>
      {activeTab === 'revenue' ? (
        <Suspense>
          <HashRevenueTab timeframeType={timeframeType} dateRange={dateRange}></HashRevenueTab>
        </Suspense>
      ) : (
        <Suspense>
          <HashCostTab timeFrameType={timeframeType} dateRange={dateRange}></HashCostTab>
        </Suspense>
      )}
    </HashBalanceRoot>
  )
}

export default HashBalance
