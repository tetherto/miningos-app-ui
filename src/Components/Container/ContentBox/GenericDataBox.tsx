import _map from 'lodash/map'
import { FC } from 'react'

import { TableBox } from './ContentBox.styles'
import { DataRow } from './DataRow'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface GenericDataBoxProps {
  data?: UnknownRecord
  fallbackValue?: unknown
}

const GenericDataBox: FC<GenericDataBoxProps> = ({ data, fallbackValue }) => (
  <TableBox>
    {_map(data, ({ label, value, units, isHighlighted, color, unit, flash }) => (
      <DataRow
        key={`${label}-${value}-${units}`}
        label={label}
        value={value ?? fallbackValue}
        units={units || unit}
        isHighlighted={isHighlighted}
        color={color}
        flash={flash}
      />
    ))}
  </TableBox>
)

export { GenericDataBox }
