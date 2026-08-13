import styled from 'styled-components'

import { flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const EnergyReportMinerTypeViewContainer = styled.div`
  margin-top: 20px;
  padding: 24px;
  background-color: ${COLOR.SIMPLE_BLACK};
`

export const ChartTitle = styled.div`
  font-size: 20px;
`

export const ChartHeader = styled.div`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
`

export const ChartHeaderActions = styled.div`
  ${flexRow};
  align-items: center;
  gap: 8px;
`
