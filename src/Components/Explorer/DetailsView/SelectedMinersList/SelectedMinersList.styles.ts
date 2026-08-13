import Button from 'antd/es/button'
import styled from 'styled-components'

import { flexColumn } from '../../../../app/mixins'

export const SelectedMinersListContainer = styled.div`
  width: 100%;
  padding: 5px;
`

export const SelectedMinerCardLabelContainer = styled.div`
  ${flexColumn};
  gap: 5px;
`

export const SelectedMinerCardLabelTitleContainer = styled.div`
  flex: 1;
`

export const SelectedMinerRemoveAllBtn = styled(Button)`
  align-self: end;
`
