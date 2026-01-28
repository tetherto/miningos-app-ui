import { css, keyframes } from 'styled-components'

import { COLOR } from '@/constants/colors'

export const flex = (direction = 'column') => css`
  display: flex;
  flex-direction: ${direction};
`

export const flexItems = (align = 'center') => css`
  display: flex;
  align-items: ${align};
`

export const flexWrap = css`
  display: flex;
  flex-wrap: wrap;
`

export const flexJustify = (justify = 'space-around') => css`
  display: flex;
  justify-content: ${justify};
`
export const flexColumn = flex()
export const flexColumnReverse = flex('column-reverse')
export const flexAlign = flexItems()
export const flexJustifyAround = flexJustify()
export const flexRowReverse = flex('row-reverse')
export const flexJustifyBetween = flexJustify('space-between')
export const flexJustifyCenter = flexJustify('center')
export const flexJustifyEnd = flexJustify('flex-end')
export const flexRow = flex('row')

export const alignCenter = css`
  align-items: center;
  justify-content: center;
`

export const flexCenterColumn = css`
  ${flexColumn};
  ${alignCenter};
`

export const flexCenterRow = css`
  ${flexRow};
  ${alignCenter};
`

export const flexCenter = css`
  display: flex;
  ${alignCenter};
`

export const commonTextStyles = css`
  font-size: 20px;
  font-weight: 700;
  font-style: normal;
  line-height: 25px;
`

export const upperCaseText = css`
  text-transform: uppercase;
`

export const flashAnimation = (
  color: string | undefined = COLOR.RED,
  initial?: string,
) => keyframes`
  0%, 100% {
    background-color: ${initial || 'inherit'} ;
  }
  50% {
    background-color: ${color || COLOR.RED};
    opacity: 0.6;
  }
`

export const flashTextAnimation = (
  color: string | undefined = COLOR.RED,
  initial?: string,
) => keyframes`
  0%, 100% {
    color: ${initial || 'inherit'} ;
  }
  50% {
    color: ${color || COLOR.RED};
  }
`

export const flashBorderAnimation = (
  color: string | undefined = COLOR.RED,
  initial?: string,
) => keyframes`
  0%, 100% {
    border-color: ${initial || 'inherit'} ;
  }
  50% {
    border-color: ${color || COLOR.RED};
  }
`

export const cutCornerBefore = (cutEdgeSize = '8px') => css`
  &:before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    border-top: ${cutEdgeSize} solid ${COLOR.COLD_ORANGE};
    border-right: ${cutEdgeSize} solid transparent;
    width: 0;
    transition: border-color 0.4s;
  }
`
