import _map from 'lodash/map'
import { FC } from 'react'

import { TankRow } from './TankRow'
import { TanksBoxRoot } from './TanksBox.styles'

interface Tank {
  cold_temp_c: number
  enabled: boolean
  color?: string
  flash?: boolean
  tooltip?: string
}

interface Pressure {
  value?: number
  flash?: boolean
  color?: string
}

interface WaterPump {
  enabled: boolean
}

export interface TanksBoxProps {
  data: {
    oil_pump: Tank[]
    water_pump: WaterPump[]
    pressure: Pressure[]
  }
}

const TanksBox: FC<TanksBoxProps> = ({ data }) =>
  data ? (
    <TanksBoxRoot>
      {_map(data.oil_pump, (pump, index) => (
        <TankRow
          key={`tank-${index}`}
          label={`Tank ${index + 1}`}
          temperature={pump.cold_temp_c}
          unit="°C"
          oilPumpEnabled={pump.enabled}
          waterPumpEnabled={data.water_pump[index].enabled}
          pressure={data.pressure[index]}
          color={pump.color || ''}
          flash={pump.flash}
          tooltip={pump.tooltip}
        />
      ))}
    </TanksBoxRoot>
  ) : null

export { TanksBox }
