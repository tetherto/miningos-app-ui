import { useDispatch } from 'react-redux'

import { DangerWarningText, ModalFooter } from './PositionChangeDialog.styles'
import { getPosHistory } from './PositionChangeDialog.utils'

import { actionsSlice } from '@/app/slices/actionsSlice'
import { getDeviceContainerPosText } from '@/app/utils/containerUtils'
import { getMinerShortCode } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { notifyInfo } from '@/app/utils/NotificationService'
import { WarningButton } from '@/Components/ActionsSidebar/ActionCard/ActionCard.styles'
import { ACTION_TYPES } from '@/constants/actions'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'

const { setAddPendingSubmissionAction } = actionsSlice.actions

interface SelectedEditSocket {
  miner?: Device
  containerInfo?: {
    container?: string
  }
}

interface MaintenanceDialogContentProps {
  selectedEditSocket?: SelectedEditSocket
  onCancel?: () => void
}

const MaintenanceDialogContent = ({
  selectedEditSocket,
  onCancel,
}: MaintenanceDialogContentProps) => {
  const dispatch = useDispatch()

  const onMaintainMiner = () => {
    dispatch(
      setAddPendingSubmissionAction({
        type: 'voting',
        action: ACTION_TYPES.UPDATE_THING,
        params: [
          {
            rackId: selectedEditSocket?.miner?.rack,
            id: selectedEditSocket?.miner?.id,
            code: selectedEditSocket?.miner?.code,
            info: {
              ...selectedEditSocket?.miner?.info,
              container: MAINTENANCE_CONTAINER,
              pos: '',
              subnet: '',
              posHistory: getPosHistory(selectedEditSocket! as UnknownRecord),
            },
          },
        ],
        minerId: selectedEditSocket?.miner?.id,
      }),
    )
    notifyInfo(
      'Action added',
      `Add miner to maintenance ${getDeviceContainerPosText(selectedEditSocket!)}`,
    )
    onCancel?.()
  }

  const shortCode = getMinerShortCode(
    selectedEditSocket?.miner?.code as string | undefined,
    (selectedEditSocket?.miner?.tags as string[] | undefined) ?? [],
  )

  const nameAndPosition = getDeviceContainerPosText({
    containerInfo: selectedEditSocket?.containerInfo,
    pos: selectedEditSocket?.miner?.info?.pos,
  })

  return (
    <div>
      <DangerWarningText>
        Are you sure to send miner {shortCode} from {nameAndPosition} to maintenance?
      </DangerWarningText>
      <ModalFooter>
        <WarningButton onClick={onMaintainMiner}>Add to Maintenance</WarningButton>
      </ModalFooter>
    </div>
  )
}

export default MaintenanceDialogContent
