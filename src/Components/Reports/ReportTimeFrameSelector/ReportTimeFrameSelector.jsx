import _isNil from 'lodash/isNil'
import PropTypes from 'prop-types'

import { ReportTimeFrameSelectorWrapper } from './ReportTimeFrameSelectorWrapper.styles'
import TimeFrameSelector from './TimeFrameSelector/TimeFrameSelector'

import PresetDateRangePicker from '@/Components/PresetDateRangePicker/PresetDateRangePicker'
export { default as useReportTimeFrameSelectorState } from './useReportTimeFrameSelectorState'

const ReportTimeFrameSelector = ({
  presetTimeFrame,
  dateRange,
  setPresetTimeFrame,
  setDateRange,
}) => {
  const handleTimeFrameChange = (value) => {
    setPresetTimeFrame(value)
  }

  const handleCustomDateRangeChange = (range) => {
    setDateRange(range)
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

ReportTimeFrameSelector.propTypes = {
  presetTimeFrame: PropTypes.number,
  dateRange: PropTypes.array,
  setPresetTimeFrame: PropTypes.func,
  setDateRange: PropTypes.func,
}

export default ReportTimeFrameSelector
