import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import PropTypes from 'prop-types'

import { TimeFrameOption, TimeFrameSelectorWrapper } from './TimeFrameSelector.styles'

const TimeFrameSelector = ({ value, onChange }) => {
  const options = [
    { label: '1D', value: 1 },
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
  ]

  return (
    <TimeFrameSelectorWrapper>
      {_map(options, ({ label, value: optionValue }) => (
        <TimeFrameOption
          key={optionValue}
          $active={value === optionValue}
          onClick={() => onChange(optionValue)}
        >
          {label}
        </TimeFrameOption>
      ))}
      <TimeFrameOption $active={_isNil(value)} onClick={() => onChange(null)}>
        Custom
      </TimeFrameOption>
    </TimeFrameSelectorWrapper>
  )
}

TimeFrameSelector.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
}

export default TimeFrameSelector
