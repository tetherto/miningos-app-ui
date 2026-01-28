import _isNaN from 'lodash/isNaN'
import type { FC } from 'react'

import { DecreaseIcon } from './Icons/DecreaseIcon'
import { IncreaseIcon } from './Icons/IncreaseIcon'
import { ColoredText } from './PercentageChangeIndicator.styles'

interface PercentageChangeIndicatorProps {
  percentChange: number | string
  showIcon?: boolean
}

const PercentageChangeIndicator: FC<PercentageChangeIndicatorProps> = ({
  percentChange,
  showIcon = false,
}) => {
  const percentChangeNumber = Number(percentChange)
  const percentChangeFormatted = _isNaN(percentChangeNumber) ? 0 : percentChangeNumber
  const value = `(${percentChangeFormatted}%) `
  const isIncrease = percentChangeFormatted > 0
  const isDecrease = percentChangeFormatted < 0
  const Icon = isIncrease ? IncreaseIcon : DecreaseIcon

  return (
    <ColoredText $increase={isIncrease} $decrease={isDecrease}>
      {value}
      {showIcon && (isIncrease || isDecrease) && <Icon />}
    </ColoredText>
  )
}

export default PercentageChangeIndicator
