import Select from 'antd/es/select'
import styled from 'styled-components'

import { alignCenter, flexColumn, flexRow } from '../../../app/mixins'

export const TagFilterBarContainer = styled.div`
  ${flexColumn};
  gap: 12px;
  flex: 1;
  margin-bottom: 20px;
  column-gap: 10px;
  align-items: stretch;

  @media (min-width: 900px) {
    ${flexRow};
    ${alignCenter};
  }
`

export const StyledSelect = styled(Select)`
  width: 100%;
`
