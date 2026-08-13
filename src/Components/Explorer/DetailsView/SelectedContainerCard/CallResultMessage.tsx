import _isObject from 'lodash/isObject'
import { FC } from 'react'

import { isRackAction, isThingAction } from '../../../../app/utils/actionUtils'
import { FailMessage, SuccessMessage } from '../SelectedMinerCard/SelectedMinerCard.styles'

import type { CardAction } from '@/Components/ActionsSidebar/ActionCard/ActionCard'

interface CallResultMessageProps {
  call?: { result?: number | { success?: boolean }; error?: string; [key: string]: unknown }
  cardAction?: CardAction
}

export const CallResultMessage: FC<CallResultMessageProps> = ({ call, cardAction }) => {
  const action = cardAction?.action
  if (
    action &&
    (isThingAction(action) || isRackAction(action)) &&
    call?.result === 1 &&
    !call?.error
  ) {
    return <SuccessMessage>Success</SuccessMessage>
  }
  if (_isObject(call?.result) && call?.result?.success) {
    return <SuccessMessage>Success</SuccessMessage>
  }
  if (call?.error) return <FailMessage>{call.error}</FailMessage>
  return null
}
