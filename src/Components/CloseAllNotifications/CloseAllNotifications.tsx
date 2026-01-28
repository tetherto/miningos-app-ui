// components/CloseAllNotifications.tsx
import App from 'antd/es/app'
import Button from 'antd/es/button'
import { useSelector, useDispatch } from 'react-redux'

import { reset } from '@/app/slices/notificationSlice'
import { CloseAllNotificationsWrapper } from '@/Components/CloseAllNotifications/CloseAllNotification.styles'
import type { RootState } from '@/types/redux'

export const CloseAllNotifications = () => {
  const { notification } = App.useApp()
  const count = useSelector((state: RootState) => state.notifications.count)
  const dispatch = useDispatch()

  if (count <= 1) return null

  const handleCloseAll = () => {
    notification.destroy()
    dispatch(reset())
  }

  return (
    <CloseAllNotificationsWrapper>
      <Button type="primary" size="large" onClick={handleCloseAll}>
        Close All
      </Button>
    </CloseAllNotificationsWrapper>
  )
}
