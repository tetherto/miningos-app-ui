import styled from 'styled-components'

import { flexColumn } from '../../../app/mixins'
import { CardContainer } from '../../Card/Card.styles'

export const Container = styled.div`
  ${flexColumn};
  gap: 30px;
`

export const Item = styled.div`
  ${flexColumn};
  gap: 5px;
  min-width: 330px;
  width: 100%;

  ${CardContainer} {
    flex-wrap: unset;
    height: 100%;
  }
`
