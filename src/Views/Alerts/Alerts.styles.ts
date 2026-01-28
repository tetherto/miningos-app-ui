import styled from 'styled-components'

import { flexColumn } from '../../app/mixins'

export const ButtonContainer = styled.div`
  cursor: pointer;
`

export const TableTitleText = styled.div`
  font-size: 16px;
  font-weight: 600;
`

export const AlertsOuterContainer = styled.div`
  ${flexColumn};
  gap: 10px;
  margin-top: 20px;
  padding: 10px;
`

export const HistoricalAlertsWrapper = styled.div`
  margin-bottom: 20px;
`
