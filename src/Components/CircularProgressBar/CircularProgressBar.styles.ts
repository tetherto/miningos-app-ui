import styled from 'styled-components'

import { flexCenterColumn, flexCenterRow, flexColumn, flexAlign } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const Container = styled.div`
  ${flexCenterColumn};
  position: relative;
  gap: 10px;

  @media (min-width: 1240px) {
    ${flexCenterRow};
    flex-wrap: wrap;
  }
`

export const ChartContainer = styled.div`
  position: relative;
`

interface SvgProps {
  size: number
}

export const Svg = styled.svg<SvgProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  viewbox: 0 0 ${(props) => props.size} ${(props) => props.size};
`

export const Tooltip = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  padding: 13px;
  font-size: 13px;
  pointer-events: none;
  color: ${COLOR.LIGHT_GREY};
  background: ${COLOR.BLACK};
  border-top-left-radius: 16px;
  transform: translate(-100%, -100%);
`

export const TooltipLabel = styled.div`
  margin-bottom: 4px;
`

export const LegendContainer = styled.div`
  ${flexColumn};
  margin-left: 5px;
  align-items: flex-start;
  font-size: 13px;
`

export const LegendItem = styled.div`
  ${flexAlign};
  margin-top: 5px;
  text-wrap: nowrap;

  &:first-child {
    margin-top: 0;
  }
`

interface ColorBoxProps {
  color: string
}

export const ColorBox = styled.div<ColorBoxProps>`
  width: 12px;
  height: 12px;
  background-color: ${(props) => props.color};
  margin-right: 8px;
`
