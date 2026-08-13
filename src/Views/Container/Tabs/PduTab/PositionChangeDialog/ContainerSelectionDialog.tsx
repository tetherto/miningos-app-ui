import ContainerSelectionDialogContent from './ContainerSelectionDialogContent'
import { StyledPositionChangeModal } from './PositionChangeDialog.styles'

import type { Device } from '@/app/utils/deviceUtils/types'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

interface ContainerSelectionDialogProps {
  miner?: Device
  open: boolean
  onClose: () => void
}

const ContainerSelectionDialog = ({ onClose, open, miner }: ContainerSelectionDialogProps) => (
  <StyledPositionChangeModal
    title="Select Socket for the miner under maintenance"
    open={open}
    footer={false}
    onCancel={onClose}
  >
    <ContainerSelectionDialogContent
      selectedSocketToReplace={{
        miner,
        containerInfo: { container: MAINTENANCE_CONTAINER },
        pos: '',
        socket: '',
      }}
      onCancel={onClose}
    />
  </StyledPositionChangeModal>
)

export default ContainerSelectionDialog
