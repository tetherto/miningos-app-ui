import { FC } from 'react'

import type { CardAction } from '../ActionCard'
import { ChangeContainer, ChangeContainerWrapper, TimeWrapper } from '../ActionCard.styles'

import ActionCardHeaderButtons from './ActionCardHeaderButtons'
import BatchActionCardHeaderText from './BatchActionCardHeaderText'

interface BatchActionCardHeaderProps {
  type?: string
  cardAction: CardAction
  onActionCancel?: (id: string) => void
  areRejectApproveAvailable?: boolean
  cardActionVotePos?: number
  cardActionId?: string
  cardActionTs?: string
  onConfirmAction?: (action: CardAction, actionFn: () => void) => void
}

export const BatchActionCardHeader: FC<BatchActionCardHeaderProps> = ({
  type,
  cardAction,
  onActionCancel,
  areRejectApproveAvailable,
  cardActionVotePos,
  cardActionId,
  cardActionTs,
  onConfirmAction: _onConfirmAction, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => (
  <div>
    <ChangeContainer>
      <ChangeContainerWrapper>
        {cardActionVotePos && <p>{cardActionVotePos}</p>}
        <BatchActionCardHeaderText cardAction={cardAction} />
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
  </div>
)
