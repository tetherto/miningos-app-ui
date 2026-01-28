import Row from 'antd/es/row'
import { FC } from 'react'

import { ActionButton, StatusLabel } from './DeviceActionButton.styles'

interface DeviceActionButtonProps {
  status?: string
  title?: string
  onClick?: () => void
  fault?: string
  unavailable?: boolean
}

const DeviceActionButton: FC<DeviceActionButtonProps> = ({
  status,
  title,
  onClick,
  fault,
  unavailable,
}) => (
  <ActionButton $status={status} onClick={onClick}>
    {title}
    <Row>
      {unavailable ? (
        <>Unavailable</>
      ) : (
        <>
          <StatusLabel $status={status}>{status}</StatusLabel>
          <StatusLabel $status={fault}>{fault}</StatusLabel>
        </>
      )}
    </Row>
  </ActionButton>
)

export default DeviceActionButton
