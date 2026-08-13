import Radio from 'antd/es/radio'
import type { RadioChangeEvent } from 'antd/es/radio'
import _map from 'lodash/map'
import _noop from 'lodash/noop'

import type { Timeline } from '../Dashboard/HashRateLineChart/HashRateLineChartWithPool/HashRateLineChartWithPool.types'

import {
  RadioButtonGroup,
  TimelineToggleButtonText,
  TimelineToggleOuterContainer,
} from './TimelineToggle.styles'

interface RadioButton {
  value: string
  text: string
  disabled?: boolean
}

interface TimelineToggleProps {
  value?: string
  disabled?: boolean
  radioButtons?: RadioButton[]
  onChange?: (value: Timeline) => void
}

const TimelineToggle = ({
  radioButtons = [],
  value = '',
  disabled = false,
  onChange = _noop,
}: TimelineToggleProps) => {
  const handleRadioGroupChange = (e: RadioChangeEvent) => onChange(e.target.value)

  return (
    <TimelineToggleOuterContainer>
      <RadioButtonGroup
        size="small"
        disabled={disabled}
        value={value}
        onChange={handleRadioGroupChange}
      >
        {_map(radioButtons, (button: RadioButton) => (
          <Radio.Button key={button.value} value={button.value} disabled={button.disabled}>
            <TimelineToggleButtonText>{button.text}</TimelineToggleButtonText>
          </Radio.Button>
        ))}
      </RadioButtonGroup>
    </TimelineToggleOuterContainer>
  )
}

export default TimelineToggle
