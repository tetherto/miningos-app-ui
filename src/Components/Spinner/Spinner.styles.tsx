import styled, { keyframes } from 'styled-components'

import { flexCenter } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface SpinnerContainerProps {
  $isFullScreen?: boolean
}

const cyberSpin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

export const SpinnerContainer = styled.div<SpinnerContainerProps>`
  ${flexCenter};
  position: fixed;
  width: ${({ $isFullScreen }) => ($isFullScreen ? '100dvw' : '100%')};
  box-sizing: border-box;
  height: 100dvh;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 24px;
  border-radius: 4px;
  box-shadow: inset 0 0 10px rgba(255, 147, 0, 0.2);
  pointer-events: none;

  .ant-spin-dot {
    width: 44px;
    height: 44px;
    animation: ${cyberSpin} 1.2s linear infinite !important;

    .ant-spin-dot-item {
      background-color: ${COLOR.ORANGE} !important; /* Orange glow */
      box-shadow:
        0 0 4px ${COLOR.ORANGE},
        0 0 12px ${COLOR.COLD_ORANGE};
      border-radius: 0; /* sharp edges to match dashboard style */
    }
  }
`
