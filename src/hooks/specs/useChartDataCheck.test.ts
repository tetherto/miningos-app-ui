import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { useChartDataCheck } from '../useChartDataCheck'

import { getChartDataAvailability, hasDataValues } from '@/app/utils/chartUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

vi.mock('@/app/utils/chartUtils', () => ({
  getChartDataAvailability: vi.fn(),
  hasDataValues: vi.fn(),
}))

const mockHasDataValues = vi.mocked(hasDataValues)
const mockGetChartDataAvailability = vi.mocked(getChartDataAvailability)

describe('useChartDataCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when dataset is provided', () => {
    mockHasDataValues.mockReturnValue(true)

    const { result } = renderHook(() =>
      useChartDataCheck({ dataset: [1, 2, 3] as unknown as UnknownRecord, data: undefined }),
    )

    expect(mockHasDataValues).toHaveBeenCalledWith([1, 2, 3])
    expect(result.current).toBe(false)
  })

  it('should return true when data.datasets is provided', () => {
    mockGetChartDataAvailability.mockReturnValue(false)

    const { result } = renderHook(() =>
      useChartDataCheck({
        dataset: undefined,
        data: { datasets: [1, 2] } as unknown as UnknownRecord,
      }),
    )

    expect(mockGetChartDataAvailability).toHaveBeenCalledWith([1, 2])
    expect(result.current).toBe(true)
  })

  it('should return true when data.dataset is provided and dataset is null', () => {
    mockHasDataValues.mockReturnValue(false)

    const { result } = renderHook(() =>
      useChartDataCheck({ dataset: undefined, data: { dataset: [5] } as unknown as UnknownRecord }),
    )

    expect(mockHasDataValues).toHaveBeenCalledWith([5])
    expect(result.current).toBe(true)
  })

  it('should return true when no dataset or data provided', () => {
    const { result } = renderHook(() => useChartDataCheck({ dataset: undefined, data: undefined }))

    expect(result.current).toBe(true)
  })
})
