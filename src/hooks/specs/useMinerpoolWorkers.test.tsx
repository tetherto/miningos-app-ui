import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMinerpoolWorkers } from '../useMinerpoolWorkers'

vi.mock('@/app/services/api', () => ({
  useLazyGetExtDataQuery: () => [
    vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve([{ workers: [] }]),
    }),
  ],
}))

describe('useMinerpoolWorkers', () => {
  it('returns workersObj', async () => {
    const { result } = renderHook(() => useMinerpoolWorkers())
    await waitFor(() => {
      expect(result.current).toHaveProperty('workersObj')
    })
  })
})
