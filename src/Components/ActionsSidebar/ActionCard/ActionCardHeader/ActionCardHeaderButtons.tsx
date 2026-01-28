import { QuestionCircleOutlined } from '@ant-design/icons'
import { get as _get, head as _head } from 'lodash'
import { type MouseEvent, FC } from 'react'
import { useDispatch } from 'react-redux'

import { useCancelActionsMutation } from '../../../../app/services/api'
import { actionsSlice } from '../../../../app/slices/actionsSlice'
import { getErrorMessage, type ActionData } from '../../../../app/utils/actionUtils'
import { notifyError, notifyInfo } from '../../../../app/utils/NotificationService'
import { Spinner } from '../../../../Components/Spinner/Spinner'
import { ACTION_STATUS_TYPES, ACTION_TYPES } from '../../../../constants/actions'
import { useActionsContext } from '../../../../contexts/ActionsContext'
import { useProcessActions } from '../../../../hooks/useProcessActions'
import { useSubmitActions } from '../../../../hooks/useSubmitActions'
import { DangerActionButton } from '../../../DangerActionButton/DangerActionButton'
import { ACTIONS_SIDEBAR_TYPES } from '../../ActionsSidebar.types'
import type { CardAction } from '../ActionCard'
import { ActionHeaderButtonsContainer, PrimaryButton, SecondaryButton } from '../ActionCard.styles'

import { regroupActions } from './ActionCardHeaderButtons.util'
import type { SetupPoolsAction } from './ActionCardHeaderButtons.util'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

const { removePendingSubmissionAction } = actionsSlice.actions

interface ActionCardHeaderButtonsProps {
  type?: string
  cardAction: CardAction
  onActionCancel?: (id: string) => void
  areRejectApproveAvailable?: boolean
}

const ActionCardHeaderButtons: FC<ActionCardHeaderButtonsProps> = ({
  type,
  cardAction,
  onActionCancel,
  areRejectApproveAvailable,
}) => {
  const dispatch = useDispatch()
  const { myActions } = useActionsContext()
  const { action, isLoading } = cardAction

  const [cancelActions, { isLoading: isCancellingActions }] = useCancelActionsMutation()

  // Convert CardAction to SetupPoolsAction for regroupActions
  const pendingSubmission: SetupPoolsAction = {
    ...cardAction,
    id: cardAction.id,
    type: cardAction.action,
    status: cardAction.status || 'pending',
    action: cardAction.action,
    tags: cardAction.tags,
    deviceId: cardAction.deviceId as string | undefined,
    deviceIds: cardAction.deviceIds as string[] | undefined,
    targets: cardAction.targets,
    createdAt: cardAction.createdAt as number | undefined,
    create: cardAction.create as SetupPoolsAction['create'],
  }
  const actions = regroupActions({ myActions, pendingSubmissions: [pendingSubmission] })
  const { submitActions, isLoading: isSubmittingActions } = useSubmitActions({
    actions: actions as unknown as Array<{
      id: string
      type: string
      status: string
      remove?: string
      create?: unknown
      [key: string]: unknown
    }>,
  })
  const { processActions, isLoading: isProcessingActions } = useProcessActions({
    actionIDs: [cardAction.id],
  })

  const isActionLoading = isSubmittingActions || isProcessingActions || isCancellingActions
  const isTypePendingApproval = type === ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL
  const isCardActionStatusPending = cardAction?.status === ACTION_STATUS_TYPES.VOTING

  const stopPropagation = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const onSubmit = (event: MouseEvent<HTMLElement>) => {
    stopPropagation(event)
    submitActions()
  }

  const onApprove = (event: MouseEvent<HTMLElement>) => {
    stopPropagation(event)
    processActions(true)
  }

  const onReject = (event: MouseEvent<HTMLElement>) => {
    stopPropagation(event)
    processActions(false)
  }

  const onCancel = async (event: MouseEvent<HTMLElement>) => {
    stopPropagation(event)
    onActionCancel?.(cardAction.id)

    try {
      const result = await cancelActions({ ids: [cardAction.id], type: 'voting' }).unwrap()
      const headOfData = (_head(result as unknown[]) as UnknownRecord) || {}
      const resultArray = (_get(headOfData, ['res']) as Array<{ success?: boolean }>) || []
      const resultItem = _head(resultArray) || {}
      const { success } = resultItem

      if (success === true) {
        notifyInfo('Cancelled Action', 'Action was cancelled successfully')
      } else {
        notifyError('Error occurred while cancelling', 'Failed to cancel the action')
      }
    } catch (error) {
      notifyError(
        'Error occurred while cancelling',
        getErrorMessage(
          cardAction as unknown as ActionData | ActionData[],
          error as { data?: { message?: string }; [key: string]: unknown } | undefined,
        ) || 'Unknown error',
      )
    }
  }

  const onDiscard = (event: MouseEvent<HTMLElement>) => {
    stopPropagation(event)
    dispatch(removePendingSubmissionAction({ id: Number(cardAction.id) }))
    notifyInfo('Discarded Action', 'Action was discarded successfully')
  }

  if (isLoading) return <Spinner />

  if (type === ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION) {
    return (
      <ActionHeaderButtonsContainer>
        <SecondaryButton size="large" onClick={onDiscard}>
          Discard
        </SecondaryButton>
        <PrimaryButton size="large" onClick={onSubmit} disabled={isSubmittingActions}>
          Submit
        </PrimaryButton>
      </ActionHeaderButtonsContainer>
    )
  }
  if (isTypePendingApproval && isCardActionStatusPending) {
    return (
      <ActionHeaderButtonsContainer>
        <SecondaryButton
          size="large"
          onClick={onCancel}
          disabled={isCancellingActions || cardAction.cancelled}
        >
          Cancel Request
        </SecondaryButton>
      </ActionHeaderButtonsContainer>
    )
  }
  if (type === ACTIONS_SIDEBAR_TYPES.REQUESTED && areRejectApproveAvailable) {
    return (
      <ActionHeaderButtonsContainer>
        <SecondaryButton size="large" onClick={onReject} disabled={isActionLoading}>
          Reject
        </SecondaryButton>
        {action === ACTION_TYPES.SETUP_POOLS ? (
          <DangerActionButton
            confirmation={{
              title: 'Setup Pools',
              description:
                'Please ensure cooling system is ON before turning ON sockets and miners',
              icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
              onConfirm: () => onApprove({} as MouseEvent<HTMLElement>),
              onCancel: () => {},
            }}
            disabled={isActionLoading}
            label="Approve"
            onClick={() => {}}
          />
        ) : (
          <PrimaryButton size="large" onClick={onApprove} disabled={isActionLoading}>
            Approve
          </PrimaryButton>
        )}
      </ActionHeaderButtonsContainer>
    )
  }

  return null
}

export default ActionCardHeaderButtons
