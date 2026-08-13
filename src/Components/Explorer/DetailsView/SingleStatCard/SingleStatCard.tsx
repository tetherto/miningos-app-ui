import Tooltip from 'antd/es/tooltip'
import _isNil from 'lodash/isNil'
import _size from 'lodash/size'
import { FC, Fragment } from 'react'

import {
  SingleStatCardName,
  SingleStatCardRoot,
  SingleStatCardSecondaryText,
  SingleStatCardSubtitle,
  SingleStatCardValue,
} from './SingleStatCards.styles'

import { formatValueUnit } from '@/app/utils/format'

const LONG_VALUE_THRESHOLD = 6 // chars

export interface SingleStatCardProps {
  name?: string
  subtitle?: string
  value?: number | string | null
  unit?: string
  color?: string
  flash?: boolean
  superflash?: boolean
  tooltipText?: string
  variant?: 'primary' | 'secondary' | 'tertiary'
  row?: boolean
}

const SingleStatCard: FC<SingleStatCardProps> = ({
  name,
  subtitle = '',
  value = null,
  unit = '',
  color = 'inherit',
  flash = false,
  superflash = false,
  tooltipText = '',
  variant = 'primary',
  row = false,
}) => {
  const valueFormatted = unit && value !== null ? formatValueUnit(value, unit) : value

  const TextRoot = variant === 'primary' ? Fragment : SingleStatCardSecondaryText

  const commonStyledProps = {
    $secondary: variant === 'secondary',
    $tertiary: variant === 'tertiary',
  }

  const root = (
    <SingleStatCardRoot
      $noMargin
      $noBorder
      $color={color}
      $flash={flash}
      $superflash={superflash}
      {...commonStyledProps}
      $row={row}
    >
      <TextRoot>
        <SingleStatCardName {...commonStyledProps}>{name}</SingleStatCardName>
        {subtitle && (
          <SingleStatCardSubtitle {...commonStyledProps}>{subtitle}</SingleStatCardSubtitle>
        )}
      </TextRoot>
      <SingleStatCardValue
        $longvalue={_size(String(value || '')) > LONG_VALUE_THRESHOLD}
        {...commonStyledProps}
      >
        {valueFormatted}
      </SingleStatCardValue>
    </SingleStatCardRoot>
  )

  if (_isNil(value)) {
    return root
  }

  return (
    <Tooltip title={`${tooltipText || name}${subtitle ? ` (${subtitle})` : ''}: ${valueFormatted}`}>
      {root}
    </Tooltip>
  )
}

export default SingleStatCard
