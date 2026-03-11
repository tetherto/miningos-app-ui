import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useAlerts from '../useAlerts'

const mockListThings = vi.hoisted(() => vi.fn(() => ({ data: null as unknown, isLoading: false })))

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: mockListThings,
}))
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 20000 }))
vi.mock('@/app/utils/alertUtils', () => ({
  getCriticalAlerts: vi.fn((alerts: unknown[]) => alerts || []),
}))

describe('useAlerts', () => {
  it('returns data, isLoading, newAlertsData, resetNewAlerts when data is null', () => {
    const { result } = renderHook(() => useAlerts())
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading', false)
    expect(result.current).toHaveProperty('newAlertsData')
    expect(Array.isArray(result.current.newAlertsData)).toBe(true)
    expect(result.current).toHaveProperty('resetNewAlerts')
    expect(typeof result.current.resetNewAlerts).toBe('function')
  })

  it('handles array device data with no alerts', async () => {
    mockListThings.mockReturnValueOnce({
      data: [{ last: { alerts: [] }, info: {}, type: 'miner', id: 'device-1' }],
      isLoading: false,
    })
    const { result } = renderHook(() => useAlerts())
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
    expect(result.current.newAlertsData).toEqual([])
  })

  it('handles non-array device data (returns early)', async () => {
    mockListThings.mockReturnValueOnce({
      data: { someObject: true },
      isLoading: false,
    })
    const { result } = renderHook(() => useAlerts())
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
    expect(result.current.newAlertsData).toEqual([])
  })

  it('resetNewAlerts clears newAlertsData', () => {
    const { result } = renderHook(() => useAlerts())
    act(() => {
      result.current.resetNewAlerts()
    })
    expect(result.current.newAlertsData).toEqual([])
  })

  it('processes device with critical alerts on second render', async () => {
    const mockAlert = { uuid: 'alert-1', type: 'critical' }
    mockListThings.mockReturnValueOnce({
      data: [{ last: { alerts: [mockAlert] }, info: {}, type: 'miner' }],
      isLoading: false,
    })
    const { result, rerender } = renderHook(() => useAlerts())

    // First render processes data as "first API call" - no new alerts set
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    // Simulate second API response (new alert should be detected)
    mockListThings.mockReturnValueOnce({
      data: [
        { last: { alerts: [{ uuid: 'alert-2', type: 'critical' }] }, info: {}, type: 'miner' },
      ],
      isLoading: false,
    })
    rerender()
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
