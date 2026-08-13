import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMinerpoolWorkers } from '../useMinerpoolWorkers'

const mockLazyRequest = vi.fn()

vi.mock('@/app/services/api', () => ({
  useLazyGetExtDataQuery: () => [mockLazyRequest],
}))

describe('useMinerpoolWorkers', () => {
  beforeEach(() => {
    mockLazyRequest.mockReturnValue({
      unwrap: () => Promise.resolve([{ workers: [] }]),
    })
  })

  it('returns workersObj when workers list is empty', async () => {
    const { result } = renderHook(() => useMinerpoolWorkers())
    await waitFor(() => {
      expect(result.current).toHaveProperty('workersObj')
    })
  })

  it('handles non-empty workers response without infinite loop', async () => {
    // First call returns workers, second call returns empty (stops recursion)
    let callCount = 0
    mockLazyRequest.mockImplementation(() => ({
      unwrap: () => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve([{ workers: [{ name: 'worker1' }] }])
        }
        return Promise.resolve([{ workers: [] }])
      },
    }))

    const { result } = renderHook(() => useMinerpoolWorkers())

    await waitFor(
      () => {
        expect(result.current).toHaveProperty('workersObj')
      },
      { timeout: 3000 },
    )
  })
})
