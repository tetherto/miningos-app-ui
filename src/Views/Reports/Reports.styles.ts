import Button from 'antd/es/button'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const PageTitle = styled.div`
  font-weight: 500;
  font-style: Medium;
  font-size: 24px;
  line-height: 24px;
  letter-spacing: 0%;
`

export const ColouredMetric = styled.div<{ $textColor: string }>`
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  color: ${(props) => props.$textColor};
  background-color: ${(props) => props.$textColor}1A;
  text-align: center;
`

export const HighlightableButton = styled(Button)`
  &.active {
    background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
    color: ${COLOR.COLD_ORANGE};
    border: 1px solid transparent;
  }
`
