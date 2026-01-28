import { FC } from 'react'

import { Label, Value, ValueBoxContainer } from './ValueBox.styles'

interface ValueBoxProps {
  label?: string
  value?: unknown
}

const ValueBox: FC<ValueBoxProps> = ({ label, value }) => (
  <ValueBoxContainer>
    <Label>{label}</Label>
    <Value>{value !== null ? String(value) : ''}</Value>
  </ValueBoxContainer>
)

export { ValueBox }
