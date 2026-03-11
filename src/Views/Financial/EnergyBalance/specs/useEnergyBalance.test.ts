import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  financialDateRange: vi.fn(() => ({
    dateRange: { start: 1704067200000, end: 1706745600000 } as {
      start: number
      end: number
    } | null,
    handleRangeChange: vi.fn(),
  })),
  minerpoolTransactions: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    error: null as unknown,
  })),
  historicalBTCPrices: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    error: null,
  })),
  currentBTCPrice: vi.fn(() => ({
    currentBTCPrice: 0,
    isLoading: false,
    error: null,
    data: undefined as unknown,
  })),
  productionCosts: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    error: null,
  })),
  powerConsumption: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    error: null,
  })),
  electricityCurtailment: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    error: null,
  })),
  nominalConfigValues: vi.fn(() => ({
    nominalAvailablePowerMWh: 100,
    isLoading: false,
  })),
}))

vi.mock('@/Views/Financial/common/useFinancialDateRange', () => ({
  useFinancialDateRange: mockFns.financialDateRange,
}))
vi.mock('@/Views/Financial/common/useMinerpoolTransactions', () => ({
  useMinerpoolTransactions: mockFns.minerpoolTransactions,
}))
vi.mock('@/Views/Financial/common/useHistoricalBTCPrices', () => ({
  useHistoricalBTCPrices: mockFns.historicalBTCPrices,
}))
vi.mock('@/Views/Financial/common/useCurrentBTCPrice', () => ({
  useCurrentBTCPrice: mockFns.currentBTCPrice,
}))
vi.mock('@/Views/Financial/common/useProductionCosts', () => ({
  useProductionCosts: mockFns.productionCosts,
}))
vi.mock('@/Views/Financial/common/usePowerConsumption', () => ({
  usePowerConsumption: mockFns.powerConsumption,
}))
vi.mock('@/Views/Financial/common/useElectricityCurtailmentData', () => ({
  useElectricityCurtailmentData: mockFns.electricityCurtailment,
}))
vi.mock('@/hooks/useNominalConfigValues', () => ({
  useNominalConfigValues: mockFns.nominalConfigValues,
}))

import useEnergyBalance from '../useEnergyBalance.hook'

describe('useEnergyBalance', () => {
  it('returns expected shape with default state', () => {
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current).toHaveProperty('aggregatedData')
    expect(result.current).toHaveProperty('revenueMetrics')
    expect(result.current).toHaveProperty('costMetrics')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('hasData')
    expect(result.current).toHaveProperty('handleRevenueDisplayToggle')
    expect(result.current).toHaveProperty('handleTabChange')
    expect(result.current).toHaveProperty('activeTab')
    expect(result.current).toHaveProperty('revenueDisplayMode')
    expect(result.current).toHaveProperty('costDisplayMode')
    expect(result.current.activeTab).toBe('revenue')
    expect(result.current.revenueDisplayMode).toBe('USD')
    expect(result.current.costDisplayMode).toBe('USD')
  })

  it('processData early return when not all data present (currentBTCPrice=0)', () => {
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.aggregatedData).toEqual([])
    expect(result.current.revenueMetrics).toBeNull()
    expect(result.current.costMetrics).toBeNull()
    expect(result.current.hasData).toBe(false)
  })

  it('processData early return when dateRange is null', () => {
    mockFns.financialDateRange.mockReturnValue({
      dateRange: null,
      handleRangeChange: vi.fn(),
    })
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.aggregatedData).toEqual([])
    mockFns.financialDateRange.mockReturnValue({
      dateRange: { start: 1704067200000, end: 1706745600000 },
      handleRangeChange: vi.fn(),
    })
  })

  it('handleRevenueDisplayToggle changes revenueDisplayMode to BTC', () => {
    const { result } = renderHook(() => useEnergyBalance())
    act(() => {
      result.current.handleRevenueDisplayToggle('BTC')
    })
    expect(result.current.revenueDisplayMode).toBe('BTC')
  })

  it('handleTabChange changes activeTab', () => {
    const { result } = renderHook(() => useEnergyBalance())
    act(() => {
      result.current.handleTabChange('cost')
    })
    expect(result.current.activeTab).toBe('cost')
  })

  it('setCostDisplayMode to BTC changes costDisplayMode branch in energyCostChartData', () => {
    const { result } = renderHook(() => useEnergyBalance())
    act(() => {
      result.current.setCostDisplayMode('BTC')
    })
    expect(result.current.costDisplayMode).toBe('BTC')
  })

  it('isLoading is true when a response is loading', () => {
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: true,
      error: null,
    })
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.isLoading).toBe(true)
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
  })

  it('isLoading is true when nominalConfigValues is loading', () => {
    mockFns.nominalConfigValues.mockReturnValue({
      nominalAvailablePowerMWh: 100,
      isLoading: true,
    })
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.isLoading).toBe(true)
    mockFns.nominalConfigValues.mockReturnValue({
      nominalAvailablePowerMWh: 100,
      isLoading: false,
    })
  })

  it('errors array populated when response has error', () => {
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: new Error('API error'),
    })
    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.errors.length).toBeGreaterThan(0)
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
  })

  it('processData runs full path when all data present and currentBTCPrice > 0', () => {
    mockFns.currentBTCPrice.mockReturnValue({
      currentBTCPrice: 50000,
      isLoading: false,
      error: null,
      data: { price: 50000 },
    })
    mockFns.minerpoolTransactions.mockReturnValue({
      data: [[]],
      isLoading: false,
      error: null,
    })
    mockFns.historicalBTCPrices.mockReturnValue({
      data: [[]],
      isLoading: false,
      error: null,
    })
    mockFns.productionCosts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockFns.powerConsumption.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
    mockFns.electricityCurtailment.mockReturnValue({
      data: [[]],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.aggregatedData).toBeDefined()

    // restore
    mockFns.currentBTCPrice.mockReturnValue({
      currentBTCPrice: 0,
      isLoading: false,
      error: null,
      data: undefined as unknown,
    })
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.historicalBTCPrices.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.productionCosts.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.powerConsumption.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.electricityCurtailment.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
  })

  it('processData handles powerData with nested array containing powermeter item', () => {
    mockFns.currentBTCPrice.mockReturnValue({
      currentBTCPrice: 50000,
      isLoading: false,
      error: null,
      data: { price: 50000 },
    })
    mockFns.minerpoolTransactions.mockReturnValue({ data: [[]], isLoading: false, error: null })
    mockFns.historicalBTCPrices.mockReturnValue({ data: [[]], isLoading: false, error: null })
    mockFns.productionCosts.mockReturnValue({ data: [], isLoading: false, error: null })
    mockFns.powerConsumption.mockReturnValue({
      data: [[{ type: 'powermeter', data: [] }]],
      isLoading: false,
      error: null,
    })
    mockFns.electricityCurtailment.mockReturnValue({ data: [[]], isLoading: false, error: null })

    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.aggregatedData).toBeDefined()

    // restore
    mockFns.currentBTCPrice.mockReturnValue({
      currentBTCPrice: 0,
      isLoading: false,
      error: null,
      data: undefined as unknown,
    })
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.historicalBTCPrices.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.productionCosts.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.powerConsumption.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.electricityCurtailment.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
  })

  it('processData handles powerData with flat array item of type powermeter', () => {
    mockFns.currentBTCPrice.mockReturnValue({
      currentBTCPrice: 50000,
      isLoading: false,
      error: null,
      data: { price: 50000 },
    })
    mockFns.minerpoolTransactions.mockReturnValue({ data: [[]], isLoading: false, error: null })
    mockFns.historicalBTCPrices.mockReturnValue({ data: [[]], isLoading: false, error: null })
    mockFns.productionCosts.mockReturnValue({ data: [], isLoading: false, error: null })
    mockFns.powerConsumption.mockReturnValue({
      data: [{ type: 'powermeter', data: [] }],
      isLoading: false,
      error: null,
    })
    mockFns.electricityCurtailment.mockReturnValue({ data: [[]], isLoading: false, error: null })

    const { result } = renderHook(() => useEnergyBalance())
    expect(result.current.aggregatedData).toBeDefined()

    // restore
    mockFns.currentBTCPrice.mockReturnValue({
      currentBTCPrice: 0,
      isLoading: false,
      error: null,
      data: undefined as unknown,
    })
    mockFns.minerpoolTransactions.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.historicalBTCPrices.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.productionCosts.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.powerConsumption.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
    mockFns.electricityCurtailment.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      error: null,
    })
  })
})
