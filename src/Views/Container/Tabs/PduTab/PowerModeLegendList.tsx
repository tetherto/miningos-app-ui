import { SocketLegendComponent } from './SocketLegendComponent'

import { MINER_POWER_MODE } from '@/app/utils/statusUtils'
import { SocketLegendsListContainer } from '@/Components/Container/Socket/Socket.styles'

export const PowerModeLegendList = () => (
  <SocketLegendsListContainer>
    <SocketLegendComponent status={MINER_POWER_MODE.SLEEP} borderOnly />
    <SocketLegendComponent status={MINER_POWER_MODE.LOW} borderOnly />
    <SocketLegendComponent status={MINER_POWER_MODE.NORMAL} borderOnly />
    <SocketLegendComponent status={MINER_POWER_MODE.HIGH} borderOnly />
  </SocketLegendsListContainer>
)
