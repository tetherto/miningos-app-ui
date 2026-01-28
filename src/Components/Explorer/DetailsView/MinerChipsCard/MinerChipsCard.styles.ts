import styled from 'styled-components'

import { flexRow } from '../../../../app/mixins'

export const ChipsWrapper = styled.div`
  ${flexRow};
  flex-wrap: wrap;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  justify-content: space-evenly;
`
