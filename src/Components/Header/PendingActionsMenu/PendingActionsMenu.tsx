import _size from 'lodash/size'
import { useDispatch, useSelector } from 'react-redux'

import { PendingTasksCount } from './PendingTasksCount'

import { actionsSidebarSlice } from '@/app/slices/actionsSidebarSlice'
import { selectPendingSubmissions } from '@/app/slices/actionsSlice'
import { COLOR } from '@/constants/colors'
import { useActionsContext } from '@/contexts/ActionsContext'

const { setIsActionsSidebarOpen } = actionsSidebarSlice.actions

const PendingActionsMenu = () => {
  const dispatch = useDispatch()
  const pendingSubmissions = useSelector(selectPendingSubmissions)

  const { myActions, readyActions, executingActions, othersActions } = useActionsContext()

  const actions = [
    ...myActions,
    ...readyActions,
    ...executingActions,
    ...othersActions,
    ...pendingSubmissions,
  ]

  const showActionsSidebar = () => {
    dispatch(setIsActionsSidebarOpen(true))
  }

  return (
    <PendingTasksCount
      value={_size(actions)}
      color={COLOR.COLD_ORANGE}
      onClick={showActionsSidebar}
    />
  )
}

export { PendingActionsMenu }
