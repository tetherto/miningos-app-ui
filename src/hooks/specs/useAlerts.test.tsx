import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useAlerts from '../useAlerts'

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: () => ({ data: null, isLoading: false }),
}))
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 20000 }))

describe('useAlerts', () => {
  it('returns data, isLoading, newAlertsData, resetNewAlerts', () => {
    const { result } = renderHook(() => useAlerts())
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading', false)
    expect(result.current).toHaveProperty('newAlertsData')
    expect(Array.isArray(result.current.newAlertsData)).toBe(true)
    expect(result.current).toHaveProperty('resetNewAlerts')
    expect(typeof result.current.resetNewAlerts).toBe('function')
  })
})
