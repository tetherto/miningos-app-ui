import _includes from 'lodash/includes'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import { USER_ROLE } from '@/constants/permissions.constants'
import type { Action } from '@/hooks/hooks.types'
import { usePendingActions } from '@/hooks/usePendingActions'
import { useUserRole } from '@/hooks/useUserRole'

interface ActionsContextValue {
  areRejectApproveAvailable: boolean
  isLoading: boolean
  myActions: Action[]
  doneActions: Action[]
  readyActions: Action[]
  executingActions: Action[]
  othersActions: Action[]
  refetchActionsData: () => void
}

const ActionsContext = createContext<ActionsContextValue | null>(null)

interface PendingActionsDataReturn {
  myActions: Action[]
  doneActions: Action[]
  readyActions: Action[]
  executingActions: Action[]
  othersActions: Action[]
  isLoading: boolean
  refetchActionsData: () => void
}

export const ActionsProvider = ({ children }: PropsWithChildren) => {
  const userRole = useUserRole()
  const pendingActionsData = usePendingActions({
    showNotification: true,
  }) as unknown as PendingActionsDataReturn

  const areRejectApproveAvailable = _includes(
    [USER_ROLE.ADMIN, USER_ROLE.SITE_MANAGER],
    userRole?.value,
  )

  const value = useMemo<ActionsContextValue>(
    () => ({
      areRejectApproveAvailable,
      isLoading: pendingActionsData.isLoading,
      myActions: pendingActionsData.myActions,
      doneActions: pendingActionsData.doneActions,
      readyActions: pendingActionsData.readyActions,
      executingActions: pendingActionsData.executingActions,
      refetchActionsData: pendingActionsData.refetchActionsData,
      othersActions: areRejectApproveAvailable ? pendingActionsData.othersActions : [],
    }),
    [
      areRejectApproveAvailable,
      pendingActionsData.isLoading,
      pendingActionsData.myActions,
      pendingActionsData.doneActions,
      pendingActionsData.readyActions,
      pendingActionsData.othersActions,
      pendingActionsData.executingActions,
      pendingActionsData.refetchActionsData,
    ],
  )

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}

export const useActionsContext = (): ActionsContextValue => {
  const context = useContext(ActionsContext)

  if (!context) {
    throw new Error('useActionsContext must be used within an ActionsProvider')
  }

  return context
}
