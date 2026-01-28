import Button from 'antd/es/button'
import styled, { css } from 'styled-components'

import { COLOR } from '@/constants/colors'

const secondaryVerticalPadding = '30px'

interface SecondaryButtonProps {
  $collapseWord?: boolean
  $colPlacement?: string
}

interface StyledButtonProps {
  $isActive?: boolean
  $hasBigPadding?: boolean
}

export const SecondaryButton = styled(Button)<SecondaryButtonProps>`
  width: 100%;
  grid-column: ${(props) => (props.$colPlacement ? props.$colPlacement : 'auto')};
  ${({ $collapseWord }) =>
    $collapseWord &&
    css`
      white-space: normal;
      word-wrap: break-word;

      @media (max-width: 509px) {
        padding-top: ${secondaryVerticalPadding};
        padding-bottom: ${secondaryVerticalPadding};
      }
    `};
  [disabled] {
    opacity: 0.5;
  }
`

export const StyledButton = styled(Button)<StyledButtonProps>`
  pointer-events: ${({ $isActive }) => ($isActive ? 'none' : 'all')};
  background-color: ${({ $isActive }) => ($isActive ? `${COLOR.COLD_ORANGE}33` : COLOR.BLACK)};
  color: ${({ $isActive }) => ($isActive ? COLOR.COLD_ORANGE : COLOR.GREY)}!important;
  border: ${({ $isActive }) =>
    `1px solid ${$isActive ? COLOR.TRANSPARENT : COLOR.WHITE_ALPHA_02}`}!important;
  padding: ${({ $hasBigPadding }) => ($hasBigPadding ? '17px 40px' : '16px 17px')};
`

export const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
`
