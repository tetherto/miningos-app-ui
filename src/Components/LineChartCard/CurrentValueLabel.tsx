import _isNil from 'lodash/isNil'

import { formatNumber } from '../../app/utils/format'

import {
  CurrentValueLabelText,
  CurrentValueUnitText,
  CurrentValueLabelContainer,
} from './LineChartCard.styles'

const CurrentValueLabel = ({ value = 0, unit = '', decimals = 3 }) => {
  if (_isNil(value)) {
    return null
  }

  return (
    <CurrentValueLabelContainer>
      <CurrentValueLabelText>
        {formatNumber(value, {
          maximumSignificantDigits: undefined,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </CurrentValueLabelText>
      <CurrentValueUnitText>{unit}</CurrentValueUnitText>
    </CurrentValueLabelContainer>
  )
}

export default CurrentValueLabel
