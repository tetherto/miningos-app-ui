import notification from 'antd/es/notification'
import type { NotificationPlacement } from 'antd/es/notification/interface'

import { store } from '../store'

import { decrement, increment } from '@/app/slices/notificationSlice'

/**
 * This service uses static notification API which cannot consume React context.
 * For React components and hooks, use the `useNotification` hook instead.
 * This service is kept only for utility functions that cannot use React hooks.
 */

type NotificationType = keyof Pick<
  Record<keyof typeof notification, unknown>,
  'success' | 'info' | 'warning' | 'error'
>

const openNotification = (
  type: NotificationType,
  message: string,
  description: string,
  duration: number,
  placement: NotificationPlacement,
): void => {
  store.dispatch(increment())

  notification[type]({
    message,
    description,
    duration,
    placement,
    onClose: () => {
      store.dispatch(decrement())
    },
  })
}

export const notifySuccess = (message: string, description: string): void => {
  openNotification('success', message, description, 3, 'topLeft')
}

export const notifyError = (message: string, description: string, dontClose?: boolean): void => {
  openNotification('error', message, description, dontClose ? 0 : 3, 'topLeft')
}

export const notifyInfo = (message: string, description: string): void => {
  openNotification('info', message, description, 3, 'topLeft')
}

export const notifyWarning = (message: string, description: string): void => {
  openNotification('warning', message, description, 3, 'topLeft')
}
