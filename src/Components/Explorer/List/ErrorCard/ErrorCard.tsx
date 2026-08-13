import { FC } from 'react'

import { DangerDeviceCardColText, DeviceCardContainer } from '../ListView.styles'

interface ErrorCardProps {
  error: string
}

const ErrorCard: FC<ErrorCardProps> = ({ error }) => (
  <DeviceCardContainer>
    <DangerDeviceCardColText>{error}</DangerDeviceCardColText>
  </DeviceCardContainer>
)

export default ErrorCard
