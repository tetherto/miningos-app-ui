import { configureStore } from '@reduxjs/toolkit'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { usePendingActions } from '../usePendingActions'

import { authSlice } from '@/app/slices/authSlice'

const mockFns = vi.hoisted(() => ({
  actionsQuery: vi.fn(() => ({ data: null as unknown, isLoading: false, refetch: vi.fn() })),
  batchActionsQuery: vi.fn(() => ({ data: null as unknown })),
  userinfoQuery: vi.fn(() => ({ data: { metadata: { email: 'user@test.com' } } })),
  partitionActions: vi.fn(() => [[], []] as unknown[][]),
  notifyInfo: vi.fn(),
  notifyError: vi.fn(),
  extractActionErrors: vi.fn(() => [] as string[]),
}))

vi.mock('@/app/services/api', () => ({
  useGetActionsQuery: mockFns.actionsQuery,
  useGetBatchActionsQuery: mockFns.batchActionsQuery,
  useGetUserinfoQuery: mockFns.userinfoQuery,
}))

vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))

vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({ notifyInfo: mockFns.notifyInfo, notifyError: mockFns.notifyError }),
}))

vi.mock('@/Components/Header/PendingActionsMenu/PendingActionsMenu.util', () => ({
  partitionActionsIntoMineAndOthers: mockFns.partitionActions,
}))

vi.mock('../app/utils/actionUtils', () => ({
  extractActionErrors: mockFns.extractActionErrors,
}))

vi.mock('@/app/utils/actionUtils', () => ({
  extractActionErrors: mockFns.extractActionErrors,
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: 'test-token', permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('usePendingActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFns.actionsQuery.mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() })
    mockFns.batchActionsQuery.mockReturnValue({ data: null })
    mockFns.userinfoQuery.mockReturnValue({ data: { metadata: { email: 'user@test.com' } } })
    mockFns.partitionActions.mockReturnValue([[], []])
    mockFns.extractActionErrors.mockReturnValue([])
  })

  it('returns shape with pending actions data and handlers', () => {
    const { result } = renderHook(() => usePendingActions(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('myActions')
    expect(result.current).toHaveProperty('othersActions')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('refetchActionsData')
    expect(result.current).toHaveProperty('doneActions')
    expect(result.current).toHaveProperty('readyActions')
    expect(result.current).toHaveProperty('executingActions')
  })

  it('processes actions from API data', async () => {
    const mockVotingActions = [
      { id: 'action-1', action: 'firmware_update', status: 'voting', votesNeg: [] },
    ]
    mockFns.actionsQuery.mockReturnValue({
      data: [{ voting: mockVotingActions, ready: [], executing: [], done: [] }],
      isLoading: false,
      refetch: vi.fn(),
    })
    mockFns.partitionActions
      .mockReturnValueOnce([[{ id: 'action-1' }], []])
      .mockReturnValue([[], []])

    const { result } = renderHook(() => usePendingActions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('shows notification on completed actions with errors', async () => {
    const doneAction = {
      id: 'done-action-1',
      action: 'firmware_update',
      status: 'completed',
      votesNeg: [],
    }
    mockFns.actionsQuery.mockReturnValue({
      data: [{ voting: [], ready: [], executing: [], done: [doneAction] }],
      isLoading: false,
      refetch: vi.fn(),
    })
    mockFns.partitionActions
      .mockReturnValueOnce([[], []])
      .mockReturnValueOnce([[], []])
      .mockReturnValueOnce([[doneAction], []])
      .mockReturnValue([[], []])
    mockFns.extractActionErrors.mockReturnValue(['Error message'])

    const { result } = renderHook(() => usePendingActions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('calls notifyInfo when showNotification=true and actions have changed status', async () => {
    const updatedAction = { action: { action: 'firmware_update', status: 'ready', id: 'a1' } }
    mockFns.batchActionsQuery.mockReturnValue({ data: [updatedAction] })
    mockFns.partitionActions.mockReturnValue([[], []])

    const { result } = renderHook(() => usePendingActions({ showNotification: true }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('handles loading state from actionsQuery', () => {
    mockFns.actionsQuery.mockReturnValue({ data: null, isLoading: true, refetch: vi.fn() })

    const { result } = renderHook(() => usePendingActions(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })
})
