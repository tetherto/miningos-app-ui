import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useLineChartData from '../useLineChartData'

vi.mock('@/app/services/api', () => {
  const stableData = [{ ts: 1, value: 1 }]
  return {
    useGetTailLogQuery: () => ({
      data: stableData,
      isLoading: false,
    }),
  }
})

describe('useLineChartData', () => {
  it('returns lineData, isLineLoading, and dataset', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        timeline: '1h',
        lineType: 'miner',
        lineTag: 't-miner',
      }),
    )
    expect(result.current).toHaveProperty('lineData')
    expect(result.current).toHaveProperty('isLineLoading')
    expect(result.current).toHaveProperty('dataset')
  })

  it('uses default timeline when not provided', () => {
    const { result } = renderHook(() =>
      useLineChartData({
        lineType: 'miner',
        lineTag: 't-miner',
      }),
    )
    expect(result.current.isLineLoading).toBe(false)
  })
})
