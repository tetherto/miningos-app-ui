import styled from 'styled-components'

import { flexRow } from '@/app/mixins'
import { hexToOpacity } from '@/Components/LineChartCard/utils'
import { COLOR } from '@/constants/colors'

const getLegendContainerStyles = (props) => {
  if (props.$forceRow) {
    return `
      ${flexRow};
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 16px;
    `
  }
  if (props.$hasMany) {
    return `
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: center;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    `
  }
  return `
    ${flexRow};
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  `
}

export const LegendContainer = styled.div`
  ${(props) => getLegendContainerStyles(props)}
`

export const LegendItem = styled.div`
  ${flexRow};
  gap: 6px;
  align-items: center;
  cursor: pointer;
  user-select: none;
  opacity: ${(props) => (props.$isHidden ? 0.4 : 1)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: ${(props) => (props.$isHidden ? 0.6 : 0.8)};
  }
`

export const LegendColorBox = styled.div`
  width: 12px;
  height: 12px;
  background-color: ${(props) => {
    const color = props.$color || COLOR.WHITE
    return hexToOpacity(color, 0.2)
  }};
  border: 1px solid ${(props) => props.$color || COLOR.WHITE};
  border-radius: ${(props) => (props.$isCircle ? '50%' : '0')};
  flex-shrink: 0;
  opacity: ${(props) => (props.$isHidden ? 0.4 : 1)};
  transition: opacity 0.2s ease;
`

export const LegendLabel = styled.span`
  color: ${COLOR.WHITE};
  font-size: 12px;
  line-height: 1;
  opacity: ${(props) => (props.$isHidden ? 0.5 : 1)};
  transition: opacity 0.2s ease;
  text-decoration: ${(props) => (props.$isHidden ? 'line-through' : 'none')};
`
