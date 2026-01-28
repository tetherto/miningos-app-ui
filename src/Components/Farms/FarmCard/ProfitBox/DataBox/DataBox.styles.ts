import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const DataBoxContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 12px;
  }
`
export const Label = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: ${COLOR.GREY};
  margin-bottom: 6px;
`
export const Value = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${COLOR.LIGHT};
`
