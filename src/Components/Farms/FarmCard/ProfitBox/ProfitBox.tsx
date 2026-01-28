import { FC } from 'react'

import { DataBox } from './DataBox/DataBox'
import { ProfitArrow } from './Icons/ProfitArrow'
import { ProfitBoxContainer, Title, Value } from './ProfitBox.styles'

interface ProfitData {
  total: number | string
  day: number | string
  costs: number | string
  currency: string
}

interface ProfitBoxProps {
  data: ProfitData
}

const ProfitBox: FC<ProfitBoxProps> = ({ data: { total, day, costs, currency } }) => (
  <ProfitBoxContainer>
    <Title>
      Profit <ProfitArrow />
    </Title>
    <Value>
      {currency} {total}
    </Value>
    <DataBox label="Profit per day" value={`${currency} ${day}`} />
    <DataBox label="Electricity costs" value={`${currency} ${costs}`} />
  </ProfitBoxContainer>
)

export { ProfitBox }
