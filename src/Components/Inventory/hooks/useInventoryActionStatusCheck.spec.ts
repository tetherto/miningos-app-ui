import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import {
  areActionsCompleted,
  hasFailedActions,
  useInventoryActionStatusCheck,
} from './useInventoryActionStatusCheck'

import { ACTION_STATUS_TYPES } from '@/constants/actions'

const getActionsMock = vi.fn()

vi.mock('@/app/services/api', () => ({
  useLazyGetActionsQuery: vi.fn(() => [getActionsMock]),
}))

const response = (done: Array<{ id?: string; status?: string }>) => ({ data: [{ done }] })

describe('areActionsCompleted', () => {
  it('returns true when all required actions are completed', () => {
    const res = response([
      { id: '1', status: ACTION_STATUS_TYPES.COMPLETED },
      { id: '2', status: ACTION_STATUS_TYPES.COMPLETED },
    ])
    expect(areActionsCompleted(new Set(['1', '2']), res)).toBe(true)
  })

  it('returns false when a required action is missing from done', () => {
    const res = response([{ id: '1', status: ACTION_STATUS_TYPES.COMPLETED }])
    expect(areActionsCompleted(new Set(['1', '2']), res)).toBe(false)
  })

  it('returns false when there are no required actions', () => {
    const res = response([{ id: '1', status: ACTION_STATUS_TYPES.COMPLETED }])
    expect(areActionsCompleted(new Set(), res)).toBe(false)
  })

  it('does not count failed actions as completed', () => {
    const res = response([{ id: '1', status: ACTION_STATUS_TYPES.FAILED }])
    expect(areActionsCompleted(new Set(['1']), res)).toBe(false)
  })
})

describe('hasFailedActions', () => {
  it('returns true when a required action failed', () => {
    const res = response([{ id: '1', status: ACTION_STATUS_TYPES.FAILED }])
    expect(hasFailedActions(new Set(['1']), res)).toBe(true)
  })

  it('returns true when a required action was denied', () => {
    const res = response([{ id: '1', status: ACTION_STATUS_TYPES.DENIED }])
    expect(hasFailedActions(new Set(['1']), res)).toBe(true)
  })

  it('returns false when required actions completed', () => {
    const res = response([{ id: '1', status: ACTION_STATUS_TYPES.COMPLETED }])
    expect(hasFailedActions(new Set(['1']), res)).toBe(false)
  })

  it('ignores failures of unrelated actions', () => {
    const res = response([
      { id: '1', status: ACTION_STATUS_TYPES.COMPLETED },
      { id: '99', status: ACTION_STATUS_TYPES.FAILED },
    ])
    expect(hasFailedActions(new Set(['1']), res)).toBe(false)
  })
})

describe('useInventoryActionStatusCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true on the first poll when actions completed instantly', async () => {
    getActionsMock.mockResolvedValue(response([{ id: '1', status: ACTION_STATUS_TYPES.COMPLETED }]))
    const { result } = renderHook(() => useInventoryActionStatusCheck())

    await expect(result.current.checkStatus({ actions: [{ id: '1' }] })).resolves.toBe(true)
    expect(getActionsMock).toHaveBeenCalledTimes(1)
  })

  it('returns false without retrying when an action failed', async () => {
    getActionsMock.mockResolvedValue(response([{ id: '1', status: ACTION_STATUS_TYPES.FAILED }]))
    const { result } = renderHook(() => useInventoryActionStatusCheck())

    await expect(result.current.checkStatus({ actions: [{ id: '1' }] })).resolves.toBe(false)
    expect(getActionsMock).toHaveBeenCalledTimes(1)
  })

  it('returns false without polling when there are no actions to check', async () => {
    const { result } = renderHook(() => useInventoryActionStatusCheck())

    await expect(result.current.checkStatus({ actions: [] })).resolves.toBe(false)
    expect(getActionsMock).not.toHaveBeenCalled()
  })
})
