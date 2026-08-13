import styled from 'styled-components'

interface StyledProps {
  $skipMinWidth?: unknown
}

import { COLOR } from '@/constants/colors'

export const ChartTooltip = styled.div<StyledProps>`
  min-width: ${({ $skipMinWidth }) => ($skipMinWidth ? 'unset' : '270px')};
  position: absolute;
  background: ${COLOR.DARK_BLACK};
  color: ${COLOR.LIGHT_GREY};
  font-size: 12px;
  font-weight: normal;
  padding: 13px;
  border-top-left-radius: 16px;
  pointer-events: none;
  top: 0;
  left: 0;
  z-index: 10;
`

export const ChartContainer = styled.div`
  .tv-lightweight-charts {
    #tv-attr-logo {
      display: none;
    }
  }
`

export const ChartWrapper = styled.div`
  width: 100%;
  min-width: 0;
`

export const ChartOuterWrapper = styled(ChartWrapper)`
  position: relative;
`
