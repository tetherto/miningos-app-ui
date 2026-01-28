import _map from 'lodash/map'
import PropTypes from 'prop-types'

import { LegendContainer, LegendItem, LegendColorBox, LegendLabel } from './Legend.style'

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
}) => {
  const handleClick = (datasetIndex) => {
    if (onToggleDataset) {
      onToggleDataset(datasetIndex)
    }
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

Legend.propTypes = {
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      borderColor: PropTypes.string,
      backgroundColor: PropTypes.string,
      _legendColor: PropTypes.string,
    }),
  ).isRequired,
  hiddenDatasets: PropTypes.arrayOf(PropTypes.number),
  onToggleDataset: PropTypes.func,
  usePointStyle: PropTypes.bool,
  forceRow: PropTypes.bool,
}

export default Legend
