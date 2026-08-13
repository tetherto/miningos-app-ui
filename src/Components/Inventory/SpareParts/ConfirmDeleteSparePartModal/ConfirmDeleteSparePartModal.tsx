import Button from 'antd/es/button'
import { useState } from 'react'

import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'

import { ModalActions, ModalTitle, StyledModal } from './ConfirmDeleteSparePartModal.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ACTION_TYPES } from '@/constants/actions'

interface SparePart extends UnknownRecord {
  id: string
  code: string
  raw: {
    rack: string
    [key: string]: unknown
  }
}

interface ConfirmDeleteSparePartModalProps {
  isOpen?: boolean
  sparePart?: SparePart
  onClose?: () => void
}

const ConfirmDeleteSparePartModal = ({
  isOpen,
  sparePart,
  onClose,
}: ConfirmDeleteSparePartModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const { submitAction } = useDirectSubmitAction()

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  if (!sparePart) {
    return null
  }

  const handleConfirm = async () => {
    setIsLoading(true)

    const action = {
      type: 'voting',
      action: ACTION_TYPES.FORGET_THINGS,
      params: [
        {
          rackId: sparePart.raw.rack,
          query: { id: sparePart.id },
        },
      ],
      minerId: sparePart.id,
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
        Are you sure you want to delete the spare part with code: {sparePart.code}? This action is
        irreversible and all data associated to the device will be deleted.
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

export default ConfirmDeleteSparePartModal
