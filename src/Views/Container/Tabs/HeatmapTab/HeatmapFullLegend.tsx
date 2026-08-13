import _map from 'lodash/map'

import { HeatMapLegendRoot, HeatStatusBar, Legend } from './HeatmapTab.styles'
import { getHeatmapRangeValue, getHeatmapUnit } from './HeatmapTab.utils'

import { MINER_POWER_MODE, SOCKET_STATUSES } from '@/app/utils/statusUtils'
import { SocketLegendsListContainer } from '@/Components/Container/Socket/Socket.styles'
import { HEATMAP_MODE } from '@/constants/temperatureConstants'
import { SocketLegendComponent } from '@/Views/Container/Tabs/PduTab/SocketLegendComponent'

interface HeatmapFullLegendProps {
  mode?: string
  ranges?: Record<string, { min?: number; max?: number }>
}

/**
 * Combined legend for heatmap mode showing:
 * 1. Socket border states (off/on, with/without miner)
 * 2. Power mode borders (Sleep, Low, Normal, High)
 * 3. Temperature/Hashrate gradient (background colors)
 */
export const HeatmapFullLegend = ({ mode = '', ranges }: HeatmapFullLegendProps) => {
  const unit = getHeatmapUnit(mode, ranges)
  const values = [
    `${getHeatmapRangeValue(ranges, mode, 'min')} ${unit}`,
    `${getHeatmapRangeValue(ranges, mode, 'max')} ${unit}`,
  ]

  return (
    <>
      {/* Socket border states legend */}
      <SocketLegendsListContainer>
        {/* Socket states - borders indicate socket on/off */}
        <SocketLegendComponent status={SOCKET_STATUSES.MINER_DISCONNECTED} />
        <SocketLegendComponent status={SOCKET_STATUSES.MINER_DISCONNECTED} enabled />
        {/* Power mode borders */}
        <SocketLegendComponent status={MINER_POWER_MODE.SLEEP} borderOnly />
        <SocketLegendComponent status={MINER_POWER_MODE.LOW} borderOnly />
        <SocketLegendComponent status={MINER_POWER_MODE.NORMAL} borderOnly />
        <SocketLegendComponent status={MINER_POWER_MODE.HIGH} borderOnly />
      </SocketLegendsListContainer>

      {/* Temperature/Hashrate gradient legend */}
      <HeatMapLegendRoot>
        <h4>{mode === HEATMAP_MODE.HASHRATE ? 'Hashrate' : 'Temperature'}</h4>
        <HeatStatusBar />
        <Legend>
          {_map(values, (value, index) => (
            <div key={index}>{value}</div>
          ))}
        </Legend>
      </HeatMapLegendRoot>
    </>
  )
}
