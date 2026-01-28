import styled from 'styled-components'

import { flexCenterRow, flexRow } from '../../../app/mixins'

export const BreadcrumbsWrapper = styled.div`
  width: 100%;
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  // placement for reporting tool dashboard in wide screen mode
  grid-column: 1 / -1;
  padding-right: 5px;
  margin-bottom: 20px;
`
export const IconWrapper = styled.div`
  ${flexCenterRow};
  cursor: pointer;
  color: white;
  margin-left: 10px;
`

export const LeftWrapper = styled.div`
  display: flex;
  gap: 10px;
`
