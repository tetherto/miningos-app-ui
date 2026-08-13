import styled from 'styled-components'

import { flexCenterRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface MinersSummaryBoxParamLabelProps {
  $small: boolean
  $tiny: boolean
}

export const MinersSummaryBoxRoot = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
`

export const MinersSummaryBoxParam = styled.div`
  ${flexCenterRow};
  justify-content: space-between;
  font-size: 12px;
  font-weight: 400;
  line-height: 12px;
`

export const MinersSummaryBoxParamLabel = styled.span<MinersSummaryBoxParamLabelProps>`
  color: ${COLOR.WHITE_ALPHA_05};
  ${(props) => (props.$small ? 'font-size: 11px;' : '')}
  ${(props) => (props.$tiny ? 'font-size: 10px;' : '')}

  @media (max-width: 768px) {
    ${(props) => (props.$small ? 'font-size: 10px;' : '')}
    ${(props) => (props.$tiny ? 'font-size: 9px;' : '')}
  }
`

export const MinersSummaryBoxParamValue = styled.span`
  text-align: end;
  white-space: nowrap;
`
