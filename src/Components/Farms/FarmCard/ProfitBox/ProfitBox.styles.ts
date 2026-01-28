import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ProfitBoxContainer = styled.div`
  padding: 16px 24px;
`

export const Title = styled.div`
  ${flexAlign};
  text-transform: uppercase;
  color: ${COLOR.LIGHT};
  font-weight: 700;
  font-size: 18px;
  column-gap: 7px;
  margin-bottom: 5px;
`

export const Value = styled.div`
  font-weight: 700;
  font-size: 20px;
  color: ${COLOR.BRICK_RED};
  margin-bottom: 10px;
`
