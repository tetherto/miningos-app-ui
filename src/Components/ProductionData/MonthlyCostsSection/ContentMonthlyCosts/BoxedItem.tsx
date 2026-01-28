import { NumericFormat } from 'react-number-format'

import { formatValueUnit } from '../../../../app/utils/format'
import { Item, Label, Value, Boxed } from '../MonthlyCostsSection.styles'

interface BoxedItemProps {
  value?: number | null
  description: string
  isEditing?: boolean
  onChange?: (value: number | null) => void
}

const BoxedItem = ({ value, description, isEditing = false, onChange }: BoxedItemProps) => (
  <Boxed>
    <Item>
      {isEditing ? (
        <NumericFormat
          thousandSeparator=","
          decimalSeparator="."
          decimalScale={2}
          value={value ?? 0}
          onValueChange={(values: { floatValue?: number }) => {
            onChange?.(values.floatValue ?? null)
          }}
        />
      ) : (
        <Value>
          {formatValueUnit(value ?? 0, 'USD', {
            maximumSignificantDigits: undefined,
          })}
        </Value>
      )}
      <Label>{description}</Label>
    </Item>
  </Boxed>
)

export default BoxedItem
