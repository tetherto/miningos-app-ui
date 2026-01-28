import Col from 'antd/es/col'
import Row from 'antd/es/row'
import { FC, ReactNode } from 'react'

import { ColIconContainer } from '../MinerCard/MinerCard.styles'

interface IconRowProps {
  icon: ReactNode
  text: ReactNode
}

const IconRow: FC<IconRowProps> = ({ icon, text }) => (
  <Row>
    <ColIconContainer>{icon}</ColIconContainer>
    <Col>{text}</Col>
  </Row>
)

export default IconRow
