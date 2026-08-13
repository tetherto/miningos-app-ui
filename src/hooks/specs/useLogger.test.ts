import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useLogger } from '../useLogger'

vi.mock('@/app/services/api', () => ({
  useGetFeaturesQuery: () => ({ data: { isDevelopment: false }, isLoading: false }),
}))
vi.mock('@/app/services/logger', () => ({ Logger: { init: vi.fn() } }))

describe('useLogger', () => {
  it('returns logger', () => {
    const { result } = renderHook(() => useLogger())
    expect(result.current).toHaveProperty('logger')
  })
})
