import _isString from 'lodash/isString'
import styled from 'styled-components'

interface StyledProps {
  $backgroundColor?: string
  $textColor?: unknown
  $bold?: boolean
  $uppercase?: boolean
  $borderColor?: string
  $capitalize?: boolean
  $disabled?: boolean
}

import { flexCenterRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const DropdownButton = styled.div<StyledProps>`
  ${flexCenterRow};
  white-space: nowrap;
  justify-content: space-between;
  gap: 5px;
  padding: 0 5px;
  color: ${COLOR.COLD_ORANGE};
  border: 1px solid ${COLOR.COLD_ORANGE};
  background-color: ${COLOR.BLACK};
  border-radius: 0;
  cursor: pointer;

  &[disabled],
  &.disabled {
    cursor: not-allowed;
  }
`

export const LinksDropdownButton = styled.div<StyledProps>`
  ${flexCenterRow};
  white-space: nowrap;
  justify-content: space-between;
  padding: 0;
  font-size: 18px;
  cursor: pointer;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const ColoredDropdownButton = styled(DropdownButton)<StyledProps>`
  padding: 8px 12px;
  font-size: 11px;
  line-height: 20px;
  min-height: 22px;
  border: 0;
  background-color: ${({ $backgroundColor }) => $backgroundColor ?? COLOR.BLACK};
  color: ${({ $textColor }) => (_isString($textColor) ? $textColor : COLOR.COLD_ORANGE)};
  ${({ $bold }) => ($bold ? 'font-weight: 600;' : '')};
  ${({ $uppercase }) => ($uppercase ? 'text-transform: uppercase;' : '')};
`

export const DropdownItem = styled.div<StyledProps>`
  &:hover {
    color: ${COLOR.BLACK};
  }
`

export const NoWrapText = styled.div<StyledProps>`
  text-wrap: nowrap;
  text-overflow: ellipsis;
`

export const CenteredText = styled.div<StyledProps>`
  text-align: center;
`

export const ColoredValue = styled.span<StyledProps>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: ${({ $borderColor }) => `2px solid ${$borderColor}`};
  white-space: nowrap;
  text-transform: ${({ $capitalize }) => ($capitalize ? 'capitalize' : 'uppercase')};
`

export const ColoredTableValue = styled(ColoredValue)<StyledProps>`
  ${flexCenterRow};
  justify-content: flex-start;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: ${({ $borderColor }) => `2px solid ${$borderColor}`};
  padding: 6px 12px;
  font-size: 11px;
  margin: 10px;
`
