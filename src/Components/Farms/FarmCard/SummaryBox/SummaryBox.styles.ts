import styled from 'styled-components'

import { flexAlign } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const SummaryBoxContainer = styled.div`
  background-color: ${COLOR.GRAY};
  padding: 19px 24px;
`

export const FarmName = styled.div`
  text-transform: uppercase;
  font-weight: 700;
  font-size: 24px;
  color: ${COLOR.LIGHT};
  text-overflow: ellipsis;
  overflow: hidden;
  text-wrap: nowrap;
  margin-bottom: 6px;
`

export const Location = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: ${COLOR.LIGHT};
  margin-bottom: 6px;
`

export const Starred = styled.div`
  ${flexAlign};
  font-weight: 700;
  font-size: 11px;
  color: ${COLOR.LIGHT};
  column-gap: 8px;
`
