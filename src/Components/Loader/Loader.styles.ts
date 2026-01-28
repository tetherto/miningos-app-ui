import styled, { keyframes } from 'styled-components'

import { flexCenter } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface DotProps {
  $size: number
  $delay: number
  $activeColor: string
}

const pulse = keyframes`
  50% {
    background: var(--active-color);
    transform: scale(1);
  }
`

export const LoaderContainer = styled.div`
  ${flexCenter};
  height: 200px;
`

export const Dot = styled.span<DotProps>`
  transform: scale(2);
  background: ${COLOR.SOFT_APRICOT};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  margin: ${({ $size }) => $size / 1.5}px;
  animation: ${pulse} 1s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  --active-color: ${({ $activeColor }) => $activeColor};
`
