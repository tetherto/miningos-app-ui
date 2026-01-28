import { useDispatch } from 'react-redux'

import { DangerWarningText, ModalFooter } from './PositionChangeDialog.styles'

import { actionsSlice } from '@/app/slices/actionsSlice'
import { getDeviceContainerPosText } from '@/app/utils/containerUtils'
import type { Device } from '@/app/utils/deviceUtils/types'
import { notifyInfo } from '@/app/utils/NotificationService'
import { SecondaryButton } from '@/Components/ActionsSidebar/ActionCard/ActionCard.styles'
import { ACTION_TYPES } from '@/constants/actions'

const { setAddPendingSubmissionAction } = actionsSlice.actions

interface SelectedEditSocket {
  miner?: Device
  containerInfo?: {
    container?: string
  }
  pos?: string
  pdu?: string
  socket?: string
}

interface RemoveMinerDialogContentProps {
  selectedEditSocket?: SelectedEditSocket
  onCancel: () => void
}

const RemoveMinerDialogContent = ({
  selectedEditSocket,
  onCancel,
}: RemoveMinerDialogContentProps) => {
  const dispatch = useDispatch()

  const onRemoveMiner = () => {
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.FORGET_THINGS,
        params: [
          {
            rackId: selectedEditSocket?.miner?.rack,
            query: { id: selectedEditSocket?.miner?.id },
          },
        ],
        container: selectedEditSocket?.containerInfo?.container,
        pos: selectedEditSocket?.pos || `${selectedEditSocket?.pdu}_${selectedEditSocket?.socket}`,
        minerId: selectedEditSocket?.miner?.id,
      }),
    )
    notifyInfo(
      'Action added',
      `Remove miner ${selectedEditSocket?.miner?.id} from ${getDeviceContainerPosText(
        selectedEditSocket!,
      )}`,
    )
    onCancel()
  }
  return (
    <div>
      <DangerWarningText>
        Are you sure to permanently remove miner {selectedEditSocket?.miner?.id}?
      </DangerWarningText>
      <ModalFooter>
        <SecondaryButton onClick={onRemoveMiner}>Remove Miner</SecondaryButton>
      </ModalFooter>
    </div>
  )
}

export default RemoveMinerDialogContent
