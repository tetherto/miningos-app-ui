import { FC } from 'react'

import { isBatchAction } from '../../../../app/utils/actionUtils'
import { getTimeDistance } from '../../../../app/utils/getTimeRange'
import useTimezone from '../../../../hooks/useTimezone'
import { ACTIONS_SIDEBAR_TYPES } from '../../ActionsSidebar.types'
import type { CardAction } from '../ActionCard'
import { ChangeContainer, ChangeContainerWrapper, TimeWrapper } from '../ActionCard.styles'

import ActionCardHeaderButtons from './ActionCardHeaderButtons'
import ActionCardHeaderText from './ActionCardHeaderText'
import { BatchActionCardHeader } from './BatchActionCardHeader'

interface ConfirmationAction {
  action: CardAction
  actionFn: () => void
}

interface ActionCardHeaderProps {
  type?: string
  cardAction: CardAction
  setIsOpen?: (isOpen: boolean) => void
  setConfirmationAction?: (action: ConfirmationAction) => void
  onActionCancel?: (id: string) => void
  areRejectApproveAvailable?: boolean
  onConfirmAction?: (action: CardAction, actionFn: () => void) => void
}

const ActionCardHeader: FC<ActionCardHeaderProps> = ({
  type,
  cardAction,
  setIsOpen,
  setConfirmationAction,
  onActionCancel,
  areRejectApproveAvailable,
  onConfirmAction,
}) => {
  const { getFormattedDate, timezone } = useTimezone()

  const handleConfirmationAction =
    onConfirmAction ||
    ((action: CardAction, actionFn: () => void) => {
      setConfirmationAction?.({ action, actionFn })
      setIsOpen?.(true)
    })

  const PENDING_SUBMISSION_TYPE = type === ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION
  const PENDING_APPROVAL_TYPE = type === ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL

  const cardActionId = !PENDING_SUBMISSION_TYPE ? `#${cardAction?.id}` : undefined
  const cardActionVotePos =
    !PENDING_SUBMISSION_TYPE && !PENDING_APPROVAL_TYPE ? cardAction?.votesPos : undefined
  const cardActionTs = !PENDING_SUBMISSION_TYPE
    ? getTimeDistance(cardAction?.id, getFormattedDate, timezone)
    : undefined

  return (
    <>
      {isBatchAction(cardAction.action) ? (
        <BatchActionCardHeader
          type={type}
          cardAction={cardAction}
          onConfirmAction={handleConfirmationAction}
          onActionCancel={onActionCancel}
          areRejectApproveAvailable={areRejectApproveAvailable}
          cardActionVotePos={cardActionVotePos}
          cardActionId={cardActionId}
          cardActionTs={cardActionTs}
        />
      ) : (
        <>
          <ChangeContainer>
            <ChangeContainerWrapper>
              {cardActionVotePos && <p>{cardActionVotePos}</p>}
              <ActionCardHeaderText cardAction={cardAction} />
              <TimeWrapper>
                <p>
                  {cardActionId} - {cardActionTs}
                </p>
              </TimeWrapper>
            </ChangeContainerWrapper>
          </ChangeContainer>
          <ActionCardHeaderButtons
            type={type}
            cardAction={cardAction}
            onActionCancel={onActionCancel}
            areRejectApproveAvailable={areRejectApproveAvailable}
          />
        </>
      )}
    </>
  )
}

export default ActionCardHeader
