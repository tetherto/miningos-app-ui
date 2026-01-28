import _isNil from 'lodash/isNil'
import { FC } from 'react'

import { DataRowContainer, Label, Units, Value } from './DataRow.styles'

interface DataRowProps {
  label?: string
  value?: unknown
  units?: unknown
  isHighlighted?: unknown
  color?: unknown
  flash?: unknown
}

const DataRow: FC<DataRowProps> = ({ label, value, units, isHighlighted, color, flash }) => {
  if (_isNil(value)) return null

  return (
    <DataRowContainer
      $isHighlighted={isHighlighted as boolean | undefined}
      $color={color as string | undefined}
      $flash={flash as boolean | undefined}
    >
      <Label>{label as string | undefined}</Label>
      <Value>{String(value ?? '')}</Value>
      <Units>{units as string | undefined}</Units>
    </DataRowContainer>
  )
}

export { DataRow }
