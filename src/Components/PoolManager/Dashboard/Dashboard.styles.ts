import styled from 'styled-components'

import { flexCenterRow, flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface StyledProps {
  $color?: string
}

export const DashboardWrapper = styled.div`
  ${flexColumn};
`

export const StatBlocks = styled.div`
  ${flexRow};
  padding: 10px;
  gap: 24px;
`

export const StatBlock = styled.div`
  background-color: ${COLOR.EBONY};
  flex: 1;
  height: 50px;

  ${flexColumn};
  gap: 16px;

  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 25px;
`

export const StatBlockHeader = styled.div`
  ${flexRow};
  justify-content: space-between;
`

export const StatBlockLabel = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0.3px;
`

export const StatBlockStatus = styled.div<StyledProps>`
  height: 8px;
  width: 8px;
  background-color: ${({ $color }) => $color ?? 'none'};
`

export const StatValueWrapper = styled.div`
  ${flexRow};
  gap: 4px;
`

export const StatValue = styled.div`
  font-weight: 400;
  font-size: 24px;
  line-height: 100%;
  color: ${COLOR.COLD_ORANGE};
`

export const StatSecondaryValue = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const NavigationBlocks = styled.div`
  ${flexRow};
  gap: 24px;
  padding: 10px;
  flex-direction: column;

  @media (min-width: 992px) {
    flex-direction: row;
  }
`

export const NavigationBlock = styled.div`
  ${flexColumn};
  height: 250px;
  flex: 1;
  gap: 24px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 25px;
`

export const NavigationBlockHeader = styled.div`
  ${flexRow};
  gap: 16px;
  align-items: center;
`

export const NavigationBlockIconWrapper = styled.div`
  ${flexCenterRow};
  height: 48px;
  width: 48px;
  background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
`

export const NavigationBlockTitle = styled.div`
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: 0%;
`

export const NavigationBlockDescription = styled.div`
  flex: 1;
  font-weight: 400;
  font-size: 14px;
  leading-trim: NONE;
  line-height: 22px;
  letter-spacing: 0%;
  color: ${COLOR.WHITE_ALPHA_07};
`

export const NavigationBlockAction = styled.div`
  ${flexRow};
  justify-content: space-between;
  color: ${COLOR.COLD_ORANGE};
  cursor: pointer;
`

export const AlertsWrapper = styled.div`
  ${flexColumn};
  gap: 8px;
  margin: 10px;
  padding: 25px;
  padding-top: 0;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const AlertsTitle = styled.div`
  font-weight: 400;
  font-size: 18px;
  line-height: 28px;
  background-color: ${COLOR.EBONY};
  color: ${COLOR.WHITE};
  height: 55px;
  ${flexRow};
  align-items: center;
`

export const Alerts = styled.div`
  padding: 0 0px;
`

export const AlertWrapper = styled.div`
  ${flexRow};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 8px 0;
`

export const AlertText = styled.div`
  ${flexRow};
  align-items: center;
  flex: 1;
  gap: 8px;
`

export const AlertStatus = styled.div<StyledProps>`
  height: 8px;
  width: 8px;
  background-color: ${({ $color }) => $color ?? 'none'};
`

export const AlertTime = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`
