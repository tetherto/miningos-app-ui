import Card from 'antd/es/card'
import styled, { css } from 'styled-components'

interface StyledProps {
  $hasSelection?: boolean
  $hasBorder?: boolean
  $isTablet?: boolean
  $value?: number
  $selectable?: boolean
  $textColor?: string
  selected?: boolean
}

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const Wrapper = styled.div<StyledProps>`
  ${flexRow};
  background-color: ${COLOR.DARK};
  width: 100%;
  align-items: flex-start;
  margin-top: 40px;
  gap: 40px;
`

export const RacksCol = styled.div<StyledProps>`
  box-sizing: border-box;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 30px;
  width: ${({ $hasSelection, $isTablet }) => ($hasSelection && !$isTablet ? '70%' : '100%')};
`

export const HeaderRow = styled.div<StyledProps>`
  ${flexColumn};
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (min-width: 730px) {
    ${flexRow};
  }
`

export const HeaderInfoCol = styled.div<StyledProps>`
  margin-right: 15px;
`

export const HeaderLabel = styled.div<StyledProps>`
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const HeaderValue = styled.div<StyledProps>`
  font-size: 16px;
  color: ${({ $value }) => (($value ?? 0) > 0 ? COLOR.COLD_ORANGE : COLOR.WHITE)};
  margin-top: 10px;
`

export const Info = styled.div<StyledProps>`
  ${flexRow};
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
`

export const Actions = styled.div<StyledProps>`
  ${flexRow};
  gap: 10px;
  margin-top: 10px;
  @media (min-width: 730px) {
    margin-top: 0;
  }
`

export const RacksWrapper = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 20px;
  width: max-content;
  min-width: 100%;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, auto);
`

export const MinersCard = styled(Card)<StyledProps>`
  border-radius: 0;
  .ant-card-head {
    border-bottom: unset;
  }

  .ant-card-body {
    padding-top: 0;
  }
`

export const MinersGrid = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-top: 10px;
`

export const MinerBox = styled.div<StyledProps>`
  ${flexColumn};
  justify-content: space-between;
  cursor: ${({ $selectable }) => ($selectable ? 'pointer' : 'default')};
  color: ${(props) => props.$textColor};
  background-color: ${(props) => props.$textColor}1A;
  text-align: center;
  padding: 10px 20px;
  font-size: 12px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  min-height: 60px;
  min-width: 40px;

  ${({ selected, $textColor }) =>
    selected &&
    css`
      border-color: ${$textColor};
    `}
`

export const MinerId = styled.div<StyledProps>`
  margin-top: 10px;
`

export const Legend = styled.div<StyledProps>`
  ${flexRow};
  gap: 30px;
  margin-top: 20px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 20px;
  flex-wrap: wrap;
`

export const LegendItem = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
  margin-right: 30px;

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background-color: ${({ color }) => color};
    ${({ $hasBorder }) =>
      $hasBorder &&
      css`
        border: 1px solid ${COLOR.WHITE_ALPHA_01};
      `}
    display: inline-block;
  }
`

export const ScrollableRacks = styled.div<StyledProps>`
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  background-color: ${COLOR.BLACK};
  padding: 30px 5%;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    background-color: transparent;
    height: 3px;
  }
  ::-webkit-scrollbar-track {
    background-color: ${COLOR.BLACK};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${COLOR.WHITE_ALPHA_07};
  }
`
