import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

interface StyledProps {
  $width?: string
  $height?: string
  $minHeight?: string
}

export const BtcSatToggleButtonText = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
`

export const BtcSatToggleContainer = styled.div<StyledProps>`
  width: ${({ $width }) => $width ?? '118px'};
  height: ${({ $height }) => $height ?? 'auto'};
  min-height: ${({ $minHeight }) => $minHeight ?? '40px'};
  padding: 4px;
  box-sizing: border-box;
  background: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
  border-radius: 0;
  display: flex;
  align-items: stretch;
  align-self: stretch;

  /* Override parent wrappers */
  && {
    flex-wrap: nowrap;
    gap: 4px;
  }
`

interface ButtonProps {
  $selected?: boolean
}

export const BtcSatToggleButton = styled.button<ButtonProps>`
  flex: 1;
  align-self: stretch;
  border: 0;
  padding: 0;
  margin: 0;
  background: ${({ $selected }) => ($selected ? COLOR.COLD_ORANGE_ALPHA_02 : 'transparent')};
  color: ${({ $selected }) => ($selected ? COLOR.COLD_ORANGE : COLOR.WHITE_ALPHA_07)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: ${({ $selected }) => ($selected ? COLOR.COLD_ORANGE : COLOR.WHITE_ALPHA_07)};
  }

  &:focus-visible {
    outline: 1px solid ${COLOR.WHITE_ALPHA_04};
    outline-offset: -1px;
  }

  &:disabled {
    cursor: not-allowed;
    color: ${COLOR.WHITE_ALPHA_04};
  }
`
