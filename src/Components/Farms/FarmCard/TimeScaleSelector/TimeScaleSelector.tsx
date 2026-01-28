import _map from 'lodash/map'

import { ScaleControl as ScaleControlIcon } from './Icons/ScaleControl'
import { TimeScales } from './TimeScaleSelector.config'
import { Scale, ScaleControl, TimeScaleSelectorContainer } from './TimeScaleSelector.styles'

interface TimeScaleSelectorProps {
  value?: string
}

const TimeScaleSelector = ({ value }: TimeScaleSelectorProps) => (
  <TimeScaleSelectorContainer>
    {_map(TimeScales, (scale: string) => (
      <Scale key={scale} $isActive={value === scale}>
        {scale}
      </Scale>
    ))}
    <ScaleControl>
      <ScaleControlIcon />
    </ScaleControl>
  </TimeScaleSelectorContainer>
)

export { TimeScaleSelector }
