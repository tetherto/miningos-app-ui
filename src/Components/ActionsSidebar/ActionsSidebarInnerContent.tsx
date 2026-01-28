import Empty from 'antd/es/empty'
import {
  filter as _filter,
  find as _find,
  includes as _includes,
  isEmpty as _isEmpty,
  join as _join,
  lowerCase as _lowerCase,
  map as _map,
  omit as _omit,
  size as _size,
  split as _split,
} from 'lodash'
import { type ReactNode, useEffect, useState, FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCancelActionsMutation } from '../../app/services/api'
import { selectIsActionsSidebarPinned } from '../../app/slices/actionsSidebarSlice'
import { actionsSlice } from '../../app/slices/actionsSlice'
import { useActionsContext } from '../../contexts/ActionsContext'
import useDeviceResolution from '../../hooks/useDeviceResolution'
import { useNotification } from '../../hooks/useNotification'
import { useProcessActions } from '../../hooks/useProcessActions'
import { useSubmitActions } from '../../hooks/useSubmitActions'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'

import ActionCard from './ActionCard/ActionCard'
import type { CardAction } from './ActionCard/ActionCard'
import { PrimaryButton, SecondaryButton } from './ActionCard/ActionCard.styles'
import { CONFIRMATION_ACTIONS } from './ActionCard/ActionCardHeader/ActionCardHeader.const'
import type { SetupPoolsAction } from './ActionCard/ActionCardHeader/ActionCardHeaderButtons.util'
import { regroupActions } from './ActionCard/ActionCardHeader/ActionCardHeaderButtons.util'
import { ButtonWrapper, SidebarInnerContainer } from './ActionsSidebar.styles'
import { ACTIONS_SIDEBAR_TYPES } from './ActionsSidebar.types'
import { BoldAction } from './ActionsSidebarInnerContent.styles'

const { clearAllPendingSubmissions } = actionsSlice.actions

export interface ActionWithCardType extends CardAction {
  actionCardType: string
}

interface ConfirmationAction {
  action: string
  actionFn: () => void
}

interface ActionsSideBarInnerContentProps {
  actions?: ActionWithCardType[]
  isPinned?: boolean
  onPinToggled?: () => void
  getSideBarHeader?: (
    isModal: boolean,
    onPinToggled?: () => void,
    isPinned?: boolean,
    isMobile?: boolean,
  ) => ReactNode
}

export const ActionsSideBarInnerContent: FC<ActionsSideBarInnerContentProps> = ({
  actions,
  isPinned,
  onPinToggled,
  getSideBarHeader,
}) => {
  const { notifyInfo } = useNotification()
  const dispatch = useDispatch()

  const { isMobile } = useDeviceResolution()

  const { myActions, areRejectApproveAvailable, refetchActionsData } = useActionsContext()

  const isActionsSidebarPinned = useSelector(selectIsActionsSidebarPinned)

  const [isOpen, setIsOpen] = useState(false)
  const [internalActions, setInternalActions] = useState<ActionWithCardType[]>([])
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null)
  const [cancelActions, { isLoading: isCancellingActions }] = useCancelActionsMutation()

  const submittableActions = (() => {
    // Filter only PENDING_SUBMISSION actions first
    const pendingSubmissionActions = _filter(
      internalActions,
      ({ actionCardType }) => actionCardType === ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION,
    )

    // For non-setupPools actions, wrap them directly without regrouping
    // For setupPools actions, use regroupActions to handle overlapping tags
    const setupPoolsActions: SetupPoolsAction[] = []
    const otherActions: SetupPoolsAction[] = []

    pendingSubmissionActions.forEach((action: ActionWithCardType) => {
      const convertedAction = {
        ...(action as Record<string, unknown>),
        id: action.id,
        type: action.action,
        status: action.status || 'pending',
        action: action.action,
        deviceId: action.deviceId,
        deviceIds: action.deviceIds,
        createdAt: action.createdAt,
        updatedAt: action.updatedAt,
        success: action.success,
        message: action.message,
        remove: action.remove,
        tags: action.tags,
        create: action.create,
        targets: action.targets,
      } as SetupPoolsAction

      if (action.action === 'setupPools') {
        setupPoolsActions.push(convertedAction)
      } else {
        otherActions.push(convertedAction)
      }
    })

    // Regroup setupPools actions to handle overlapping tags
    const regroupedSetupPoolsActions = regroupActions({
      myActions,
      pendingSubmissions: setupPoolsActions,
    })

    // For other actions, wrap them directly in create format
    // Remove UI-only properties before wrapping
    const wrappedOtherActions = otherActions.map((action) => ({
      create: _omit(action, 'actionCardType'),
    }))

    return [...regroupedSetupPoolsActions, ...wrappedOtherActions]
  })()

  const { submitActions, isLoading: isSubmittingActions } = useSubmitActions({
    actions: submittableActions,
  })

  const requestedActions = _filter(
    internalActions,
    ({ actionCardType }) => actionCardType === ACTIONS_SIDEBAR_TYPES.REQUESTED,
  )

  const withoutRequestedActions = _filter(
    internalActions,
    ({ actionCardType }) => actionCardType !== ACTIONS_SIDEBAR_TYPES.REQUESTED,
  )
  const actionIDs = _map(requestedActions, ({ id }) => id)
  const { processActions, isLoading: isProcessingActions } = useProcessActions({ actionIDs })
  const isLoading = isCancellingActions || isSubmittingActions || isProcessingActions

  const confirmationDetails = confirmationAction && {
    title: confirmationAction.action,
    onAction: confirmationAction.actionFn,
  }

  useEffect(() => {
    if (actions) {
      setInternalActions(
        _map(actions, (action: ActionWithCardType) => {
          const prevAction = _find(internalActions, { id: action.id })

          return {
            ...action,
            ...(prevAction?.cancelled && { cancelled: true }),
          }
        }),
      )
    }
  }, [actions])

  const onCancel = () => {
    setIsOpen(false)
    setConfirmationAction(null)
  }

  const onOk = () => {
    confirmationDetails?.onAction()
    setIsOpen(false)
  }

  const handleCancelAll = async () => {
    const ids = _map(actions, (action: ActionWithCardType) => action.id)

    setInternalActions((prevActions: unknown) =>
      _map(prevActions as ActionWithCardType[], (prevAction: ActionWithCardType) => ({
        ...prevAction,
        cancelled: true,
      })),
    )

    await cancelActions({ ids, type: 'voting' })

    dispatch(clearAllPendingSubmissions())
    notifyInfo('Discarded Actions', 'Actions were discarded successfully')

    await refetchActionsData()
  }

  const handleAllActions = async (
    actionFn: (...args: unknown[]) => Promise<unknown>,
    args: unknown[] = [],
  ) => {
    await actionFn(...args)

    setInternalActions([])
  }

  const onActionClick = (
    confirmationAction: string,
    actionFn: (...args: unknown[]) => Promise<unknown>,
    args: unknown[] = [],
  ) => {
    setConfirmationAction({
      action: confirmationAction,
      actionFn: () => handleAllActions(actionFn, args),
    })
    setIsOpen(true)
  }

  const onCancelAllClick = () => {
    onActionClick(CONFIRMATION_ACTIONS.discardAll, handleCancelAll)
  }

  const onSubmitAllClick = () => {
    onActionClick(CONFIRMATION_ACTIONS.submitAll, submitActions)
  }

  const onApproveAllClick = () => {
    onActionClick(
      CONFIRMATION_ACTIONS.approveAll,
      processActions as (...args: unknown[]) => Promise<unknown>,
      [true],
    )
  }

  const onRejectAllClick = () => {
    onActionClick(
      CONFIRMATION_ACTIONS.rejectAll,
      processActions as (...args: unknown[]) => Promise<unknown>,
      [false],
    )
  }

  const handleActionCancel = (actionId: string) => {
    setInternalActions((prevActions: unknown) =>
      _map(prevActions as ActionWithCardType[], (prevAction: ActionWithCardType) => {
        if (prevAction.id === actionId) {
          return {
            ...prevAction,
            cancelled: true,
          }
        }
        return prevAction
      }),
    )
  }

  return (
    <>
      {isPinned &&
        !isMobile &&
        getSideBarHeader &&
        getSideBarHeader?.(false, onPinToggled, isPinned, isMobile)}
      <SidebarInnerContainer $isPinned={isActionsSidebarPinned}>
        {_isEmpty(internalActions) && <Empty description="No pending actions." />}

        {_map(requestedActions, (action: ActionWithCardType, index: number) => (
          <ActionCard
            key={action.id + index}
            type={action.actionCardType}
            cardAction={action}
            setIsOpen={setIsOpen}
            areRejectApproveAvailable={areRejectApproveAvailable}
            onActionCancel={handleActionCancel}
          />
        ))}
        {areRejectApproveAvailable && _size(requestedActions) > 1 && (
          <ButtonWrapper>
            <SecondaryButton size="large" onClick={onRejectAllClick} disabled={isLoading}>
              Reject All
            </SecondaryButton>
            <PrimaryButton size="large" onClick={onApproveAllClick} disabled={isLoading}>
              Approve All
            </PrimaryButton>
          </ButtonWrapper>
        )}

        {_map(withoutRequestedActions, (action: ActionWithCardType, index: number) => (
          <ActionCard
            key={action.id + index}
            type={action.actionCardType}
            cardAction={action}
            setIsOpen={setIsOpen}
            areRejectApproveAvailable={areRejectApproveAvailable}
            onActionCancel={handleActionCancel}
          />
        ))}
        {_size(submittableActions) > 1 && (
          <ButtonWrapper>
            <SecondaryButton size="large" onClick={onCancelAllClick} disabled={isLoading}>
              Discard All
            </SecondaryButton>
            <PrimaryButton size="large" onClick={onSubmitAllClick} disabled={isLoading}>
              Submit All
            </PrimaryButton>
          </ButtonWrapper>
        )}
      </SidebarInnerContainer>

      <ConfirmationModal
        isOpen={isOpen}
        onOk={onOk}
        onCancel={onCancel}
        message={
          <>
            Are you sure you want to{' '}
            <BoldAction>
              {_join(
                _filter(
                  _split(confirmationDetails?.title, ' '),
                  (word: string) => _lowerCase(word) !== 'request',
                ),
                ' ',
              )}
            </BoldAction>{' '}
            the {`action${_includes(confirmationDetails?.title, 'all') ? 's' : ''}`}?
          </>
        }
        title={confirmationDetails?.title}
      />
    </>
  )
}
