import styled from 'styled-components'

interface StyledProps {
  $large?: unknown
  $textColor?: string
  $background?: string
  $color?: string
  $size?: string | number
  $itemsCount?: number
}

import { flexCenterColumn, flexCenterRow } from '@/app/mixins'

export const MinersActivityChartRoot = styled.div<StyledProps>`
  gap: 8px;
  ${flexCenterRow};
`

export const MinersActivityChartItem = styled.div<StyledProps>`
  flex: 1;
  ${flexCenterColumn};
  font-size: ${({ $large }) => ($large ? '16px' : '12px')};
  font-weight: 400;
  padding: 4px 0;
  ${({ $large }) => ($large ? 'gap: 8px' : '')};
  text-transform: capitalize;
  color: ${(props) => props.$textColor};
  background-color: ${(props) => props.$textColor}1A;
`

export const MinersActivityChartItemLabel = styled.span<StyledProps>`
  ${({ $large }) => ($large ? 'font-size: 14px' : '')};
  white-space: nowrap;
  text-align: center;
  @media (max-width: 475px) {
    font-size: 9px;
  }
`

export const Bar = styled.div<StyledProps>`
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  width: ${(props) => `${props.$size}%`};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 15px;
`

export const Chart = styled.div<StyledProps>`
  display: flex;
  margin: 0 0 20px 0;
  overflow: hidden;
`
