import Tooltip from 'antd/es/tooltip'

import { getLegendLabelText, getTooltipText } from '@/app/utils/deviceUtils'
import {
  SocketLegendInner,
  SocketLegendOuter,
  SocketLegendContainer,
  SocketLegendName,
} from '@/Components/Container/Socket/Socket.styles'

type SocketStatus =
  | 'error'
  | 'maintenance'
  | 'normal'
  | 'sleep'
  | 'low'
  | 'high'
  | 'mining'
  | 'offline'
  | 'sleeping'
  | 'alert'
  | 'errorMining'
  | 'disconnected'
  | 'connecting'

interface SocketLegendComponentProps {
  status: SocketStatus
  enabled?: boolean
  borderOnly?: boolean
}

export const SocketLegendComponent = ({
  status,
  enabled = false,
  borderOnly = false,
}: SocketLegendComponentProps) => (
  <SocketLegendContainer>
    <Tooltip title={getTooltipText(status)}>
      <SocketLegendOuter $status={status} $enabled={enabled} $borderOnly={borderOnly}>
        <SocketLegendInner $status={status} $enabled={enabled} $borderOnly={borderOnly} />
      </SocketLegendOuter>
      <SocketLegendName>{getLegendLabelText(status, enabled)}</SocketLegendName>
    </Tooltip>
  </SocketLegendContainer>
)
