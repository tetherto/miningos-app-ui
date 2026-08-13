import Row from 'antd/es/row'
import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../../app/mixins'

export const SectionRowTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 5px;
`

export const ContainerSectionRowTitle = styled(SectionRowTitle)`
  text-decoration: underline;
  text-underline-offset: 2px;
`

export const ContainerUnitRow = styled.div`
  ${flexColumn};
  row-gap: 10px;
  padding: 10px;
  border-radius: 2px;
  width: 100%;
  box-sizing: border-box;
`

export const SelectedSocketsListStyledRow = styled(Row)`
  width: 100%;
`

export const SocketListWrapper = styled.div`
  ${flexRow};
  flex-wrap: wrap;
  gap: 5px;
  max-width: 500px;
  column-gap: 16px;
`
