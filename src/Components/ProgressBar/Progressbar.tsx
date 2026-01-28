import Tooltip from 'antd/es/tooltip'
import _isNil from 'lodash/isNil'
import _isNull from 'lodash/isNull'
import _isNumber from 'lodash/isNumber'
import _some from 'lodash/some'
import { FC, ReactNode } from 'react'

import { formatNumber } from '../../app/utils/format'
import { COLOR } from '../../constants/colors'

import {
  ProgressBarContainer,
  FilledPart,
  ThresholdLine,
  ThresholdValueText,
} from './Progressbar.styles'

type NumericLike = string | number

interface ProgressBarProps {
  isVertical?: boolean
  currentValue?: NumericLike
  thresholdValue?: NumericLike
  thresholdTooltip?: ReactNode
  maxValue?: NumericLike
  formatter?: (val: number) => string
  noColorChange?: boolean
}

const ProgressBar: FC<ProgressBarProps> = ({
  isVertical = false,
  currentValue = 0,
  thresholdValue,
  thresholdTooltip = null,
  maxValue = 0,
  formatter = null,
  noColorChange = false,
}) => {
  const max = !_isNumber(maxValue) ? 0 : Number(maxValue)
  const value = !_isNumber(currentValue) ? 0 : Number(currentValue)
  const threshold = !_isNumber(thresholdValue) ? null : Number(thresholdValue)

  const missingValues = _some([value, max], (val) => _isNil(val) || isNaN(val) || val < 0)

  if (missingValues) {
    return null
  }

  const getFillPercentage = () => {
    const ratio = value / max
    if (ratio > 1) {
      return 100
    }

    return ratio * 100
  }

  const fillPercentage = getFillPercentage()
  const thresholdPercentage = !_isNull(threshold) ? (threshold / max) * 100 : 0
  const isShortThreshold = String(thresholdValue)?.length <= 2

  return (
    <ProgressBarContainer $isVertical={isVertical}>
      <FilledPart
        $isVertical={isVertical}
        $fillPercentage={fillPercentage}
        $isBelowTreeshold={noColorChange || _isNil(threshold) || value <= threshold}
      />
      {!_isNil(threshold) && (
        <>
          <ThresholdLine
            $isVertical={isVertical}
            $thresholdValue={thresholdPercentage}
            color={value > threshold ? COLOR.WHITE : COLOR.RED}
          />
          <Tooltip title={thresholdTooltip}>
            <ThresholdValueText
              $isVertical={isVertical}
              $isShort={isShortThreshold}
              $thresholdValue={thresholdPercentage}
            >
              {formatter
                ? formatter(!_isNull(threshold) ? threshold : 0)
                : formatNumber(!_isNull(threshold) ? threshold : 0)}
            </ThresholdValueText>
          </Tooltip>
        </>
      )}
    </ProgressBarContainer>
  )
}

export default ProgressBar
