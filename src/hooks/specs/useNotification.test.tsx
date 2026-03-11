import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useNotification } from '../useNotification'

import { notificationSlice } from '@/app/slices/notificationSlice'

const mockNotification = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}
vi.mock('antd/es/app/useApp', () => ({
  default: () => ({ notification: mockNotification }),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { notification: notificationSlice.reducer },
    preloadedState: { notification: { count: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useNotification', () => {
  it('returns notifySuccess, notifyError, notifyInfo, notifyWarning', () => {
    const { result } = renderHook(() => useNotification(), { wrapper: createWrapper() })
    expect(result.current).toHaveProperty('notifySuccess')
    expect(result.current).toHaveProperty('notifyError')
    expect(result.current).toHaveProperty('notifyInfo')
    expect(result.current).toHaveProperty('notifyWarning')
  })

  it('notifySuccess calls notification.success', () => {
    const { result } = renderHook(() => useNotification(), { wrapper: createWrapper() })
    result.current.notifySuccess('Title', 'Description')
    expect(mockNotification.success).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Title', description: 'Description' }),
    )
  })

  it('notifyError calls notification.error', () => {
    const { result } = renderHook(() => useNotification(), { wrapper: createWrapper() })
    result.current.notifyError('Err', 'Details')
    expect(mockNotification.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Err', description: 'Details', duration: 3 }),
    )
  })

  it('notifyError with dontClose=true sets duration to 0', () => {
    const { result } = renderHook(() => useNotification(), { wrapper: createWrapper() })
    result.current.notifyError('Err', 'Details', true)
    expect(mockNotification.error).toHaveBeenCalledWith(expect.objectContaining({ duration: 0 }))
  })

  it('notifyInfo calls notification.info', () => {
    const { result } = renderHook(() => useNotification(), { wrapper: createWrapper() })
    result.current.notifyInfo('Info', 'Details')
    expect(mockNotification.info).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Info', description: 'Details' }),
    )
  })

  it('notifyWarning calls notification.warning', () => {
    const { result } = renderHook(() => useNotification(), { wrapper: createWrapper() })
    result.current.notifyWarning('Warn', 'Details')
    expect(mockNotification.warning).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Warn', description: 'Details' }),
    )
  })
})
