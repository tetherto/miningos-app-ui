import styled from 'styled-components'

import { flexAlign, flexColumn } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const CoolingCardWrapper = styled.div`
  ${flexColumn};
  border: 1px solid ${COLOR.COLD_ORANGE_ALPHA_04};
`

export const CcmHeader = styled.div`
  ${flexAlign};
  padding: 12px 16px;
  border-bottom: none;
  justify-content: space-between;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const CcmTitle = styled.span`
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.3px;
  color: ${COLOR.WHITE};
`

export const CcmPowerValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const CcmPower = styled.span`
  font-size: 13px;
  font-weight: 700;
  line-height: normal;
  color: ${COLOR.COLD_ORANGE};
`

export const CcmPowerUnit = styled.span`
  font-size: 11px;
  font-weight: 400;
  line-height: normal;
  color: ${COLOR.SOFT_AMBER};
`
