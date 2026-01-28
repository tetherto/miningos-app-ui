import styled from 'styled-components'

import { flexColumn, flexJustifyBetween, flexRow } from '../../../../../app/mixins'

export const FireStatusBoxContainer = styled.div`
  ${flexColumn};
  row-gap: 5px;
`

export const ValueBoxesRow = styled.div`
  ${flexRow};
  column-gap: 5px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
export const ActionsRow = styled(ValueBoxesRow)`
  ${flexJustifyBetween};
  padding: 0 5px;
  box-sizing: border-box;
  flex-grow: 1;
`
