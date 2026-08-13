import styled from 'styled-components'

interface StyledProps {
  $secondary?: unknown
}

import { commonTextStyles, flexCenter } from '../../../../../app/mixins'
import { flexColumn, flexRow } from '../../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ControlBoxContainer = styled.div<StyledProps>`
  ${flexRow};
  gap: 4px;
  border: ${({ $secondary }) => ($secondary ? 'none' : `1px solid ${COLOR.WHITE_ALPHA_01}`)};
`

export const Title = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`

export const TopRow = styled.div<StyledProps>`
  ${flexRow};
  flex: 1;
`

export const BottomRow = styled.div<StyledProps>`
  ${flexCenter};
  padding: 16px;
  border-top: 1px solid ${COLOR.COLD_ORANGE};
`

export const LeftColumn = styled.div<StyledProps>`
  flex-basis: 50%;
  flex-grow: 0;
  flex-shrink: 0;
  border-right: 1px solid ${COLOR.COLD_ORANGE};
  padding: ${({ $secondary }) => ($secondary ? '0' : '16px')};
  padding-right: 8px;
  box-sizing: border-box;
  row-gap: 16px;
  ${flexColumn};
`

export const RightColumn = styled(LeftColumn)<StyledProps>`
  border: none;
  padding-left: 8px;
`

export const CurrentStatus = styled.div<StyledProps>`
  color: ${COLOR.RED};
  font-weight: 600;
  font-size: 14px;
  text-align: center;
`

export const StartedOption = styled.div<StyledProps>`
  font-weight: 600;
  font-size: 14px;
`

export const Frequency = styled.div<StyledProps>`
  ${flexRow}
  gap: 4px;
`

export const FrequencyLabel = styled.div<StyledProps>`
  font-size: 14px;
  font-weight: 600;
`
export const FrequencyValue = styled.div<StyledProps>`
  ${commonTextStyles};
  text-wrap: nowrap;
`
