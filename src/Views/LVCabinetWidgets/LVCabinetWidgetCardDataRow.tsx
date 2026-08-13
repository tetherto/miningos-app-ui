import Col from 'antd/es/col'
import Row from 'antd/es/row'
import _map from 'lodash/map'

import {
  LVWidgetCardDataRow,
  WidgetCardDataRowUnitText,
  WidgetCardDataRowValueText,
} from './LVCabinetWidgets.styles'
import type { DataRowValue } from './LVCabinetWidgets.types'

interface LVCabinetWidgetCardDataRowProps {
  title: string
  values: DataRowValue[]
}

const LVCabinetWidgetCardDataRow = ({ title, values }: LVCabinetWidgetCardDataRowProps) => (
  <LVWidgetCardDataRow>
    <Row>
      <Col>{title}</Col>
    </Row>
    {_map(values, ({ title, value, color, unit }, index) => (
      <Row justify="space-between" key={index}>
        <Col>{title}</Col>
        <Col>
          <WidgetCardDataRowValueText $color={color || ''}>{value}</WidgetCardDataRowValueText>{' '}
          <WidgetCardDataRowUnitText>{unit}</WidgetCardDataRowUnitText>
        </Col>
      </Row>
    ))}
  </LVWidgetCardDataRow>
)

export { LVCabinetWidgetCardDataRow }
