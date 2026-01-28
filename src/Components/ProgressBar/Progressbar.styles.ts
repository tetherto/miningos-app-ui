import styled from 'styled-components'

import { COLOR } from '../../constants/colors'

interface StyledProps {
  $isVertical?: boolean
  $isBelowTreeshold?: boolean
  $fillPercentage?: number
  $thresholdValue?: number
  $isShort?: boolean
  color?: string
}

const ProgressBarContainer = styled.div<StyledProps>`
  width: ${(props) => (props.$isVertical ? '10px' : '100%')};
  height: ${(props) => (props.$isVertical ? '100%' : '10px')};
  background-color: ${COLOR.WHITE};
  position: relative;
`

const FilledPart = styled.div<StyledProps>`
  position: absolute;
  background-color: ${(props) => (props.$isBelowTreeshold ? COLOR.YELLOW : COLOR.RED)};
  ${(props) =>
    props.$isVertical
      ? `height: ${props.$fillPercentage}%; bottom: 0; left: 0; right: 0`
      : `top: 0; left: 0; width: ${props.$fillPercentage}%; height: 100%;`}
`

const ThresholdLine = styled.div<StyledProps>`
  position: absolute;
  ${(props) => (props.color ? `${props.color}` : COLOR.RED)};
  ${(props) => (props.$isVertical ? 'width: 120%;' : 'height: 120%;')};
  ${(props) =>
    props.$isVertical
      ? `top: ${100 - (props.$thresholdValue ?? 0)}%`
      : `left: ${props.$thresholdValue ?? 0}%`};
  ${(props) => (props.$isVertical ? 'left: -3px' : 'top: -3px')};
  ${(props) =>
    props.color ? `border: 2px solid ${props.color}` : `border: 2px solid ${COLOR.RED}`};
`

const ThresholdValueText = styled.div<StyledProps>`
  font-size: 10px;
  color: ${COLOR.YELLOW};
  position: absolute;
  ${(props) => (props.$isShort ? 'margin-left: 10px' : 'margin-left: 6px')};
  ${(props) => (props.$isVertical ? 'bottom' : 'left')}: ${(props) => props.$thresholdValue ?? 0}%;
  ${(props) =>
    props.$isVertical ? 'transform: translate(50%, 50%)' : 'transform: translate(-50%, 100%)'};
  ${(props) => (props.$isVertical ? 'text-wrap: wrap' : 'text-wrap: nowrap')};
`

export { FilledPart, ProgressBarContainer, ThresholdLine, ThresholdValueText }
