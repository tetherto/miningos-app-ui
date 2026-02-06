import styled, { css } from 'styled-components'

import { flexRow } from '@/app/mixins'
import { hexToOpacity } from '@/Components/LineChartCard/utils'
import { COLOR } from '@/constants/colors'

interface LegendContainerProps {
  $forceRow?: boolean
  $hasMany?: boolean
}

interface LegendItemProps {
  $isHidden?: boolean
}

interface LegendColorBoxProps {
  $color?: string
  $isCircle?: boolean
  $isHidden?: boolean
}

interface LegendLabelProps {
  $isHidden?: boolean
}

const getLegendContainerStyles = ({ $forceRow, $hasMany }: LegendContainerProps) => {
  if ($forceRow) {
    return css`
      ${flexRow};
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 16px;
    `
  }

  if ($hasMany) {
    return css`
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: center;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    `
  }

  return css`
    ${flexRow};
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  `
}

export const LegendContainer = styled.div<LegendContainerProps>`
  ${(props) => getLegendContainerStyles(props)}
`

export const LegendItem = styled.div<LegendItemProps>`
  ${flexRow};
  gap: 6px;
  align-items: center;
  cursor: pointer;
  user-select: none;
  opacity: ${({ $isHidden }) => ($isHidden ? 0.4 : 1)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: ${({ $isHidden }) => ($isHidden ? 0.6 : 0.8)};
  }
`

export const LegendColorBox = styled.div<LegendColorBoxProps>`
  width: 12px;
  height: 12px;
  background-color: ${({ $color }) => {
    const color = $color || COLOR.WHITE
    return hexToOpacity(color)
  }};
  border: 1px solid ${({ $color }) => $color || COLOR.WHITE};
  border-radius: ${({ $isCircle }) => ($isCircle ? '50%' : '0')};
  flex-shrink: 0;
  opacity: ${({ $isHidden }) => ($isHidden ? 0.4 : 1)};
  transition: opacity 0.2s ease;
`

export const LegendLabel = styled.span<LegendLabelProps>`
  color: ${COLOR.WHITE};
  font-size: 12px;
  line-height: 1;
  opacity: ${({ $isHidden }) => ($isHidden ? 0.5 : 1)};
  transition: opacity 0.2s ease;
  text-decoration: ${({ $isHidden }) => ($isHidden ? 'line-through' : 'none')};
`
