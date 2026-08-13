import styled, { keyframes } from 'styled-components'

interface StyledProps {
  $maxWidth?: string | number
}

import { COLOR } from '@/constants/colors'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
`

export const TooltipContainer = styled.div<StyledProps>`
  position: relative;
  display: inline-block;
`

export const TooltipTrigger = styled.div<StyledProps>`
  display: inline-block;
  cursor: pointer;
`

export const TooltipContent = styled.div<StyledProps>`
  color: ${COLOR.WHITE};
  background-color: ${COLOR.DARK};
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  max-width: ${(props) => props.$maxWidth}px;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid ${COLOR.COLD_ORANGE};
  animation: ${fadeIn} 0.09s ease-out;
  pointer-events: auto;

  &.tooltip-exit {
    animation: ${fadeOut} 0.15s ease-in;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 10px;
    max-width: 200px;
  }
`
