import styled from 'styled-components'

interface StyledProps {
  $underline?: boolean
}

import { COLOR } from '@/constants/colors'

export const LabeledCardBody = styled.div<StyledProps>`
  flex: 1;
  overflow: hidden;
`
export const LabeledCardHeaderLabel = styled.div<StyledProps>`
  ${(props) => props.$underline && `border-bottom : 1px solid ${COLOR.WHITE_ALPHA_01};`}
  padding: 5px;
  padding-left: 10px;
`
