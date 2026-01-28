import styled from 'styled-components'

import { flexColumn } from '../../../../../../app/mixins'

export const ValueBoxContainer = styled.div`
  ${flexColumn};
  flex-basis: 50%;
  align-items: center;
  text-align: center;
`

export const Label = styled.div`
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 10px;
  flex: 1;
`

export const Value = styled.div`
  font-size: 20px;
  font-weight: 500;
  flex: 1;
`
