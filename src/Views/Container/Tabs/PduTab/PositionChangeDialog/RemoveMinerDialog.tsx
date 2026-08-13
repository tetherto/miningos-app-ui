import { StyledPositionChangeModal } from './PositionChangeDialog.styles'
import RemoveMinerDialogContent from './RemoveMinerDialogContent'

import type { Device } from '@/app/utils/deviceUtils/types'

interface RemoveMinerDialogProps {
  headDevice?: Device
  isRemoveMinerFlow: boolean
  onCancel: () => void
}

const RemoveMinerDialog = ({
  headDevice = {} as Device,
  isRemoveMinerFlow,
  onCancel,
}: RemoveMinerDialogProps) => (
  <StyledPositionChangeModal
    title="Are you sure to permanently remove miner?"
    open={isRemoveMinerFlow}
    footer={false}
    onCancel={onCancel}
  >
    <RemoveMinerDialogContent
      selectedEditSocket={{
        containerInfo: headDevice?.info,
        miner: headDevice,
        pos: headDevice?.info?.pos,
      }}
      onCancel={onCancel}
    />
  </StyledPositionChangeModal>
)

export default RemoveMinerDialog
