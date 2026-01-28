import _isNil from 'lodash/isNil'

import { ReportTimeFrameSelectorWrapper } from './ReportTimeFrameSelectorWrapper.styles'
import TimeFrameSelector from './TimeFrameSelector/TimeFrameSelector'

import PresetDateRangePicker from '@/Components/PresetDateRangePicker/PresetDateRangePicker'
export { default as useReportTimeFrameSelectorState } from './useReportTimeFrameSelectorState'

interface ReportTimeFrameSelectorProps {
  presetTimeFrame: number | null
  dateRange: [Date, Date]
  setPresetTimeFrame: (value: number | null) => void
  setDateRange: (range: [Date, Date]) => void
}

const ReportTimeFrameSelector = ({
  presetTimeFrame,
  dateRange,
  setPresetTimeFrame,
  setDateRange,
}: ReportTimeFrameSelectorProps) => {
  const handleTimeFrameChange = (value: number | null) => {
    setPresetTimeFrame(value)
  }

  const handleCustomDateRangeChange = (range: [Date, Date] | null) => {
    if (range) {
      setDateRange(range)
    }
  }

  const showDateRangePicker = _isNil(presetTimeFrame)

  return (
    <ReportTimeFrameSelectorWrapper>
      <TimeFrameSelector value={presetTimeFrame} onChange={handleTimeFrameChange} />
      {showDateRangePicker && (
        <PresetDateRangePicker
          showTime={false}
          currentValue={dateRange}
          onRangeChange={handleCustomDateRangeChange}
        />
      )}
    </ReportTimeFrameSelectorWrapper>
  )
}

export default ReportTimeFrameSelector
