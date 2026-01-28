import { ArrowRightOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

import { getLocationLabel } from '../../../../app/utils/inventoryUtils'
import { getLocationColors, getStatusColors } from '../../../../app/utils/minerUtils'
import { MINER_STATUS_NAMES } from '../../Miners/Miners.constants'

import DeviceDetails from './DeviceDetails'
import {
  ArrowWrapper,
  LargeStatusField,
  LargeStatusFieldName,
  LargeStatusFields,
  LargeStatusFieldValue,
  LeftPanel,
  ModalBody,
  ModalTitle,
  MovementPreview,
  StatusSection,
  StyledModal,
} from './MovementDetailsModal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface MovementData {
  origin: string
  destination: string
  previousStatus: string
  newStatus: string
  comments: ReactNode
  raw: {
    thing: UnknownRecord
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface MovementDetailsModalProps {
  isOpen?: boolean
  onClose?: () => void
  movement?: MovementData
}

const MovementDetailsModal = ({ isOpen, onClose, movement }: MovementDetailsModalProps) => {
  if (!movement) {
    return null
  }

  const device = movement.raw.thing

  return (
    <StyledModal
      title={<ModalTitle>Historical Device Update</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={800}
    >
      <ModalBody>
        <StatusSection>
          <LeftPanel>
            <DeviceDetails device={device} />
          </LeftPanel>
        </StatusSection>
        <MovementPreview>
          <LargeStatusFields>
            <LargeStatusField>
              <LargeStatusFieldName>Location: </LargeStatusFieldName>
              <LargeStatusFieldValue {...getLocationColors(movement.origin)}>
                {getLocationLabel(movement.origin)}
              </LargeStatusFieldValue>
            </LargeStatusField>
            <LargeStatusField>
              <LargeStatusFieldName>Status: </LargeStatusFieldName>
              <LargeStatusFieldValue {...getStatusColors(movement.previousStatus)}>
                {(MINER_STATUS_NAMES as Record<string, string>)[movement.previousStatus] ??
                  movement.previousStatus}
              </LargeStatusFieldValue>
            </LargeStatusField>
          </LargeStatusFields>
          <ArrowWrapper>
            <ArrowRightOutlined height={72} width={72} />
          </ArrowWrapper>
          <LargeStatusFields>
            <LargeStatusField>
              <LargeStatusFieldName>Location: </LargeStatusFieldName>
              <LargeStatusFieldValue {...getLocationColors(movement.destination)}>
                {getLocationLabel(movement.destination)}
              </LargeStatusFieldValue>
            </LargeStatusField>
            <LargeStatusField>
              <LargeStatusFieldName>Status: </LargeStatusFieldName>
              <LargeStatusFieldValue {...getStatusColors(movement.newStatus)}>
                {(MINER_STATUS_NAMES as Record<string, string>)[movement.newStatus] ??
                  movement.newStatus}
              </LargeStatusFieldValue>
            </LargeStatusField>
          </LargeStatusFields>
        </MovementPreview>
        <div>{movement.comments}</div>
      </ModalBody>
    </StyledModal>
  )
}

export default MovementDetailsModal
