import styled from 'styled-components'

interface StyledProps {
  $hasSelection?: unknown
}

import { flexCenterRow, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const SitesUnitWrapper = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(260px, 30%, 320px), 1fr));
  gap: 30px;
`

export const SitesOverviewRow = styled.div<StyledProps>`
  ${flexRow};
  background-color: ${COLOR.DARK};
  width: 100%;
  align-items: flex-start;
  margin-top: 40px;
`

export const SitesUnitCol = styled.div<StyledProps>`
  box-sizing: border-box;
  padding-top: 0;
  border-right: ${(props) => (props.$hasSelection ? `1px solid ${COLOR.DARKER_GREY}` : 'none')};
  width: 100%;
`
export const StickyConfigurationCol = styled(SitesUnitCol)<StyledProps>`
  position: sticky;
  top: 0;
  overflow-y: auto;
  max-width: 35%;
  min-width: 300px;
`

export const SetPoolConfigurationTabletButton = styled.div<StyledProps>`
  ${flexCenterRow};
  position: fixed;
  bottom: 70px;
  z-index: 1;
  background-color: ${COLOR.COLD_ORANGE};
  width: 70px;
  height: 70px;
  padding: 8px;
  text-align: center;
  border-radius: 100%;
  right: 10px;
  bottom: 10px;
  flex-direction: column;
  cursor: pointer;
`
