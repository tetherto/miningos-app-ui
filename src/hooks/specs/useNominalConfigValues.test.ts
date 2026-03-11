import { renderHook } from '@testing-library/react'

import { useNominalConfigValues } from '../useNominalConfigValues'

vi.mock('@/app/services/api', () => ({
  useGetGlobalConfigQuery: vi.fn(),
}))

vi.mock('../Views/Financial/RevenueSummary/hooks/documentationMocks', () => ({
  USE_DOCUMENTATION_MOCKS: false,
  mockGlobalConfigFromDoc: null,
}))

import { useGetGlobalConfigQuery } from '@/app/services/api'

const mockQuery = useGetGlobalConfigQuery as ReturnType<typeof vi.fn>

describe('useNominalConfigValues', () => {
  it('returns 0 values while loading', () => {
    mockQuery.mockReturnValue({ data: undefined as unknown, isLoading: true })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.nominalHashrateMHS).toBe(0)
    expect(result.current.nominalAvailablePowerMWh).toBe(0)
  })

  it('returns 0 values when data is null', () => {
    mockQuery.mockReturnValue({ data: null, isLoading: false })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.nominalHashrateMHS).toBe(0)
    expect(result.current.nominalAvailablePowerMWh).toBe(0)
  })

  it('extracts nominalHashrateMHS from config object', () => {
    mockQuery.mockReturnValue({
      data: { nominalSiteHashrate_MHS: 1500, nominalAvailablePowerMWh: 25 },
      isLoading: false,
    })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.nominalHashrateMHS).toBe(1500)
  })

  it('extracts nominalAvailablePowerMWh from config object', () => {
    mockQuery.mockReturnValue({
      data: { nominalSiteHashrate_MHS: 1000, nominalAvailablePowerMWh: 50 },
      isLoading: false,
    })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.nominalAvailablePowerMWh).toBe(50)
  })

  it('handles config as an array, using the first element', () => {
    mockQuery.mockReturnValue({
      data: [
        { nominalSiteHashrate_MHS: 800, nominalAvailablePowerMWh: 30 },
        { nominalSiteHashrate_MHS: 999, nominalAvailablePowerMWh: 99 },
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.nominalHashrateMHS).toBe(800)
    expect(result.current.nominalAvailablePowerMWh).toBe(30)
  })

  it('returns 0 when config exists but fields are missing', () => {
    mockQuery.mockReturnValue({ data: {}, isLoading: false })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.nominalHashrateMHS).toBe(0)
    expect(result.current.nominalAvailablePowerMWh).toBe(0)
  })

  it('returns 0 when config fields are 0', () => {
    mockQuery.mockReturnValue({
      data: { nominalSiteHashrate_MHS: 0, nominalAvailablePowerMWh: 0 },
      isLoading: false,
    })
    const { result } = renderHook(() => useNominalConfigValues())
    expect(result.current.nominalHashrateMHS).toBe(0)
    expect(result.current.nominalAvailablePowerMWh).toBe(0)
  })
})
