import styled from 'styled-components'

interface StyledProps {
  $increase?: unknown
  $decrease?: unknown
}

import { COLOR } from '@/constants/colors'

export const ColoredText = styled.span<StyledProps>`
  color: ${({ $increase, $decrease }) => {
    if ($increase) {
      return COLOR.GRASS_GREEN
    }
    if ($decrease) {
      return COLOR.BRICK_RED
    }
    return COLOR.WHITE
  }};
  font-size: 13px;
  font-weight: 400;
`
