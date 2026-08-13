import { FC } from 'react'

import {
  ContainerFanLegendContainer,
  ContainerFanLegendIconContainer,
} from '../../BitdeerOptions.styles'
import FanIcon from '../Icons/FanIcon'

interface ContainerFanLegendProps {
  index?: unknown
  enabled?: unknown
}

export const ContainerFanLegend: FC<ContainerFanLegendProps> = ({ index, enabled }) => (
  <ContainerFanLegendContainer $on={enabled as boolean}>
    {index !== null ? String(index) : ''}
    <ContainerFanLegendIconContainer $on={enabled}>
      <FanIcon />
    </ContainerFanLegendIconContainer>
  </ContainerFanLegendContainer>
)
