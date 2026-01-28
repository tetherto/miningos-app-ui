import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import { useEffect, useState } from 'react'

import { useDirectSubmitAction } from '../../hooks/useDirectSubmitAction'
import { useInventoryActionSubmitHandlers } from '../../hooks/useInventoryActionSubmitHandlers'
import { executeAction } from '../../Inventory.utils'

import {
  ConfirmationBody,
  ModalActions,
  ModalTitle,
  StyledModal,
} from './ConfirmDeleteMinerModal.styles'
import {
  createActionExecutor,
  createDeleteMinerBatchAction,
  mapSparePartsData,
  type Miner,
} from './ConfirmDeleteMinerModal.utils'

import { useGetListThingsQuery } from '@/app/services/api'
import { Spinner } from '@/Components/Spinner/Spinner'
import { useNotification } from '@/hooks/useNotification'

interface ConfirmDeleteMinerModalProps {
  isOpen: boolean
  miner: Miner
  onClose: () => void
  onDeleteStart?: (minerId: string) => void
  onDeleteError?: (minerId: string) => void
}

const ConfirmDeleteMinerModal = ({
  isOpen,
  miner,
  onClose,
  onDeleteStart,
  onDeleteError,
}: ConfirmDeleteMinerModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [deleteSpareParts, setDeleteSpareParts] = useState(false)
  const { notifyError } = useNotification()

  const {
    currentData: sparePartsData,
    isLoading: isSparePartsDataLoading,
    error: sparePartsError,
  } = useGetListThingsQuery(
    {
      query: JSON.stringify({
        'info.parentDeviceId': {
          $eq: miner.id,
        },
      }),
    },
    {
      refetchOnMountOrArgChange: true,
    },
  )

  useEffect(() => {
    if (sparePartsError) {
      notifyError('Unable to load data. Please try again', '')
      onClose()
    }
  }, [sparePartsError, notifyError, onClose])

  const mappedParts = mapSparePartsData(sparePartsData)

  const { submitAction } = useDirectSubmitAction()

  const { handleSuccess } = useInventoryActionSubmitHandlers({
    onSuccess: onClose,
    onInProgress: onClose,
  })

  const handleDeleteError = () => {
    if (onDeleteError) {
      onDeleteError(miner.id)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)

    // Optimistic update: remove miner from UI immediately
    if (onDeleteStart) {
      onDeleteStart(miner.id)
    }

    const batchedAction = createDeleteMinerBatchAction(miner, mappedParts, deleteSpareParts)
    const executor = createActionExecutor(submitAction)

    await executeAction({
      executor,
      action: batchedAction,
      onSuccess: handleSuccess,
      onError: handleDeleteError,
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
      {isSparePartsDataLoading ? (
        <Spinner />
      ) : (
        <>
          <ConfirmationBody>
            <p>
              Are you sure you want to delete the miner with code: {miner.raw?.code || miner.id}?
              This action is irreversible and all data associated to the device will be deleted.
            </p>
            <p>
              <Checkbox
                checked={deleteSpareParts}
                onChange={(e: unknown) =>
                  setDeleteSpareParts((e as { target: { checked: boolean } }).target.checked)
                }
              >
                Delete attached spare parts
              </Checkbox>
            </p>
          </ConfirmationBody>
          <ModalActions>
            <Button type="primary" onClick={handleConfirm} loading={isLoading}>
              Confirm
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </ModalActions>
        </>
      )}
    </StyledModal>
  )
}

export default ConfirmDeleteMinerModal
