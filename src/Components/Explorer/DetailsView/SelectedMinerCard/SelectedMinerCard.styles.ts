import Button from 'antd/es/button'
import styled from 'styled-components'

interface StyledProps {
  $on?: unknown
}

import { flexCenter, flexCenterColumn, flexColumn, flexAlign } from '../../../../app/mixins'
import { CardContainer } from '../../../Card/Card.styles'

import { COLOR } from '@/constants/colors'

export const SelectedMinerCardContainer = styled(CardContainer)<StyledProps>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 10px;
  align-items: center;
  padding: 5px;
  margin: 1px;
`

export const SelectedMinerDetailsContainer = styled(CardContainer)<StyledProps>`
  ${flexColumn};
  gap: 10px;
  padding: 17px;
`

export const SelectedMinerDetailsHeader = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: space-between;
`

export const SelectedMinerDetailsBody = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  font-size: 12px;
  font-weight: 400;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const SelectedMinerDetailsHeaderAddress = styled.p<StyledProps>`
  color: ${COLOR.WHITE_ALPHA_05};
  font-size: 12px;
  font-weight: 400;
`

export const SelectedMinerDetailsHeaderContainerName = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 400;
`

export const SelectedMinerLEDStatusIndicator = styled.div<StyledProps>`
  ${flexCenter};
  color: ${COLOR.WHITE};
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${(props) => (props.$on ? COLOR.GRASS_GREEN : COLOR.BRICK_RED)};
  padding: 3px;
  width: 12px;
  height: 5px;
`
export const StatusIndicatorCol = styled.div<StyledProps>`
  justify-self: flex-start;
  ${flexCenterColumn};
  margin-right: 5px;
  gap: 2px;
`

export const SuccessMessage = styled.p<StyledProps>`
  font-size: 14px;
  color: ${COLOR.GRASS_GREEN};
`

export const FailMessage = styled.p<StyledProps>`
  font-size: 14px;
  color: ${COLOR.BRICK_RED};
`

export const DeleteButton = styled(Button)<StyledProps>`
  justify-self: flex-end;
`

export const StatusRow = styled.div<StyledProps>`
  ${flexAlign};
  gap: 6px;
`

export const ShortCodeText = styled.span<StyledProps>`
  font-weight: 600;
  color: ${COLOR.WHITE};
  font-size: 13px;
`

export const StatusIndicatorWrapper = styled.div<StyledProps>`
  ${flexColumn};
  align-items: center;
  gap: 4px;
`
