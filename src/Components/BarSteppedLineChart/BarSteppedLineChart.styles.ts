import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

interface StyledProps {
  $height?: string | number
}

export const BarSteppedLineChartRoot = styled.div<StyledProps>`
  height: ${(props) => props.$height}px;
`

export const Unit = styled.div`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  margin: 20px 0;
  color: ${COLOR.WHITE_ALPHA_06};
`
