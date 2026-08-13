import styled, { css } from 'styled-components'

interface StyledProps {
  $color?: string
  $flash?: boolean
  $big?: boolean
  $spaceBetween?: boolean
  $justify?: string
}

import { flexColumn, flexRow, flashTextAnimation } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const HeaderStatBoxWrapper = styled.div<StyledProps>`
  gap: 12px;
  font-family: 'JetBrains Mono', sans-serif;
  ${flexRow};
`

export const HeaderStatBoxLeftCol = styled.div<StyledProps>`
  ${flexColumn}
  gap: 6px;
`

export const HeaderStatBoxHeading = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 8.45px;

  font-size: 13px;
  line-height: 15.73px;
`

export const HeaderStatBoxTitle = styled.span<StyledProps>`
  font-size: 14px;
  font-weight: 500;

  ${({ $color }) => ($color ? `color: ${$color};` : '')};
  ${({ $flash, $color }) =>
    $flash
      ? css`
          animation: ${flashTextAnimation($color, COLOR.WHITE)} 1s infinite;
        `
      : ''};
`
export const HeaderStatBoxValue = styled.span<StyledProps>`
  font-size: ${({ $big }) => ($big ? '14px' : '12px')};
  font-weight: 500;

  span {
    margin: 0 2px;
    font-weight: 700;
  }

  span:not(:first-child) {
    color: ${COLOR.GREY};
  }
`

export const HeaderStatBoxRightCol = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
`

export const HeaderStatsRow = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 12px;
  justify-content: ${({ $spaceBetween }) => ($spaceBetween ? 'space-between' : 'center')};
`
export const HeaderStatsRowTitle = styled.span<StyledProps>`
  font-size: 12px;
  font-weight: 500;
  color: ${COLOR.GREY};
  text-wrap: nowrap;
`

const statValueColorMap = {
  green: COLOR.GREEN,
  orange: COLOR.ORANGE,
  red: COLOR.RED,
}

export const HeaderStatsRowValue = styled.span<StyledProps>`
  box-sizing: border-box;
  color: ${({ $color = COLOR.WHITE }) => {
    const colorKey = $color as keyof typeof statValueColorMap

    return statValueColorMap[colorKey] || COLOR.WHITE
  }};
  font-size: 14px;
  font-weight: 700;
  text-align: center;
`

export const HeaderStatBoxValueWrapper = styled.div<StyledProps>`
  ${flexRow};
  gap: 5px;
  justify-content: ${({ $justify = 'right' }) => $justify};
  align-items: center;
  color: ${(props) => props.$color || COLOR.WHITE};
  flex: 1;

  ${({ $flash, $color }) =>
    $flash
      ? css`
          animation: ${flashTextAnimation($color, COLOR.WHITE)} 1s infinite;
        `
      : ''}
`
export const HeaderStatBoxValueSuffix = styled.span<StyledProps>`
  font-size: 13px;
  font-weight: 400;
  color: ${COLOR.GREY};
`

export const MinerBoxWrapper = styled.div<StyledProps>`
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: repeat(2, auto);
  gap: 8px;
  position: relative;
`
