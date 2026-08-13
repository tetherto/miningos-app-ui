import { FC } from 'react'

import { Content, Label, Status, StatusItemContainer } from './StatusItem.styles'

const StatusLabels = {
  normal: 'Normal',
  warning: 'Warning',
  fault: 'Fault',
  unavailable: 'Unavailable',
} as const

type StatusType = keyof typeof StatusLabels

interface StatusItemProps {
  label?: string
  status?: StatusType
}

const StatusItem: FC<StatusItemProps> = ({ label, status }) => (
  <StatusItemContainer>
    <Content>
      <Label>{label}</Label>
      <Status $status={status}>{status ? StatusLabels[status] : ''}</Status>
    </Content>
  </StatusItemContainer>
)

export { StatusItem }
