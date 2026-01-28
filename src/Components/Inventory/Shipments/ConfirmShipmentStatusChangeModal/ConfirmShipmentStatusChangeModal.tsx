import Button from 'antd/es/button'
import { useState } from 'react'

import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'
import { SHIPMENT_STATUS_NAMES } from '../Shipments.constants'

import { ModalActions, ModalTitle, StyledModal } from './ConfirmShipmentStatusChangeModal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ACTION_TYPES } from '@/constants/actions'

interface ConfirmShipmentStatusChangeModalProps {
  isOpen?: boolean
  rackId?: string
  status?: string
  shipment?: UnknownRecord
  onClose?: () => void
}

const ConfirmShipmentStatusChangeModal = ({
  isOpen,
  rackId,
  status,
  shipment,
  onClose,
}: ConfirmShipmentStatusChangeModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const { submitAction } = useDirectSubmitAction()

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const handleConfirm = async () => {
    if (!shipment) return

    setIsLoading(true)
    const params = [
      {
        id: shipment.id,
        rackId,
        info: {},
        status,
        boxes: shipment.boxes,
      },
    ]

    const action = {
      type: 'voting',
      action: ACTION_TYPES.UPDATE_THING,
      params,
      minerId: shipment.id,
    }

    await executeAction({
      executor: submitAction as (params: {
        action: unknown
      }) => Promise<{ error?: unknown; [key: string]: unknown }>,
      action,
      onSuccess: handleSuccess,
    })

    setIsLoading(false)
  }

  return (
    <StyledModal
      title={<ModalTitle>Confirm status change</ModalTitle>}
      open={isOpen}
      footer={false}
      onCancel={onClose}
      width={400}
    >
      <p>
        Are you sure you want to change the status of Shipment: {String(shipment?.id)} to{' '}
        {SHIPMENT_STATUS_NAMES[status as keyof typeof SHIPMENT_STATUS_NAMES]}
      </p>
      <ModalActions>
        <Button type="primary" onClick={handleConfirm} loading={isLoading}>
          Confirm
        </Button>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
      </ModalActions>
    </StyledModal>
  )
}

export default ConfirmShipmentStatusChangeModal
