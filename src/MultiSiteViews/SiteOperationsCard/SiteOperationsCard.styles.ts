import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const Card = styled.div`
  ${flexColumn};
  gap: 10px;
  padding: 21px;
  background-color: ${COLOR.BLACK_ALPHA_05};
`

export const CardTitle = styled.p`
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.6px;
`

export const CardValue = styled.p`
  font-size: 24px;
  font-weight: 700;
`
