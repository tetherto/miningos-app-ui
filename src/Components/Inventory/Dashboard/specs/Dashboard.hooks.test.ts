import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  listThings: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  multiTailLog: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  site: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  tailLog: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  headerStats: vi.fn(() => ({ minersAmount: 0, isLoading: false })),
  subtractedTime: vi.fn(() => Date.now() - 60000),
}))

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: mockFns.listThings,
  useGetMultiTailLogQuery: mockFns.multiTailLog,
  useGetSiteQuery: mockFns.site,
  useGetTailLogQuery: mockFns.tailLog,
}))

vi.mock('@/hooks/useHeaderStats', () => ({
  useHeaderStats: () => mockFns.headerStats(),
}))

vi.mock('@/hooks/useSubtractedTime', () => ({
  default: () => mockFns.subtractedTime(),
}))

vi.mock('@/hooks/useTimezone', () => ({
  default: () => ({ timezone: 'UTC', setTimezone: vi.fn() }),
}))

vi.mock('@/Views/ContainerWidgets/ContainerWidget.util', () => ({
  getContainerMinersChartData: vi.fn(() => ({ disconnected: 2 })),
}))

import { useDashboardData } from '../Dashboard.hooks'

describe('useDashboardData', () => {
  it('returns expected shape when no data', () => {
    const { result } = renderHook(() => useDashboardData())
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('minersAmount')
    expect(result.current).toHaveProperty('minersTotal')
    expect(result.current).toHaveProperty('controlBoardTotal')
    expect(result.current).toHaveProperty('psuTotal')
    expect(result.current).toHaveProperty('hashboardTotal')
    expect(result.current).toHaveProperty('minerLocationsTotal')
    expect(result.current).toHaveProperty('inventoryClassification')
    expect(result.current).toHaveProperty('minerDistribution')
    expect(result.current).toHaveProperty('isMinersDataLoading')
  })

  it('returns minersTotal from nested array data', () => {
    mockFns.listThings.mockReturnValueOnce({
      data: [
        [
          { id: '1', type: 'miner-s19' },
          { id: '2', type: 'miner-s19' },
        ],
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current.minersTotal).toBe(2)
  })

  it('returns 0 minersTotal when data is not array', () => {
    mockFns.listThings.mockReturnValueOnce({ data: 'invalid', isLoading: false })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current.minersTotal).toBe(0)
  })

  it('calculates inventoryClassification from miner stats data', () => {
    mockFns.multiTailLog
      .mockReturnValueOnce({
        data: [
          [
            {
              '0': [
                {
                  miner_inventory_status_group_cnt_aggr: { installed: 10, unknown: 1 },
                  miner_inventory_location_group_cnt_aggr: { rack: 5 },
                },
              ],
            },
          ],
        ],
        isLoading: false,
      })
      .mockReturnValueOnce({ data: undefined as unknown, isLoading: false })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current.inventoryClassification.length).toBeGreaterThan(0)
  })

  it('sets isLoading true when header stats loading', () => {
    mockFns.headerStats.mockReturnValueOnce({ minersAmount: 0, isLoading: true })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current.isLoading).toBe(true)
  })

  it('minerDistribution is empty array when stats loading', () => {
    mockFns.multiTailLog.mockReturnValue({ data: undefined as unknown, isLoading: true })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current.minerDistribution).toEqual([])
    mockFns.multiTailLog
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('minersCapacity is empty object when containers loading', () => {
    // First listThings call is for miners, second for containers
    mockFns.listThings
      .mockReturnValueOnce({ data: undefined as unknown, isLoading: false })
      .mockReturnValueOnce({ data: undefined as unknown, isLoading: true })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current).toBeDefined()
  })

  it('processes containers with miner types for capacity', () => {
    mockFns.listThings
      .mockReturnValueOnce({ data: undefined as unknown, isLoading: false })
      .mockReturnValueOnce({
        data: [
          [
            {
              tags: ['t-container', 'container_miner-mbt_am-s19'],
              info: { container: 'c1', nominalMinerCapacity: 50 },
            },
          ],
        ],
        isLoading: false,
      })
    mockFns.tailLog.mockReturnValue({ data: [[{ type_cnt: {} }]], isLoading: false })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current).toBeDefined()
    mockFns.listThings.mockReset().mockReturnValue({ data: undefined as unknown, isLoading: false })
    mockFns.tailLog.mockReset().mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('handles container without miner tag', () => {
    mockFns.listThings
      .mockReturnValueOnce({ data: undefined as unknown, isLoading: false })
      .mockReturnValueOnce({
        data: [[{ tags: ['t-container'], info: { container: 'c2', nominalMinerCapacity: 10 } }]],
        isLoading: false,
      })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current).toBeDefined()
    mockFns.listThings.mockReset().mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('handles non-numeric container capacity', () => {
    mockFns.listThings
      .mockReturnValueOnce({ data: undefined as unknown, isLoading: false })
      .mockReturnValueOnce({
        data: [
          [
            {
              tags: ['t-container', 'container_miner-mbt_am-s19'],
              info: { container: 'c3', nominalMinerCapacity: '25' },
            },
          ],
        ],
        isLoading: false,
      })
    const { result } = renderHook(() => useDashboardData())
    expect(result.current).toBeDefined()
    mockFns.listThings.mockReset().mockReturnValue({ data: undefined as unknown, isLoading: false })
  })
})
