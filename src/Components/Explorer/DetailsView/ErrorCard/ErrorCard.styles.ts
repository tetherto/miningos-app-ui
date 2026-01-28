import styled from 'styled-components'

import { CardContainer } from '../../../Card/Card.styles'

import { COLOR } from '@/constants/colors'

export const ErrorTitle = styled.p`
  color: ${COLOR.BRICK_RED};
  font-size: 16px;
`

export const ErrorMessage = styled.p`
  color: ${COLOR.BRICK_RED};
  font-size: 14px;
`

export const StyledCardContainer = styled(CardContainer)`
  padding: 10px;
  gap: 10px;
`
