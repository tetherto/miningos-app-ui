import styled from 'styled-components'

import { flexCenterColumn } from '../../../../app/mixins'
import { CardContainer } from '../../../Card/Card.styles'

import { COLOR } from '@/constants/colors'

export const SecondaryStatCardName = styled.div`
  color: ${COLOR.LIGHT};
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.05px;
`

export const SecondaryStatCardValue = styled.div`
  color: ${COLOR.LIGHT};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
`

export const SecondaryStatCardContainer = styled(CardContainer)`
  border: none;
  height: 70px;
  ${flexCenterColumn};
`
