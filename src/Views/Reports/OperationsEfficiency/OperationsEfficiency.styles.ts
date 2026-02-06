import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'

export const OperationsEfficiencyWrapper = styled.div`
  ${flexColumn};
  gap: 16px;
  padding: 30px 20px;
  width: 100%;
  box-sizing: border-box;
`

export const DatePickerContainer = styled.div`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const ChartHeaderActions = styled.div`
  ${flexRow};
  align-items: center;
  gap: 8px;
`

export const AverageEfficiencyValue = styled.div`
  ${flexRow};
  align-items: center;
  gap: 15px;
`

export const ChartTitle = styled.div`
  font-size: 20px;
`

export const ChartHeader = styled.div`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
`
