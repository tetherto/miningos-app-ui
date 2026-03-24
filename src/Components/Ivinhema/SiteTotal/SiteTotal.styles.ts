import styled from 'styled-components'

import { flexColumn, flexJustifyBetween, flexCenterRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const SiteTotalWrapper = styled.div`
  ${flexJustifyBetween};
  gap: 50px;
  max-width: fit-content;
  padding: 10px 10px 13px 17px;
  background-color: ${COLOR.SIMPLE_BLACK};
  border: 1px solid ${COLOR.COLD_ORANGE_ALPHA_04};
`

export const SiteTotalTitle = styled.p`
  color: ${COLOR.WHITE};
  font-size: 12px;
  font-weight: 800;
  line-height: 14px;
  letter-spacing: 1.32px;
  text-transform: uppercase;
`

export const SiteTotalLeft = styled.div`
  ${flexColumn};
  gap: 8px;
`

export const SiteTotalName = styled.p`
  font-size: 10px;
  font-weight: 400;
  line-heght: normal;
  color: ${COLOR.NEUTRAL_GRAY};
`

export const SiteTotalRight = styled.div`
  ${flexCenterRow};
  align-items: baseline;
  gap: 10px;
  line-height: 26px;
`

export const SiteTotalValue = styled.p`
  font-size: 20px;
  font-weight: 700;
  line-height: 100%;
  color: ${COLOR.COLD_ORANGE};
`

export const SiteTotalUnit = styled.span`
  font-size: 11px;
  font-weight: 400;
  line-height: 100%;
  color: ${COLOR.SOFT_AMBER};
`
