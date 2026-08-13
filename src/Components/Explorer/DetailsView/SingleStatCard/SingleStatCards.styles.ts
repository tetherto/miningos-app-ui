import styled, { css } from 'styled-components'

interface StyledProps {
  $secondary?: unknown
  $tertiary?: unknown
  $longvalue?: unknown
  $row?: boolean
  $flash?: boolean
  $color?: string
  $superflash?: unknown
}

import {
  flexColumn,
  flashTextAnimation,
  flexRow,
  flexCenterRow,
  flashBorderAnimation,
} from '@/app/mixins'
import { CardContainer } from '@/Components/Card/Card.styles'
import { COLOR } from '@/constants/colors'

export const SingleStatCardName = styled.div<StyledProps>`
  ${({ $secondary, $tertiary }) =>
    $secondary || $tertiary
      ? ''
      : css`
          color: ${COLOR.WHITE_ALPHA_05};
        `}
  text-wrap: nowrap;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`

export const SingleStatCardSubtitle = styled.span<StyledProps>`
  ${({ $secondary, $tertiary }) =>
    $secondary || $tertiary
      ? css`
          @media (max-width: 768px) {
            font-size: 10px;
          }
        `
      : css`
          color: ${COLOR.WHITE_ALPHA_05};
        `}
`

export const SingleStatCardValue = styled.div<StyledProps>`
  ${(props) => (props.$longvalue ? '' : 'font-size: 14px;')}
  color: ${COLOR.WHITE};
  ${({ $secondary, $tertiary }) =>
    $secondary || $tertiary
      ? css`
          text-align: end;
        `
      : css`
          font-size: 10px;
          text-wrap: no-wrap;
        `}
`

const itemGap = '3px'

export const SingleStatCardRoot = styled(CardContainer)<StyledProps>`
  ${({ $row }) => ($row ? flexRow : flexColumn)};
  gap: ${itemGap};
  font-size: 12px;
  width: 100%;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  ${({ $secondary, $tertiary }) =>
    $secondary || $tertiary
      ? css`
          ${flexCenterRow};
          justify-content: space-between;
          flex-wrap: nowrap;
          overflow: hidden;
          padding: 12px;
          background-color: ${COLOR.BLACK_ALPHA_05};
        `
      : css`
          ${flexColumn};
          width: 100%;
        `}

  ${({ $flash, $color }) =>
    $flash &&
    css`
      animation: ${flashBorderAnimation($color, COLOR.BLACK_ALPHA_05)} 1s infinite;

      & > * {
        animation: ${flashTextAnimation($color)} 1s infinite;
      }
    `}

  ${({ $tertiary, $color }) =>
    $tertiary
      ? css`
          border: 1px solid ${$color};

          & > * {
            color: ${$color};
          }
        `
      : ''}

  ${({ $superflash, $color }: StyledProps) =>
    $superflash
      ? css<StyledProps>`
          animation: ${flashBorderAnimation($color as string | undefined, COLOR.BLACK_ALPHA_05)}
            0.5s infinite;

          & > * {
            animation: ${flashTextAnimation($color as string | undefined)} 0.5s infinite;
            font-weight: 500;
          }
        `
      : ''}
`

export const SingleStatCardSecondaryText = styled.div<StyledProps>`
  ${flexColumn};
  gap: ${itemGap};
`
