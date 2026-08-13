import _map from 'lodash/map'
import _reject from 'lodash/reject'

import { PrimaryText, Row, SecondaryText } from './LineChartCard.styles'

const ITEM_DEFAULT_VALUE = ''

const MinMaxAvg = ({
  min = ITEM_DEFAULT_VALUE,
  max = ITEM_DEFAULT_VALUE,
  avg = ITEM_DEFAULT_VALUE,
}) => {
  const rows = _reject(
    [
      {
        label: 'Min',
        value: min,
      },
      {
        label: 'Max',
        value: max,
      },
      {
        label: 'Avg',
        value: avg,
      },
    ],
    { value: ITEM_DEFAULT_VALUE },
  )

  return (
    <>
      {_map(rows, (item: { label: string; value: string | number }) => (
        <Row key={item.label}>
          <PrimaryText>{item.label}</PrimaryText>
          <SecondaryText>{avg === '-' ? '-' : item.value}</SecondaryText>
        </Row>
      ))}
    </>
  )
}

export default MinMaxAvg
