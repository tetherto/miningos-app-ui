import AddReplaceMinerDialogContent from '../AddReplaceMinerDialog/AddReplaceMinerDialogContent'

import ConfirmChangePositionDialogContent from './ConfirmChangePositionDialogContent'
import ContainerSelectionDialogContent from './ContainerSelectionDialogContent'
import DefaultPositionChangeDialogContent from './DefaultPositionChangeDialogContent'
import MaintenanceDialogContent from './MaintenanceDialogContent'
import RemoveMinerDialogContent from './RemoveMinerDialogContent'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'

interface PositionChangeDialogContentProps {
  currentDialogFlow?: string
  setCurrentDialogFlow?: (flow: string) => void
  selectedSocketToReplace?: UnknownRecord
  selectedEditSocket?: UnknownRecord
  onChangePositionClicked?: () => void
  onPositionChangedSuccess?: () => void
  onCancel?: () => void
  isContainerEmpty?: boolean
}

const PositionChangeDialogContent = ({
  currentDialogFlow,
  setCurrentDialogFlow,
  selectedSocketToReplace,
  selectedEditSocket,
  onChangePositionClicked,
  onCancel,
  isContainerEmpty,
  onPositionChangedSuccess,
}: PositionChangeDialogContentProps) => {
  switch (currentDialogFlow) {
    case POSITION_CHANGE_DIALOG_FLOWS.CONFIRM_CHANGE_POSITION:
      return (
        <ConfirmChangePositionDialogContent
          selectedSocketToReplace={selectedSocketToReplace}
          selectedEditSocket={selectedEditSocket}
          onCancel={onCancel!}
          isContainerEmpty={isContainerEmpty!}
          onSave={onPositionChangedSuccess!}
        />
      )
    case POSITION_CHANGE_DIALOG_FLOWS.CONTAINER_SELECTION:
      return (
        <ContainerSelectionDialogContent
          selectedSocketToReplace={selectedSocketToReplace}
          onCancel={onCancel!}
        />
      )
    case POSITION_CHANGE_DIALOG_FLOWS.REPLACE_MINER:
      return (
        <AddReplaceMinerDialogContent
          selectedEditSocket={selectedEditSocket}
          onCancel={onCancel}
          currentDialogFlow={currentDialogFlow}
          minersType={undefined}
        />
      )
    case POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO:
      return (
        <AddReplaceMinerDialogContent
          selectedEditSocket={selectedEditSocket}
          onCancel={onCancel}
          currentDialogFlow={currentDialogFlow}
          minersType={undefined}
        />
      )
    case POSITION_CHANGE_DIALOG_FLOWS.CONFIRM_REMOVE:
      return (
        <RemoveMinerDialogContent selectedEditSocket={selectedEditSocket} onCancel={onCancel!} />
      )
    case POSITION_CHANGE_DIALOG_FLOWS.MAINTENANCE:
      return (
        <MaintenanceDialogContent selectedEditSocket={selectedEditSocket} onCancel={onCancel} />
      )
    default:
      return (
        <DefaultPositionChangeDialogContent
          onChangePositionClicked={onChangePositionClicked}
          setCurrentDialogFlow={setCurrentDialogFlow!}
        />
      )
  }
}

export default PositionChangeDialogContent
