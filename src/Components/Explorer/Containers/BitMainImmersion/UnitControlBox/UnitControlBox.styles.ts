import styled from 'styled-components'

interface StyledProps {
  $isOn?: unknown
}

import { flexRow } from '../../../../../app/mixins'
import { StartedOption } from '../ControlBox/ControlBox.styles'

import { COLOR } from '@/constants/colors'

export const BasicSwitchContainer = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`

export const StyledStartedOption = styled(StartedOption)<StyledProps>`
  color: ${(props) => (props.$isOn ? COLOR.GRASS_GREEN : COLOR.BRICK_RED)};
`
