import _map from 'lodash/map'

import { HEATMAP_MODE } from '../../../../constants/temperatureConstants'

import { HeatMapLegendRoot, HeatStatusBar, Legend } from './HeatmapTab.styles'
import { getHeatmapRangeValue, getHeatmapUnit } from './HeatmapTab.utils'

interface HeatmapLegendProps {
  mode?: string
  ranges?: Record<string, { min?: number; max?: number }>
}

export const HeatmapLegend = ({ mode = '', ranges }: HeatmapLegendProps) => {
  const unit = getHeatmapUnit(mode, ranges)
  const values = [
    `${getHeatmapRangeValue(ranges, mode, 'min')} ${unit}`,
    `${getHeatmapRangeValue(ranges, mode, 'max')} ${unit}`,
  ]

  return (
    <HeatMapLegendRoot>
      <h4>{mode === HEATMAP_MODE.HASHRATE ? 'Hashrate' : 'Temperature'}</h4>
      <HeatStatusBar />
      <Legend>
        {_map(values, (value, index) => (
          <div key={index}>{value}</div>
        ))}
      </Legend>
    </HeatMapLegendRoot>
  )
}
