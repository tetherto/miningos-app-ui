import styled from 'styled-components'

import { flexColumn, flexRow } from '../../app/mixins'

export const ViewWrapper = styled.div`
  ${flexColumn};
  gap: 10px;
  margin-top: 20px;
  padding: 10px;
`

export const SelectWrapper = styled.div`
  ${flexColumn};
  gap: 10px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    ${flexRow}
    align-items: center;
  }
`

export const ChartTypeWrapper = styled.div`
  ${flexColumn};
  gap: 10px;
  margin-bottom: 20px;
`
export const OverviewChartLayout = styled.div`
  ${flexColumn};
  gap: 20px;
`
