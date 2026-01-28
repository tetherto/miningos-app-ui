import Switch from 'antd/es/switch'
import { FC } from 'react'

import { BasicSwitchContainer } from './UnitControlBox.styles'

interface BasicSwitchProps {
  leftLabel?: unknown
  rightLabel?: unknown
  checked?: unknown
}

const BasicSwitch: FC<BasicSwitchProps> = ({ leftLabel, rightLabel, checked }) => (
  <BasicSwitchContainer>
    {leftLabel !== null ? String(leftLabel) : ''} <Switch checked={checked as boolean} disabled />{' '}
    {rightLabel !== null ? String(rightLabel) : ''}
  </BasicSwitchContainer>
)

export { BasicSwitch }
