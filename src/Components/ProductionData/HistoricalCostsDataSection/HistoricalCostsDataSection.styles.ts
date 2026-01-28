import styled from 'styled-components'

import { HISTORICAL_COSTS_DATA_SECTION_CHART_HEIGHT } from './HistoricalCostsDataSection.const'

import { flexCenterColumn, flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const HistoricalCostDataSectionRoot = styled.div`
  ${flexColumn};
  gap: 12px;
`

export const HistoricalCostDataSectionItem = styled.div`
  ${flexColumn};
  gap: 16px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  background-color: ${COLOR.DARK};
`

export const HistoricalCostDataSectionItemTitle = styled.span`
  font-size: 18px;
  font-weight: 600;
`

export const HistoricalCostDataSectionItemChart = styled.div`
  ${flexCenterColumn};
  height: ${HISTORICAL_COSTS_DATA_SECTION_CHART_HEIGHT}px;
`
