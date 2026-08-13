import { SocketLegendComponent } from './SocketLegendComponent'

import { SOCKET_STATUSES } from '@/app/utils/statusUtils'
import { SocketLegendsListContainer } from '@/Components/Container/Socket/Socket.styles'

const SocketsLegendsList = () => (
  <SocketLegendsListContainer>
    {/* Row 1 */}
    <SocketLegendComponent status={SOCKET_STATUSES.OFFLINE} />
    <SocketLegendComponent status={SOCKET_STATUSES.OFFLINE} enabled />
    <SocketLegendComponent status={SOCKET_STATUSES.MINER_DISCONNECTED} enabled />
    <SocketLegendComponent status={SOCKET_STATUSES.MINER_DISCONNECTED} />
    <SocketLegendComponent status={SOCKET_STATUSES.ERROR} enabled />
    {/* Row 2 */}
    <SocketLegendComponent status={SOCKET_STATUSES.SLEEPING} enabled />
    <SocketLegendComponent status={SOCKET_STATUSES.NORMAL} enabled />
    <SocketLegendComponent status={SOCKET_STATUSES.LOW} enabled />
    <SocketLegendComponent status={SOCKET_STATUSES.HIGH} enabled />
    <SocketLegendComponent status={SOCKET_STATUSES.ERROR_MINING} enabled />
  </SocketLegendsListContainer>
)

export default SocketsLegendsList
