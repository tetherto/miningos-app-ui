import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useProcessActions } from '../useProcessActions'

const mockNotifySuccess = vi.fn()
const mockNotifyError = vi.fn()
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    notifySuccess: mockNotifySuccess,
    notifyError: mockNotifyError,
  }),
}))
vi.mock('@/app/services/api', () => ({
  useVoteForActionMutation: () => [
    () => Promise.resolve({ data: [{ success: 1 }], error: undefined }),
    { isLoading: false },
  ],
}))
vi.mock('@/contexts/ActionsContext', () => ({
  useActionsContext: () => ({ refetchActionsData: vi.fn() }),
}))

describe('useProcessActions', () => {
  it('returns processActions and isLoading', () => {
    const { result } = renderHook(() => useProcessActions({ actionIDs: [] }))
    expect(result.current).toHaveProperty('processActions')
    expect(result.current).toHaveProperty('isLoading')
    expect(typeof result.current.processActions).toBe('function')
  })

  it('processActions can be called with actionIDs', async () => {
    const { result } = renderHook(() => useProcessActions({ actionIDs: ['action-1'] }))
    await result.current.processActions(true)
    expect(result.current.processActions).toBeDefined()
  })
})
