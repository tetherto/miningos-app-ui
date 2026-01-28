import { formatValueUnit } from '../../app/utils/format'

import { Item, LabelText, Value, Boxed, NumericInputWrapper } from './FormulaItem.styles'

interface FormulaItemProps {
  value?: number
  description?: string
  isEditing?: boolean
  onChange?: (value: number | undefined) => void
  unit?: string
}

const FormulaItem = ({
  value = 0,
  description,
  isEditing = false,
  onChange,
  unit = 'USD',
}: FormulaItemProps) => (
  <Boxed>
    <Item>
      {isEditing ? (
        <NumericInputWrapper
          thousandSeparator=","
          decimalSeparator="."
          decimalScale={2}
          value={value}
          onValueChange={(values: { floatValue?: number }) => {
            onChange?.(values.floatValue)
          }}
        />
      ) : (
        <Value>
          {formatValueUnit(
            value,
            '',
            {
              maximumSignificantDigits: undefined,
            },
            '0',
          )}
        </Value>
      )}
      <LabelText>{`${description} ${unit ? `(${unit})` : null}`}</LabelText>
    </Item>
  </Boxed>
)

export default FormulaItem
