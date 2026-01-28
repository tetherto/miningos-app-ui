import _isEmpty from 'lodash/isEmpty'

import type { Timeline } from '../Dashboard/HashRateLineChart/HashRateLineChartWithPool/HashRateLineChartWithPool.types'
import TimelineToggle from '../TimelineToggle/TimelineToggle'

import { HeaderContainer, HeaderTitle, StyledRow, TimelineCol } from './LineChartCard.styles'

interface RadioButton {
  value: string
  label?: string
  text?: string
  disabled?: boolean
}

interface LineChartCardToggleProps {
  title?: string
  timeline?: string
  radioButtons?: RadioButton[]
  onChangeTimeline?: (value: Timeline) => void
}

export const LineChartCardToggle = ({
  title,
  timeline,
  onChangeTimeline,
  radioButtons = [],
}: LineChartCardToggleProps) => (
  <StyledRow>
    {title && <HeaderTitle>{title}</HeaderTitle>}
    {!_isEmpty(radioButtons) && (
      <HeaderContainer>
        <TimelineCol>
          <TimelineToggle
            radioButtons={
              radioButtons.map((btn) => ({
                value: btn.value,
                disabled: btn.disabled ?? false,
                text: btn.text || btn.label || '',
              })) as Array<{ value: string; text: string; disabled?: boolean }>
            }
            value={timeline}
            onChange={onChangeTimeline}
          />
        </TimelineCol>
      </HeaderContainer>
    )}
  </StyledRow>
)

export default LineChartCardToggle
