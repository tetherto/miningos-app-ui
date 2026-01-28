import styled from 'styled-components'

interface StyledProps {
  $pie?: boolean
  inline?: boolean
}

import { flexColumn, flexRow, alignCenter } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const Container = styled.div<StyledProps>`
  ${flexColumn};
  gap: 20px;
  padding: 10px 0;
`

export const Row = styled.div<StyledProps>`
  ${flexColumn};
  ${alignCenter};
  gap: 20px;

  @media (min-width: 992px) {
    ${flexRow};
    align-items: flex-start;
  }
`

export const Item = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  align-items: center;
  text-align: center;
  font-size: 20px;
  font-weight: 700;

  @media (min-width: 992px) {
    ${(prop) => (prop.inline ? flexRow : flexColumn)};
  }
`

export const TimeIntervalRow = styled(Row)<StyledProps>`
  margin-top: -50px;
`

export const TimeIntervalCol = styled(Item)<StyledProps>`
  margin-right: auto;
`

export const LabelText = styled.span<StyledProps>`
  font-size: 12px;
  color: ${COLOR.ORANGE};
  font-weight: 500;
  max-width: 135px;
`

export const ChartContainer = styled.div<StyledProps>`
  max-height: ${(props) => (props.$pie ? '100px' : 'none')};
  width: ${(props) => (props.$pie ? 'auto' : '100%')};
`
