import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMinerDuplicateValidation } from '../useMinerDuplicateValidation'

const mockGetListThings = vi.fn().mockResolvedValue({ data: [] })

vi.mock('@/app/services/api', () => ({
  useLazyGetListThingsQuery: () => [mockGetListThings],
}))

describe('useMinerDuplicateValidation', () => {
  it('returns duplicateError, isDuplicateCheckLoading, checkDuplicate, setDuplicateError', () => {
    const { result } = renderHook(() => useMinerDuplicateValidation())
    expect(result.current).toHaveProperty('duplicateError')
    expect(result.current).toHaveProperty('isDuplicateCheckLoading')
    expect(result.current).toHaveProperty('checkDuplicate')
    expect(result.current).toHaveProperty('setDuplicateError')
  })

  it('checkDuplicate returns false when no duplicates found', async () => {
    mockGetListThings.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useMinerDuplicateValidation())
    let isDuplicate: boolean | undefined
    await act(async () => {
      isDuplicate = await result.current.checkDuplicate(null, {
        macAddress: 'aa:bb:cc:dd:ee:ff',
        serialNumber: 'SN123',
        address: '192.168.1.1',
        code: 'CODE1',
      })
    })
    expect(isDuplicate).toBe(false)
    expect(result.current.duplicateError).toBe(false)
  })

  it('checkDuplicate returns true when duplicate found with different id', async () => {
    mockGetListThings.mockResolvedValue({
      data: [[{ id: 'other-id', info: { macAddress: 'aa:bb:cc:dd:ee:ff' } }]],
    })
    const { result } = renderHook(() => useMinerDuplicateValidation())
    let isDuplicate: boolean | undefined
    await act(async () => {
      isDuplicate = await result.current.checkDuplicate(
        { miner: { id: 'my-id' } },
        { macAddress: 'aa:bb:cc:dd:ee:ff', serialNumber: '', address: '', code: '' },
      )
    })
    expect(isDuplicate).toBe(true)
    expect(result.current.duplicateError).toBe(true)
  })

  it('checkDuplicate returns false when data matches same id', async () => {
    mockGetListThings.mockResolvedValue({
      data: [[{ id: 'same-id', info: { macAddress: 'aa:bb:cc:dd:ee:ff' } }]],
    })
    const { result } = renderHook(() => useMinerDuplicateValidation())
    let isDuplicate: boolean | undefined
    await act(async () => {
      isDuplicate = await result.current.checkDuplicate(
        { miner: { id: 'same-id' } },
        { macAddress: 'aa:bb:cc:dd:ee:ff', serialNumber: '', address: '', code: '' },
      )
    })
    expect(isDuplicate).toBe(false)
  })

  it('checkDuplicate with no validation fields still calls query', async () => {
    mockGetListThings.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useMinerDuplicateValidation())
    await act(async () => {
      await result.current.checkDuplicate(null, {
        macAddress: '',
        serialNumber: '',
        address: '',
        code: '',
      })
    })
    expect(mockGetListThings).toHaveBeenCalled()
  })

  it('setDuplicateError allows manual override', () => {
    const { result } = renderHook(() => useMinerDuplicateValidation())
    act(() => result.current.setDuplicateError(true))
    expect(result.current.duplicateError).toBe(true)
    act(() => result.current.setDuplicateError(false))
    expect(result.current.duplicateError).toBe(false)
  })
})
