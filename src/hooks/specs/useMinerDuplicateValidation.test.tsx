import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMinerDuplicateValidation } from '../useMinerDuplicateValidation'

vi.mock('@/app/services/api', () => ({
  useLazyGetListThingsQuery: () => [
    vi.fn().mockResolvedValue({ data: [] }),
  ],
}))

describe('useMinerDuplicateValidation', () => {
  it('returns duplicateError, isDuplicateCheckLoading, checkDuplicate, setDuplicateError', () => {
    const { result } = renderHook(() => useMinerDuplicateValidation())
    expect(result.current).toHaveProperty('duplicateError')
    expect(result.current).toHaveProperty('isDuplicateCheckLoading')
    expect(result.current).toHaveProperty('checkDuplicate')
    expect(result.current).toHaveProperty('setDuplicateError')
  })
})
