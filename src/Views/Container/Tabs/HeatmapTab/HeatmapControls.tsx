import Button from 'antd/es/button'
import _map from 'lodash/map'

import { PrimaryButton } from '../../../../Components/ActionsSidebar/ActionCard/ActionCard.styles'
import { HEATMAP_MODE } from '../../../../constants/temperatureConstants'
import { ControlButtons } from '../PduTab/PduTab.styles'

interface HeatmapControlsProps {
  mode: string
  setMode: (mode: string) => void
}

export const HeatmapControls = ({ mode, setMode }: HeatmapControlsProps) => {
  const controlButtons = [
    { id: 1, label: 'Inlet Temp', value: HEATMAP_MODE.INLET },
    { id: 2, label: 'Hashboard Temp', value: HEATMAP_MODE.PCB },
    { id: 3, label: 'Chip Temp', value: HEATMAP_MODE.CHIP },
    { id: 4, label: 'Hashrate', value: HEATMAP_MODE.HASHRATE },
  ]

  return (
    <ControlButtons>
      {_map(controlButtons, (button) => {
        const Control = button.value === mode ? PrimaryButton : Button

        return (
          <Control
            key={button.id}
            size="middle"
            onTouchStart={() => setMode(button.value)}
            onClick={() => setMode(button.value)}
          >
            {button.label}
          </Control>
        )
      })}
    </ControlButtons>
  )
}
