import styled from 'styled-components'

interface StyledProps {
  $on?: unknown
}

import { StyledCard } from '../../../Container.styles'

import { flexCenterRow, flexColumn, flexAlign, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ContainerFanLegendContainer = styled.div<StyledProps>`
  ${flexColumn};
  width: 40px;
  height: 50px;
  align-items: center;
  border-radius: 3px;
  border: 1px solid transparent;
  border-color: ${(props) => (props.$on ? COLOR.GRASS_GREEN : 'transparent')};
  margin: 10px;
  justify-content: center;
  padding: 1px;
`

export const ContainerFanLegendIconContainer = styled.div<StyledProps>`
  ${flexCenterRow};
  width: 35px;
  height: 35px;
  color: ${(props) => (props.$on ? COLOR.GRASS_GREEN : COLOR.DARK_GREY)};
`

export const CoolingSystemContainer = styled.div<StyledProps>`
  ${flexAlign};
  margin: 0 10px;
  margin-bottom: 20px;
`

export const RightOptionsButtonsContainer = styled.div<StyledProps>`
  ${flexAlign};
  justify-content: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: fit-content;
  }
`

export const SystemStatusContainer = styled(StyledCard)<StyledProps>`
  padding: 15px;
  min-width: 100px;
  flex: 1;
`

export const BitdeerPumpsContainer = styled.div<StyledProps>`
  ${flexRow};
`

export const BitdeerOptionsContainer = styled.div<StyledProps>`
  ${flexRow};
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
`

export const BitdeerPumpSegment = styled.div<StyledProps>`
  ${flexColumn};
  width: 100%;
  gap: 10px;
  @media (min-width: 730px) {
    gap: 0;
  }
`
