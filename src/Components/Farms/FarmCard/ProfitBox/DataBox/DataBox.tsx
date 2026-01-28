import { FC } from 'react'

import { DataBoxContainer, Label, Value } from './DataBox.styles'

interface DataBoxProps {
  label: string
  value: string | number
}

const DataBox: FC<DataBoxProps> = ({ label, value }) => (
  <DataBoxContainer>
    <Label>{label}</Label>
    <Value>{value}</Value>
  </DataBoxContainer>
)

export { DataBox }
