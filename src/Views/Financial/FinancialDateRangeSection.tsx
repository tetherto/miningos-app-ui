import type { DateRangeChangeHandler } from './Financial.types'
import { PeriodSelectLabel, ResetButton, Separator } from './FinancialShared.styles'

import type { BtcSatToggleProps } from '@/Components/BtcSatToggle/BtcSatToggle'
import BtcSatToggle from '@/Components/BtcSatToggle/BtcSatToggle'
import { DurationButtonsWrapper } from '@/MultiSiteViews/Common.style'
import type { DateRange } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'
import { TimeframeControls } from '@/MultiSiteViews/SharedComponents/Header/TimeframeControls'

interface FinancialDateRangeSectionProps {
  dateRange: DateRange | null | undefined
  onRangeChange: DateRangeChangeHandler
  onReset?: () => void
  isMonthSelectVisible?: boolean
  isWeekSelectVisible?: boolean
  hasBtcSatToggle?: boolean
  btcSatToggleProps?: Partial<BtcSatToggleProps>
}

/**
 * Shared date range selection section for Financial views
 * Includes period label, timeframe controls, and reset button
 */
export const FinancialDateRangeSection = ({
  dateRange,
  onRangeChange,
  onReset,
  isMonthSelectVisible = true,
  isWeekSelectVisible = true,
  hasBtcSatToggle = false,
  btcSatToggleProps,
}: FinancialDateRangeSectionProps) => {
  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      // Default reset: clear the date range
      onRangeChange([new Date(), new Date()], { period: '' })
    }
  }

  // Convert null to undefined for TimeframeControls
  const normalizedDateRange: DateRange | undefined = dateRange ?? undefined
  const shouldShowBtcSatToggle = hasBtcSatToggle || !!btcSatToggleProps

  return (
    <>
      <PeriodSelectLabel>SELECT A PERIOD IN ONE OF THE TIMEFRAMES</PeriodSelectLabel>

      <DurationButtonsWrapper $justifyContent="flex-start">
        <TimeframeControls
          isMonthSelectVisible={isMonthSelectVisible}
          isWeekSelectVisible={isWeekSelectVisible}
          onRangeChange={onRangeChange}
          dateRange={normalizedDateRange}
        />
        {shouldShowBtcSatToggle && (
          <BtcSatToggle {...btcSatToggleProps} fullHeight={btcSatToggleProps?.fullHeight ?? true} />
        )}
        <Separator />
        <ResetButton onClick={handleReset}>Reset</ResetButton>
      </DurationButtonsWrapper>
    </>
  )
}
