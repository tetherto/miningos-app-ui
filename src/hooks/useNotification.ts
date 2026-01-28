import useApp from 'antd/es/app/useApp'
import type { NotificationPlacement } from 'antd/es/notification/interface'
import { useDispatch } from 'react-redux'

import { decrement, increment } from '@/app/slices/notificationSlice'

/**
 * Custom hook for showing notifications with Redux integration.
 * Uses Ant Design's useApp() to access context-aware notification API.
 *
 * @returns Object containing notification functions (notifySuccess, notifyError, notifyInfo, notifyWarning)
 */
export const useNotification = () => {
  const { notification } = useApp()
  const dispatch = useDispatch()

  const notifySuccess = (message: string, description: string) => {
    dispatch(increment())
    notification.success({
      message,
      description,
      duration: 3,
      placement: 'topLeft' as NotificationPlacement,
      onClose: () => {
        dispatch(decrement())
      },
    })
  }

  const notifyError = (message: string, description: string, dontClose?: boolean) => {
    dispatch(increment())
    notification.error({
      message,
      description,
      duration: dontClose ? 0 : 3,
      placement: 'topLeft' as NotificationPlacement,
      onClose: () => {
        dispatch(decrement())
      },
    })
  }

  const notifyInfo = (message: string, description: string) => {
    dispatch(increment())
    notification.info({
      message,
      description,
      duration: 3,
      placement: 'topLeft' as NotificationPlacement,
      onClose: () => {
        dispatch(decrement())
      },
    })
  }

  const notifyWarning = (message: string, description: string) => {
    dispatch(increment())
    notification.warning({
      message,
      description,
      duration: 3,
      placement: 'topLeft' as NotificationPlacement,
      onClose: () => {
        dispatch(decrement())
      },
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  }
}
