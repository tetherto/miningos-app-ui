import _map from 'lodash/map'
import _noop from 'lodash/noop'
import type { FC } from 'react'

import {
  LegendColor,
  LegendContainer,
  LegendLabelText,
  LegendLabelsRow,
} from './LineChartCard.styles'

interface Dataset {
  label?: string
  borderColor?: string
  [key: string]: unknown
}

interface ChartData {
  datasets?: Dataset[]
  [key: string]: unknown
}

interface LegendLabelsProps {
  data?: ChartData
  hidden?: Record<string, boolean>
  onClick?: (label: string, index: number) => void
}

const LegendLabels: FC<LegendLabelsProps> = ({ data = {}, hidden = {}, onClick = _noop }) => {
  const { datasets = [] } = data

  return (
    <LegendLabelsRow>
      {_map(datasets, (dataset: Dataset, index: number) => {
        const datasetLabel = dataset.label || ''

        return (
          <LegendContainer
            key={`${datasetLabel} ${index}`}
            $hidden={hidden[datasetLabel]}
            onClick={() => onClick(datasetLabel, index)}
          >
            <LegendColor color={dataset.borderColor || ''} />
            <LegendLabelText>{datasetLabel}</LegendLabelText>
          </LegendContainer>
        )
      })}
    </LegendLabelsRow>
  )
}

export default LegendLabels
