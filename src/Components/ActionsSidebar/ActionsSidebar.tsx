import { map as _map, size as _size } from 'lodash'
import pluralize from 'pluralize'
import { type ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  actionsSidebarSlice,
  selectIsActionsSidebarOpen,
  selectIsActionsSidebarPinned,
} from '../../app/slices/actionsSidebarSlice'
import { selectPendingSubmissions } from '../../app/slices/actionsSlice'
import { useActionsContext } from '../../contexts/ActionsContext'
import type { Action } from '../../hooks/hooks.types'
import useDeviceResolution from '../../hooks/useDeviceResolution'
import { PinIcon } from '../Icons/PinIcon'
import { UnPinIcon } from '../Icons/UnPinIcon'

import { SidebarHeaderContainer, SidebarModal, StyledButton } from './ActionsSidebar.styles'
import { ACTIONS_SIDEBAR_TYPES } from './ActionsSidebar.types'
import type { ActionWithCardType } from './ActionsSidebarInnerContent'
import { ActionsSideBarInnerContent } from './ActionsSidebarInnerContent'

const { setIsActionsSidebarOpen, setIsActionsSidebarPinned } = actionsSidebarSlice.actions
const iconSize = 12

const ActionsSidebar = () => {
  const dispatch = useDispatch()

  const { isMobile } = useDeviceResolution()

  const isActionsSidebarOpen = useSelector(selectIsActionsSidebarOpen)
  const isActionsSidebarPinned = useSelector(selectIsActionsSidebarPinned)

  const pendingSubmissions = useSelector(selectPendingSubmissions)

  const { myActions, readyActions, executingActions, othersActions } = useActionsContext()

  const submittedActions = [...myActions, ...readyActions, ...executingActions]

  const currentUserActionsData: ActionWithCardType[] = _map(submittedActions, (action: Action) => ({
    ...action,
    actionCardType: ACTIONS_SIDEBAR_TYPES.PENDING_APPROVAL,
  })) as ActionWithCardType[]

  const othersActionsData: ActionWithCardType[] = _map(othersActions, (action: Action) => ({
    ...action,
    actionCardType: ACTIONS_SIDEBAR_TYPES.REQUESTED,
  })) as ActionWithCardType[]

  const pendingSubmissionsData: ActionWithCardType[] = _map(
    (pendingSubmissions || []) as unknown as Action[],
    (action: Action) => ({
      ...action,
      actionCardType: ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION,
    }),
  ) as ActionWithCardType[]

  const actions: ActionWithCardType[] = [
    ...currentUserActionsData,
    ...othersActionsData,
    ...pendingSubmissionsData,
  ]
  const actionsCount = _size(actions)
  const sidebarTitle = `${actionsCount} ${pluralize('Action', actionsCount)} ${ACTIONS_SIDEBAR_TYPES.PENDING_SUBMISSION}`

  const handleCancel = () => {
    dispatch(setIsActionsSidebarOpen(false))
  }

  const getSideBarHeader = (isModal: boolean, onPinToggled?: () => void): ReactNode => (
    <SidebarHeaderContainer $isModal={isModal}>
      {!isMobile && (
        <StyledButton size="middle" onClick={onPinToggled}>
          {isActionsSidebarPinned ? (
            <UnPinIcon width={iconSize} height={iconSize} />
          ) : (
            <PinIcon width={iconSize} height={iconSize} />
          )}
        </StyledButton>
      )}
      {sidebarTitle}
    </SidebarHeaderContainer>
  )

  const onPinToggled = () => {
    dispatch(setIsActionsSidebarPinned(!isActionsSidebarPinned))
  }

  return (
    <>
      {isActionsSidebarPinned && !isMobile ? (
        <ActionsSideBarInnerContent
          actions={actions}
          onPinToggled={onPinToggled}
          isPinned={isActionsSidebarPinned}
          getSideBarHeader={getSideBarHeader}
        />
      ) : (
        <SidebarModal
          footer={false}
          onCancel={handleCancel}
          open={isActionsSidebarOpen}
          title={getSideBarHeader(true, onPinToggled)}
        >
          <ActionsSideBarInnerContent
            actions={actions}
            onPinToggled={onPinToggled}
            isPinned={isActionsSidebarPinned}
            getSideBarHeader={getSideBarHeader}
          />
        </SidebarModal>
      )}
    </>
  )
}

export default ActionsSidebar
