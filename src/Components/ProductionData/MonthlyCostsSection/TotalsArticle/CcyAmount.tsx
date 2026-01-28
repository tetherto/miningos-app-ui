import { formatNumber } from '../../../../app/utils/format'
import { Label, Item, SmallText, Value } from '../MonthlyCostsSection.styles'

interface CcyAmountProps {
  value: number
  unit?: string
  meta?: string
}

export const CcyAmount = ({ value, unit, meta = '' }: CcyAmountProps) => (
  <Item>
    <Value>
      {formatNumber(value)}
      {!!unit && (
        <>
          {' '}
          <SmallText>{unit}</SmallText>
        </>
      )}
    </Value>
    {meta && <Label>{meta}</Label>}
  </Item>
)
