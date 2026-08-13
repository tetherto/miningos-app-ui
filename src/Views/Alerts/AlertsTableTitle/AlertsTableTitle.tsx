import Col from 'antd/es/col'
import Row from 'antd/es/row'
import React from 'react'

import { TableTitleText } from '../Alerts.styles'

interface AlertsTableTitleProps {
  title: React.ReactNode
  subtitle: React.ReactNode
}

export const AlertsTableTitle = ({ title, subtitle }: AlertsTableTitleProps) => (
  <Row gutter={[0, 10]}>
    <Col span={24}>
      <TableTitleText>{title}</TableTitleText>
    </Col>
    <Col span={24}>{subtitle}</Col>
  </Row>
)
