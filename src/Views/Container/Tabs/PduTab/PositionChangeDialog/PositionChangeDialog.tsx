import { useEffect, useState } from 'react'

import { StyledPositionChangeModal } from './PositionChangeDialog.styles'
import PositionChangeDialogContent from './PositionChangeDialogContent'

import { getDeviceContainerPosText } from '@/app/utils/containerUtils'
import { getMinerShortCode } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { MAINTENANCE_CONTAINER } from '@/constants/containerConstants'
import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'

interface GetDialogTitleParams {
  container: string
  selectedEditSocket?: UnknownRecord
  shortCode: string
  currentDialogFlow: string
}

const getDialogTitle = ({
  container,
  selectedEditSocket,
  shortCode,
  currentDialogFlow,
}: GetDialogTitleParams) => {
  if (container === MAINTENANCE_CONTAINER) {
    return `Bring back miner from maintenance mode to socket ${getDeviceContainerPosText(
      selectedEditSocket!,
    )}`
  }

  switch (currentDialogFlow) {
    case POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO:
      return `Change info of miner ${shortCode}`
    case POSITION_CHANGE_DIALOG_FLOWS.MAINTENANCE:
      return 'Move miner to maintenance'
    default:
      return 'Change position of miner'
  }
}

interface PositionChangeDialogProps {
  open: boolean
  onClose: (currentDialogFlow: string, isDontReset?: boolean) => void
  selectedSocketToReplace?: UnknownRecord
  selectedEditSocket?: UnknownRecord
  onChangePositionClicked?: () => void
  onPositionChangedSuccess?: () => void
  isContainerEmpty?: boolean
  dialogFlow?: string
}

const PositionChangeDialog = ({
  open,
  onClose,
  selectedSocketToReplace,
  selectedEditSocket,
  onChangePositionClicked,
  onPositionChangedSuccess,
  isContainerEmpty,
  dialogFlow,
}: PositionChangeDialogProps) => {
  const container =
    (
      (selectedSocketToReplace as UnknownRecord | undefined)?.containerInfo as
        | UnknownRecord
        | undefined
    )?.container ||
    ((selectedEditSocket as UnknownRecord | undefined)?.containerInfo as UnknownRecord | undefined)
      ?.container ||
    ''
  const miner =
    (selectedEditSocket as UnknownRecord | undefined)?.miner ||
    (selectedSocketToReplace as UnknownRecord | undefined)?.miner ||
    {}
  const { code, tags } = miner as { code?: string; tags?: string[] }

  const shortCode = getMinerShortCode(code, tags || [])
  const [currentDialogFlow, setCurrentDialogFlow] = useState<string>(dialogFlow || '')

  useEffect(() => {
    setCurrentDialogFlow(dialogFlow || '')
  }, [dialogFlow])

  const onCancel = (isDontReset?: boolean) => {
    setCurrentDialogFlow('')
    onClose(currentDialogFlow, isDontReset)
  }

  useEffect(() => {
    if (selectedSocketToReplace && selectedEditSocket) {
      setCurrentDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.CONFIRM_CHANGE_POSITION)
    }
  }, [selectedSocketToReplace, selectedEditSocket])

  const title = getDialogTitle({
    container: (container as string) || '',
    selectedEditSocket,
    shortCode,
    currentDialogFlow,
  })

  return (
    <StyledPositionChangeModal title={title} open={open} footer={false} onCancel={() => onCancel()}>
      <PositionChangeDialogContent
        setCurrentDialogFlow={setCurrentDialogFlow}
        currentDialogFlow={currentDialogFlow}
        selectedSocketToReplace={selectedSocketToReplace}
        selectedEditSocket={selectedEditSocket}
        onChangePositionClicked={onChangePositionClicked}
        onPositionChangedSuccess={onPositionChangedSuccess}
        onCancel={onCancel}
        isContainerEmpty={isContainerEmpty}
      />
    </StyledPositionChangeModal>
  )
}

export default PositionChangeDialog
