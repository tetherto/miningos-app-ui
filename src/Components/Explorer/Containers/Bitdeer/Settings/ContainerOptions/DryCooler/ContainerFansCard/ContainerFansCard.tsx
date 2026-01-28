import _map from 'lodash/map'
import { FC } from 'react'

import { ContainerFanLegend } from './ContainerFanLegend'
import { FanGridContainer } from './ContainerFansCard.styles'

interface ContainerFansCardProps {
  fansData?: unknown
}

export const ContainerFansCard: FC<ContainerFansCardProps> = ({ fansData }) => {
  const getFansGrid = () =>
    _map(fansData as unknown[], (fan: unknown, index: number) => {
      const fanTyped = fan as { enabled: boolean; index: number }
      return (
        <ContainerFanLegend key={index} enabled={fanTyped.enabled} index={fanTyped.index + 1} />
      )
    })

  return <FanGridContainer>{getFansGrid()}</FanGridContainer>
}
