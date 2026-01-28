import styled from 'styled-components'

import { flexCenterRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const TotalPowerValueContainer = styled.div`
  ${flexCenterRow};
  font-size: 22px;
  font-weight: 700;
  color: ${COLOR.COLD_ORANGE};
  padding: 10px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`

export const TotalPowerMeta = styled.span`
  font-size: 18px;
  font-weight: 500;
`
