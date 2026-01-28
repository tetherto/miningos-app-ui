import styled from 'styled-components'

interface StyledProps {
  $bottomMargin?: unknown
  $small?: unknown
  $color?: string
}

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const Container = styled.div<StyledProps>`
  ${flexColumn};
  gap: 20px;
  padding-bottom: 10px;

  @media (min-width: 992px) {
    display: grid;
    grid-gap: 10px;
    grid-template-rows: repeat(7, auto);
  }
`

export const Article = styled.article<StyledProps>`
  ${flexColumn};
  align-items: stretch;
  gap: 20px;
  margin-bottom: ${(props) => (props.$bottomMargin ? '24px' : '0')};

  @media (min-width: 768px) {
    ${flexRow};
    justify-content: space-around;
  }
`

export const Boxed = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-around;
  align-items: center;
  border: 1px solid ${COLOR.ORANGE};
  border-radius: 0;
  padding: 5px 10px;
  margin: 0 10px;
  min-width: 190px;
  align-self: ${(props) => (props.$small ? 'center' : 'auto')};
  @media (min-width: 768px) {
    width: 100%;
    flex: ${(props) => (props.$small ? '1' : '2')};
  }
`

export const PiesWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 30px;
  margin-top: 20px;
  grid-row: 1 / -1;
  grid-column: 2 / 3;

  @media (min-width: 768px) {
    justify-content: space-around;
    gap: 45px;
  }

  @media (min-width: 992px) {
    ${flexColumn};
    align-self: flex-end;
    margin-top: 0;
  }
`

export const LegendChartWrapper = styled.div<StyledProps>`
  ${flexRow};
  margin-top: 10px;
  gap: 15px;
`

export const Legend = styled.div<StyledProps>`
  ${flexColumn};
  justify-content: center;
  gap: 5px;

  div {
    ${flexRow};
    font-size: 12px;
    font-weight: 500;
    align-items: center;
    gap: 5px;
  }
`

export const LegendBox = styled.div<StyledProps>`
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.$color};
`
