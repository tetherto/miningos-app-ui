import {
  EntityHeaderId,
  EntityHeaderLeft,
  EntityHeaderName,
  EntityHeaderStatus,
  EntityHeaderWrapper,
} from './EntityHeader.styles'

import { hexToOpacity } from '@/Components/LineChartCard/utils'

type EntityHeaderProps = {
  id: string
  name: string
  status?: string
  statusColor?: string
}

const EntityHeader = ({ id, name, status, statusColor }: EntityHeaderProps) => (
  <EntityHeaderWrapper>
    <EntityHeaderLeft>
      <EntityHeaderId>{id}</EntityHeaderId>
      <EntityHeaderName>{name}</EntityHeaderName>
    </EntityHeaderLeft>
    {status && (
      <EntityHeaderStatus $color={statusColor || ''} $bgColor={hexToOpacity(statusColor || '', 0.15)}>
        {status}
      </EntityHeaderStatus>
    )}
  </EntityHeaderWrapper>
)

export default EntityHeader
