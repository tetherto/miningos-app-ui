import Col from 'antd/es/col'
import Row from 'antd/es/row'
import styled from 'styled-components'

interface StyledProps {
  $on?: unknown
  isHighlighted?: boolean
}

import { flexCenterColumn, flexColumn, flexJustifyCenter, flexRow } from '../../../../app/mixins'
import { DeviceCardContainer } from '../ListView.styles'

import { COLOR } from '@/constants/colors'

export const MinerCardCol = styled(Col)<StyledProps>`
  ${flexColumn};
`

export const MinerCardColRow = styled(Row)<StyledProps>`
  flex: 1;
`

export const MinerCardColRowWidth = styled(MinerCardColRow)<StyledProps>`
  width: 150px;
`

export const ColIconContainer = styled(Col)<StyledProps>`
  ${flexJustifyCenter};
  width: 30px;
  height: 25px;
`

export const MinerCardContainer = styled(Row)<StyledProps>`
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${COLOR.COLD_ORANGE};
  ${(props) => (props.isHighlighted ? `background-color: ${COLOR.SOFT_TEAL}` : '')};
`

export const MinerCardColText = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  grid-column: 1 / -1;
`

export const MinedCardSecondaryText = styled.div<StyledProps>`
  grid-column: 1 / -1;
  color: ${COLOR.GREY};
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 160% */
`

export const ColoredPowerIconContainer = styled.div<StyledProps>`
  display: flex;
  color: ${(props) => props.color};
`

export const LEDStatusIndicator = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 3px;
  background-color: ${(props) => (props.$on ? COLOR.GRASS_GREEN : COLOR.BRICK_RED)};
  padding: 3px;
  width: min-content;
  height: min-content;
  ${flexCenterColumn};
`

export const MinerDeviceCardContainer = styled(DeviceCardContainer)<StyledProps>`
  cursor: pointer;
  border: 1px solid ${(props) => (props.isHighlighted ? COLOR.COLD_ORANGE : COLOR.DARKER_GREY)};
  ${(props) => (props.isHighlighted ? `background-color: ${COLOR.SOFT_TEAL}` : '')};
`

export const MinerStatusIndicatorContainer = styled.div<StyledProps>`
  ${flexRow};
  justify-content: center;
`

export const HashrateWrapper = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 5px;
`

export const MinerCardTextWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 5px;
`

export const MinerCardFirstRow = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`
