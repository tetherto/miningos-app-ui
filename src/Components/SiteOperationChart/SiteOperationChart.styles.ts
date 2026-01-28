import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface StyledProps {
  $color?: string
  $hasUnit?: boolean
  $alignment?: unknown
  $isHidden?: unknown
  $padding?: string | number
  $backgroundColor?: string
  $hasSmallUnitPadding?: boolean
}

import { hexToOpacity } from '../LineChartCard/utils'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ChartWrapper = styled.div<StyledProps>`
  ${flexColumn};
  padding: 20px;
  padding-left: 0;
  overflow-x: hidden;

  background-color: ${({ $backgroundColor }) => $backgroundColor};
`

export const ChartHeader = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  margin-bottom: ${({ $hasUnit }) => ($hasUnit ? '0' : '12px')};
  gap: 24px;
  padding-left: 16px;
`

export const ChartFooter = styled.div<StyledProps>`
  padding-bottom: 14px;
  padding-top: 14px;
  padding-left: 16px;
`

export const StyledLink = styled(Link)<StyledProps>`
  font-weight: 500;
  margin-bottom: 14px;
  text-decoration: none;
  color: ${COLOR.COLD_ORANGE};

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`

export const Title = styled.h2<StyledProps>`
  margin: 5px 0 10px 0;
  flex: 1;
  font-size: 20px;
  font-weight: 400;
  line-height: normal;
`

export const Legend = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  flex-wrap: wrap;
  justify-content: ${({ $alignment }) => ($alignment as string) || 'center'};
  gap: 14px;
`

export const LegendItem = styled.div<StyledProps>`
  ${flexRow};
  gap: 5px;
  align-items: center;
  user-select: none;
  opacity: ${({ $isHidden }) => ($isHidden ? 0.3 : 1)};
`

export const LegendSquare = styled.div<StyledProps>`
  width: 10px;
  height: 10px;
  background-color: ${({ $color }) => hexToOpacity($color)};
  border: ${({ $color }) => ($color ? `1px solid ${$color}` : COLOR.WHITE_ALPHA_05)};
`

export const LegendLabel = styled.div<StyledProps>`
  color: ${COLOR.WHITE_ALPHA_07};
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
`

export const Unit = styled.div<StyledProps>`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  margin-bottom: 16px;
  color: ${COLOR.GRAY};
  padding-left: ${({ $hasSmallUnitPadding }) => ($hasSmallUnitPadding ? '12px' : '16px')};
`
