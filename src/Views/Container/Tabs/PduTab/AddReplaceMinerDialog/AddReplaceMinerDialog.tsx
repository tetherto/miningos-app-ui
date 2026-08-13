import { StyledAddReplaceMinerModal } from './AddReplaceMinerDialog.styles'
import AddReplaceMinerDialogContent from './AddReplaceMinerDialogContent'
import { getTitle } from './helper'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface AddReplaceMinerDialogProps {
  open: boolean
  onClose: () => void
  selectedSocketToReplace?: UnknownRecord
  selectedEditSocket?: UnknownRecord
  currentDialogFlow?: string
  isDirectToMaintenanceMode?: boolean
  minersType?: string
  isContainerEmpty?: boolean
}

const AddReplaceMinerDialog = ({
  open,
  onClose,
  selectedSocketToReplace,
  selectedEditSocket,
  currentDialogFlow,
  isDirectToMaintenanceMode = false,
  minersType,
  isContainerEmpty = false,
}: AddReplaceMinerDialogProps) => (
  <StyledAddReplaceMinerModal
    title={getTitle({
      selectedSocketToReplace,
      selectedEditSocket,
      currentDialogFlow,
      isDirectToMaintenanceMode,
    })}
    open={open}
    footer={false}
    onCancel={onClose}
    destroyOnHidden
  >
    <AddReplaceMinerDialogContent
      onCancel={onClose}
      selectedEditSocket={selectedEditSocket}
      currentDialogFlow={currentDialogFlow}
      isContainerEmpty={isContainerEmpty}
      isDirectToMaintenanceMode={isDirectToMaintenanceMode}
      minersType={minersType}
    />
  </StyledAddReplaceMinerModal>
)

export default AddReplaceMinerDialog
