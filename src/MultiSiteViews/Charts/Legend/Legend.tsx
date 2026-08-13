import _map from 'lodash/map'

import { LegendColorBox, LegendContainer, LegendItem, LegendLabel } from './Legend.style'

export interface LegendDataset {
  label: string
  borderColor?: string
  backgroundColor?: string
  _legendColor?: string
}

export interface LegendProps {
  datasets: LegendDataset[]
  hiddenDatasets?: number[]
  onToggleDataset?: (datasetIndex: number) => void
  usePointStyle?: boolean
  forceRow?: boolean
}

/**
 * Custom HTML legend component for charts
 * Provides show/hide functionality for chart datasets
 */
const Legend = ({
  datasets,
  hiddenDatasets,
  onToggleDataset,
  usePointStyle = false,
  forceRow = false,
}: LegendProps) => {
  const handleClick = (datasetIndex: number) => {
    onToggleDataset?.(datasetIndex)
  }

  const hasMany = datasets.length > 3

  return (
    <LegendContainer $hasMany={hasMany} $forceRow={forceRow}>
      {_map(datasets, (dataset, index) => {
        const isHidden = hiddenDatasets?.includes(index)
        const color = dataset._legendColor || dataset.borderColor || dataset.backgroundColor

        return (
          <LegendItem
            key={`legend-${dataset.label}-${index}`}
            onClick={() => handleClick(index)}
            $isHidden={isHidden}
          >
            <LegendColorBox $color={color} $isCircle={usePointStyle} $isHidden={isHidden} />
            <LegendLabel $isHidden={isHidden}>{dataset.label}</LegendLabel>
          </LegendItem>
        )
      })}
    </LegendContainer>
  )
}

export default Legend
