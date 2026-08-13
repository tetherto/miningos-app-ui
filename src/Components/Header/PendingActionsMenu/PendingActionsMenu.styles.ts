import styled from 'styled-components'

interface StyledProps {
  $color?: string
  $action?: unknown
  $value?: number
}

import { flexCenterRow, flexColumn, flexRow } from '../../../app/mixins'

import { COLOR, ATTENTION_LEVEL_COLORS } from '@/constants/colors'

const AttentionLevels = {
  reboot: ATTENTION_LEVEL_COLORS.REBOOT,
  setLED: ATTENTION_LEVEL_COLORS.SET_LED,
  switchCoolingSystem: ATTENTION_LEVEL_COLORS.SWITCH_COOLING,
  switchSocket: ATTENTION_LEVEL_COLORS.SWITCH_SOCKET,
  setPowerMode: ATTENTION_LEVEL_COLORS.SET_POWER_MODE,
}

export const PendingTasksCountContainer = styled.div<StyledProps>`
  display: flex;
  cursor: pointer;
  transition: transform 0.1s;
`

export const Value = styled.div<StyledProps>`
  ${flexCenterRow};
  background-color: ${({ $color }) => ($color ? `${$color}33` : COLOR.RED)};
  color: ${({ $color }) => $color || COLOR.WHITE};
  width: 45px;
  height: 45px;
  border-radius: 0;
  font-weight: 600;
  margin: 0 8px 0 0;
  padding: 5px;
  box-sizing: border-box;
  position: relative;

  svg {
    &:hover {
      transform: scale(1.1);
    }
  }

  &::before {
    content: '';
    top: 0;
    width: 0;
    height: 0;
    z-index: 1;
    left: 0;
    position: absolute;
    border-style: solid;
    border-width: 8px 8px 0 0;
    border-color: ${COLOR.BLACK} transparent transparent transparent;
  }
`

export const ActionsDropdownLabelInnerContainer = styled.div<StyledProps>`
  ${flexColumn};
  flex: 1;
  justify-content: center;
`

export const ActionsDropdownLabelContainer = styled.div<StyledProps>`
  ${flexRow};
  background-color: ${(props) => {
    const action = props.$action as keyof typeof AttentionLevels | undefined
    return action && action in AttentionLevels ? AttentionLevels[action] : COLOR.COLD_ORANGE
  }};
  padding: 15px;

  &:hover {
    background-color: ${COLOR.COLD_ORANGE} !important;
  }
`

export const LabelHeaderText = styled.div<StyledProps>`
  font-size: 12px;
`
export const LabelBodyText = styled.div<StyledProps>`
  font-size: 12px;
  color: ${COLOR.CARD_BODY_TEXT};
`

export const ValueContainer = styled.span<StyledProps>`
  ${flexCenterRow};
  position: absolute;
  bottom: 0;
  right: 0;
  min-width: 5px;
  min-height: 8px;
  font-size: 9px;
  padding: 0 2px;
  border-radius: 2px 0 0;
  background-color: ${COLOR.BLACK};
`
