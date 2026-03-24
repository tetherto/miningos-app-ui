import styled from 'styled-components'

import { flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const LoopMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  gap: 16px;
`

export const LoopMetricsBody = styled.div`
  ${flexColumn};
  gap: 6px;
`

export const LoopMetricsTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const LoopMetricsValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`

export const LoopMetricsValue = styled.span`
  font-size: 20px;
  font-weight: 800;
  line-height: 20px;
  color: ${COLOR.COLD_ORANGE};
`

export const LoopMetricsUnit = styled.span`
  font-size: 11px;
  font-weight: 500;
  line-height: 11px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const LoopMetricsInfo = styled.div`
  font-size: 10px;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.WHITE_ALPHA_05};
`
