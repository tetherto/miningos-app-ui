import styled from 'styled-components'

import { flexCenterRow, flexColumn } from '../../../../app/mixins'

export const ParametersTabContainer = styled.div`
  ${flexColumn};
  row-gap: 10px;
`

export const GaugesRow = styled.div`
  ${flexCenterRow};
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`
