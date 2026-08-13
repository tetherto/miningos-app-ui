import styled from 'styled-components'

interface StyledProps {
  $exludeMarginTop?: unknown
}

import { CardContainer } from '@/Components/Card/Card.styles'
import { COLOR } from '@/constants/colors'

export const StyledCard = styled(CardContainer)<StyledProps>`
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const NoScrollStyledCard = styled(StyledCard)<StyledProps>`
  overflow-x: visible;
`

export const ContainerPanel = styled(StyledCard)<StyledProps>`
  padding: 25px;
  min-width: 300px;
  width: 100%;
  margin-top: ${({ $exludeMarginTop }) => ($exludeMarginTop ? '0' : undefined)};

  @media (min-width: 768px) {
    min-width: 300px;
    width: auto;
  }
`
