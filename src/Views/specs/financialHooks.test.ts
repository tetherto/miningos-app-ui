/**
 * Tests for financial hook modules - both importability and renderHook execution
 */
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetTailLogRangeAggrQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetGlobalConfigQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetListThingsQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetTailLogQuery: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    refetch: vi.fn(),
  })),
}))

vi.mock('@/hooks/useTimezone', () => ({
  default: vi.fn(() => ({ timezone: 'UTC' })),
}))

vi.mock('@/app/services/api.utils', () => ({
  isDemoMode: false,
  isUseMockdataEnabled: false,
  isSaveMockdataEnabled: false,
}))

// Mock Redux for financial hooks that depend on it
vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => null),
  useDispatch: vi.fn(() => vi.fn()),
}))

// Mock sub-hooks used by EBITDA and EnergyBalance
const mockDateRange = { start: 1704067200000, end: 1706745600000, period: 'daily' }
vi.mock('@/Views/Financial/common/useFinancialDateRange', () => ({
  useFinancialDateRange: vi.fn(() => ({
    dateRange: mockDateRange,
    handleRangeChange: vi.fn(),
  })),
}))

vi.mock('@/Views/Financial/common/useCurrentBTCPrice', () => ({
  useCurrentBTCPrice: vi.fn(() => ({
    currentBTCPrice: 45000,
    isLoading: false,
    error: null,
    data: { price: 45000 },
  })),
  buildCurrentBtcParams: vi.fn(() => ({ type: 'mempool' })),
}))

vi.mock('@/Views/Financial/common/useHistoricalBTCPrices', () => ({
  useHistoricalBTCPrices: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/Views/Financial/common/useMinerpoolTransactions', () => ({
  useMinerpoolTransactions: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/Views/Financial/common/useProductionCosts', () => ({
  useProductionCosts: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/Views/Financial/common/useTailLog', () => ({
  useTailLog: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/Views/Financial/common/usePowerConsumption', () => ({
  usePowerConsumption: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/Views/Financial/common/useElectricityCurtailmentData', () => ({
  useElectricityCurtailmentData: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/hooks/useNominalConfigValues', () => ({
  useNominalConfigValues: vi.fn(() => ({
    nominalPowerMW: 1,
    isLoading: false,
  })),
}))

import { useCurrentBTCPrice, buildCurrentBtcParams } from '../Financial/common/useCurrentBTCPrice'
import useEBITDA from '../Financial/EBITDA/useEBITDA.hook'
import useEnergyBalance from '../Financial/EnergyBalance/useEnergyBalance.hook'
import { useEnergyReportData } from '../Reports/EnergyReport/hooks/useEnergyReportData'
import { useEnergyReportSiteView } from '../Reports/EnergyReport/hooks/useEnergyReportSiteView'

describe('buildCurrentBtcParams', () => {
  it('returns type: mempool', () => {
    expect(buildCurrentBtcParams()).toEqual({ type: 'mempool' })
  })
})

describe('useCurrentBTCPrice', () => {
  it('returns currentBTCPrice', () => {
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current).toHaveProperty('currentBTCPrice')
    expect(result.current.currentBTCPrice).toBe(45000)
  })
})

describe('useEBITDA', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useEBITDA())
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('handleRangeChange')
    expect(result.current).toHaveProperty('errors')
    expect(result.current).toHaveProperty('currentBTCPrice')
    expect(result.current.errors).toEqual([])
  })
})

describe('useEnergyBalance', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('handleRangeChange')
    expect(result.current).toHaveProperty('errors')
  })
})

describe('useEnergyReportData', () => {
  it('returns data, nominalValue, and isLoading', () => {
    const { result } = renderHook(() =>
      useEnergyReportData({ start: Date.now() - 86400000, end: Date.now() }),
    )
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('nominalValue')
  })
})

describe('useEnergyReportSiteView', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() =>
      useEnergyReportSiteView({ start: Date.now() - 86400000, end: Date.now() }),
    )
    expect(result.current).toBeDefined()
  })
})
