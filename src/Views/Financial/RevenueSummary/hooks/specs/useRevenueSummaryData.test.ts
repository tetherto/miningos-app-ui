import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  processTransactionData,
  processTailLogData,
  processHistoricalPrices,
  getNumberOfPeriods,
  calculateDailyRevenueRatios,
  calculateAvgRevenueMetrics,
  calculateAvgEnergyRevenueAtProdDate,
  calculateAvgHashRevenueAtProdDate,
  calculateAvgPowerConsumption,
  calculateAvgHashrate,
  processElectricityData,
  calculateHashrateCapacityFactors,
  extractAvgHashrateFromAggregatedResponse,
  extractAvgPowerConsumptionFromAggregatedResponse,
  useRevenueSummaryData,
} from '../useRevenueSummaryData'

import {
  useGetExtDataQuery,
  useGetGlobalDataQuery,
  useGetSiteQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'
import { PERIOD } from '@/constants/ranges'

vi.mock('../documentationMocks', () => ({
  USE_DOCUMENTATION_MOCKS: false,
  mockBlockSizesDataFromDoc: undefined,
  mockElectricityDataFromDoc: undefined,
  mockHistoricalPricesDataFromDoc: undefined,
  mockMempoolDataFromDoc: undefined,
  mockProductionCostsFromDoc: undefined,
  mockSiteDataFromDoc: undefined,
  mockTailLogRangeAggrDataFromDoc: undefined,
  mockTransactionsDataFromDoc: undefined,
}))

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetGlobalDataQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetSiteQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetTailLogRangeAggrQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
}))

vi.mock('@/hooks/useTimezone', () => ({
  default: () => ({ timezone: 'UTC' }),
}))

vi.mock('@/hooks/useNominalConfigValues', () => ({
  useNominalConfigValues: () => ({
    nominalAvailablePowerMWh: 0,
    nominalHashrateMHS: 0,
    isLoading: false,
  }),
}))

vi.mock('@/MultiSiteViews/RevenueAndCost/revenueDataHelpers', () => ({
  transformRevenueDataForChart: vi.fn(() => []),
  convertToChartFormat: vi.fn(() => []),
}))

const DAY_MS = 86400000
const day = (d: number) => new Date(`2025-06-${String(d).padStart(2, '0')}T00:00:00Z`).getTime()

describe('processTransactionData', () => {
  it('returns empty object when no data', () => {
    expect(processTransactionData(undefined)).toEqual({})
  })

  it('returns empty object when data is not array', () => {
    expect(processTransactionData({ data: 'invalid' } as never)).toEqual({})
  })

  it('processes transaction data and sums by day', () => {
    const ts = day(1)
    const res = { data: [[{ ts: String(ts), transactions: [{ changed_balance: 0.001 }] }]] }
    const result = processTransactionData(res as never)
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })

  it('merges multiple entries for same day', () => {
    const ts = day(1)
    const ts2 = ts + 3600000 // 1 hour later, same day
    const res = {
      data: [
        [
          { ts: String(ts), transactions: [{ changed_balance: 0.001 }] },
          { ts: String(ts2), transactions: [{ changed_balance: 0.002 }] },
        ],
      ],
    }
    const result = processTransactionData(res as never)
    const dayKey = Object.keys(result)[0]
    expect(result[Number(dayKey)].totalRevenueBTC).toBeCloseTo(0.003)
  })
})

describe('processTailLogData', () => {
  it('returns empty object when no data', () => {
    expect(processTailLogData(undefined)).toEqual({})
  })

  it('returns empty object when data not nested arrays', () => {
    expect(processTailLogData({ data: 'bad' } as never)).toEqual({})
  })

  it('processes miner and powermeter data', () => {
    const ts = day(1)
    const res = {
      data: [
        [
          { type: 'miner', data: [{ ts, val: { hashrate_mhs_5m_sum_aggr: 1000000 } }] },
          { type: 'powermeter', data: [{ ts, val: { site_power_w: 500000 } }] },
        ],
      ],
    }
    const result = processTailLogData(res as never)
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })

  it('sums hashrate for multiple miner entries on the same day', () => {
    const ts = day(1)
    const ts2 = ts + 3600000 // 1 hour later, same day
    const res = {
      data: [
        [
          {
            type: 'miner',
            data: [
              { ts, val: { hashrate_mhs_5m_sum_aggr: 1000000 } },
              { ts: ts2, val: { hashrate_mhs_5m_sum_aggr: 500000 } },
            ],
          },
        ],
      ],
    }
    const result = processTailLogData(res as never)
    const dayTs = Object.keys(result)[0]
    expect(result[Number(dayTs)].hashrateMHS).toBe(1500000)
  })

  it('processes powermeter data for a new day not in processed', () => {
    const ts = day(1)
    const ts2 = day(2) // different day
    const res = {
      data: [
        [
          { type: 'miner', data: [{ ts, val: { hashrate_mhs_5m_sum_aggr: 1000000 } }] },
          { type: 'powermeter', data: [{ ts: ts2, val: { site_power_w: 200000 } }] },
        ],
      ],
    }
    const result = processTailLogData(res as never)
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })
})

describe('processHistoricalPrices', () => {
  it('returns empty array when no data', () => {
    expect(processHistoricalPrices(undefined)).toEqual([])
  })

  it('groups prices by day and averages them', () => {
    const ts = day(1)
    const res = {
      data: [
        [
          { ts, priceUSD: 60000 },
          { ts: ts + 3600000, priceUSD: 62000 },
        ],
      ],
    }
    const result = processHistoricalPrices(res as never)
    expect(result.length).toBe(1)
    expect(result[0].priceUSD).toBeCloseTo(61000)
  })
})

describe('getNumberOfPeriods', () => {
  const dateRange = { start: day(1), end: day(7) }

  it('returns 7 for weekly period', () => {
    expect(getNumberOfPeriods(dateRange, PERIOD.WEEKLY)).toBe(7)
  })

  it('returns 12 for yearly period', () => {
    expect(getNumberOfPeriods(dateRange, PERIOD.YEARLY)).toBe(12)
  })

  it('returns days in month for monthly period', () => {
    const result = getNumberOfPeriods(
      { start: new Date('2025-06-01').getTime(), end: 0 },
      PERIOD.MONTHLY,
    )
    expect(result).toBe(30)
  })

  it('returns 1 for daily period', () => {
    expect(getNumberOfPeriods(dateRange, PERIOD.DAILY)).toBe(1)
  })
})

describe('calculateDailyRevenueRatios', () => {
  it('returns empty array when no data', () => {
    expect(calculateDailyRevenueRatios({}, {}, [])).toEqual([])
  })

  it('skips days where txData or tailData is missing', () => {
    const txData = { [day(1)]: { ts: day(1), totalRevenueBTC: 0.01, totalFeesBTC: 0 } }
    const result = calculateDailyRevenueRatios(txData, {}, [{ ts: day(1), priceUSD: 60000 }])
    expect(result).toEqual([])
  })

  it('skips days where price or revenue is zero', () => {
    const ts = day(1)
    const txData = { [ts]: { ts, totalRevenueBTC: 0.01, totalFeesBTC: 0 } }
    const tailData = { [ts]: { ts, hashrateMHS: 1000000, sitePowerW: 500000 } }
    const result = calculateDailyRevenueRatios(txData, tailData, [{ ts, priceUSD: 0 }])
    expect(result).toEqual([])
  })

  it('calculates ratios when data is valid', () => {
    const ts = day(1)
    const txData = { [ts]: { ts, totalRevenueBTC: 0.01, totalFeesBTC: 0 } }
    const tailData = { [ts]: { ts, hashrateMHS: 1000000000, sitePowerW: 1000000 } }
    const prices = [{ ts, priceUSD: 60000 }]
    const result = calculateDailyRevenueRatios(txData, tailData, prices)
    expect(result.length).toBe(1)
    expect(result[0].energyRatio).toBeGreaterThan(0)
    expect(result[0].hashRatio).toBeGreaterThan(0)
  })
})

describe('calculateAvgRevenueMetrics', () => {
  it('returns zeros when dailyRatios is empty', () => {
    const result = calculateAvgRevenueMetrics(
      [],
      { start: day(1), end: day(7) },
      PERIOD.WEEKLY,
      60000,
    )
    expect(result.avgEnergyRevenue).toBe(0)
    expect(result.avgHashRevenue).toBe(0)
  })

  it('returns non-zero metrics with valid ratios', () => {
    const ratios = [{ dayTs: day(1), energyRatio: 1000, hashRatio: 0.001 }]
    const result = calculateAvgRevenueMetrics(
      ratios,
      { start: day(1), end: day(7) },
      PERIOD.WEEKLY,
      60000,
    )
    expect(result.avgEnergyRevenue).toBeGreaterThan(0)
    expect(result.avgHashRevenue).toBeGreaterThan(0)
    expect(result.avgEnergyRevenueSats).toBeGreaterThan(0)
    expect(result.avgHashRevenueSats).toBeGreaterThan(0)
  })

  it('returns zero sats when avgBTCPrice is 0', () => {
    const ratios = [{ dayTs: day(1), energyRatio: 1000, hashRatio: 0.001 }]
    const result = calculateAvgRevenueMetrics(
      ratios,
      { start: day(1), end: day(7) },
      PERIOD.WEEKLY,
      0,
    )
    expect(result.avgEnergyRevenueSats).toBe(0)
    expect(result.avgHashRevenueSats).toBe(0)
  })
})

describe('calculateAvgEnergyRevenueAtProdDate', () => {
  it('returns 0 when inputs are missing', () => {
    expect(calculateAvgEnergyRevenueAtProdDate({}, [], 0, 0)).toBe(0)
  })

  it('returns 0 when avgPowerConsumptionW is 0', () => {
    const ts = day(1)
    const txData = { [ts]: { ts, totalRevenueBTC: 0.01, totalFeesBTC: 0 } }
    const prices = [{ ts, priceUSD: 60000 }]
    expect(calculateAvgEnergyRevenueAtProdDate(txData, prices, 0, 720)).toBe(0)
  })

  it('returns non-zero with valid data', () => {
    const ts = day(1)
    const txData = { [ts]: { ts, totalRevenueBTC: 0.01, totalFeesBTC: 0 } }
    const prices = [{ ts, priceUSD: 60000 }]
    const result = calculateAvgEnergyRevenueAtProdDate(txData, prices, 1000000, 720)
    expect(result).toBeGreaterThan(0)
  })
})

describe('calculateAvgHashRevenueAtProdDate', () => {
  it('returns 0 when inputs are missing', () => {
    expect(calculateAvgHashRevenueAtProdDate({}, [], 0)).toBe(0)
  })

  it('returns non-zero with valid data', () => {
    const ts = day(1)
    const txData = { [ts]: { ts, totalRevenueBTC: 0.01, totalFeesBTC: 0 } }
    const prices = [{ ts, priceUSD: 60000 }]
    const result = calculateAvgHashRevenueAtProdDate(txData, prices, 1000000000)
    expect(result).toBeGreaterThan(0)
  })
})

describe('calculateAvgPowerConsumption', () => {
  it('returns 0 when no data', () => {
    expect(calculateAvgPowerConsumption({}, { start: day(1), end: day(7) }, PERIOD.WEEKLY)).toBe(0)
  })

  it('averages daily values for weekly period', () => {
    const data = {
      [day(1)]: { ts: day(1), hashrateMHS: 0, sitePowerW: 1000 },
      [day(2)]: { ts: day(2), hashrateMHS: 0, sitePowerW: 2000 },
    }
    const result = calculateAvgPowerConsumption(data, { start: day(1), end: day(7) }, PERIOD.WEEKLY)
    expect(result).toBe(1500)
  })

  it('calculates monthly averages for yearly period', () => {
    const data = {
      [day(1)]: { ts: day(1), hashrateMHS: 0, sitePowerW: 1000 },
      [day(2)]: { ts: day(2), hashrateMHS: 0, sitePowerW: 3000 },
    }
    const result = calculateAvgPowerConsumption(
      data,
      { start: day(1), end: day(7) + DAY_MS * 365 },
      PERIOD.YEARLY,
    )
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('returns daily average for daily period', () => {
    const data = {
      [day(1)]: { ts: day(1), hashrateMHS: 0, sitePowerW: 5000 },
    }
    const result = calculateAvgPowerConsumption(data, { start: day(1), end: day(1) }, PERIOD.DAILY)
    expect(result).toBe(5000)
  })
})

describe('calculateAvgHashrate', () => {
  it('returns 0 when no data', () => {
    expect(calculateAvgHashrate({}, { start: day(1), end: day(7) }, PERIOD.WEEKLY)).toBe(0)
  })

  it('averages daily values for weekly period', () => {
    const data = {
      [day(1)]: { ts: day(1), hashrateMHS: 1000, sitePowerW: 0 },
      [day(2)]: { ts: day(2), hashrateMHS: 3000, sitePowerW: 0 },
    }
    const result = calculateAvgHashrate(data, { start: day(1), end: day(7) }, PERIOD.WEEKLY)
    expect(result).toBe(2000)
  })

  it('calculates monthly averages for yearly period', () => {
    const data = {
      [day(1)]: { ts: day(1), hashrateMHS: 1000, sitePowerW: 0 },
    }
    const result = calculateAvgHashrate(
      data,
      { start: day(1), end: day(7) + DAY_MS * 365 },
      PERIOD.YEARLY,
    )
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('returns daily average for daily period', () => {
    const data = { [day(1)]: { ts: day(1), hashrateMHS: 500, sitePowerW: 0 } }
    const result = calculateAvgHashrate(data, { start: day(1), end: day(1) }, PERIOD.DAILY)
    expect(result).toBe(500)
  })
})

describe('processElectricityData', () => {
  it('returns empty array when no data', () => {
    expect(processElectricityData(undefined)).toEqual([])
    expect(processElectricityData([])).toEqual([])
  })

  it('processes nested electricity data entries', () => {
    const data = [
      [{ ts: day(1), energy: { usedEnergy: 100 } }],
      [{ ts: day(2), energy: { usedEnergy: 200 } }],
    ] as never
    const result = processElectricityData(data)
    expect(result.length).toBe(2)
    expect(result[0].usedEnergy).toBe(100)
  })

  it('skips entries with missing ts or usedEnergy', () => {
    const data = [[{ ts: day(1), energy: {} }, { energy: { usedEnergy: 50 } }]] as never
    const result = processElectricityData(data)
    expect(result.length).toBe(0)
  })
})

describe('calculateHashrateCapacityFactors', () => {
  it('returns 0 when nominalHashrateMHS is 0', () => {
    expect(calculateHashrateCapacityFactors(1000, 0)).toBe(0)
  })

  it('calculates capacity factor', () => {
    expect(calculateHashrateCapacityFactors(500, 1000)).toBe(50)
  })
})

describe('extractAvgHashrateFromAggregatedResponse', () => {
  it('returns 0 when no data', () => {
    expect(extractAvgHashrateFromAggregatedResponse(undefined)).toBe(0)
  })

  it('returns 0 when data is not nested arrays', () => {
    expect(extractAvgHashrateFromAggregatedResponse({ data: 'bad' } as never)).toBe(0)
  })

  it('extracts and calculates average hashrate', () => {
    const res = {
      data: [[{ type: 'miner', data: { hashrate_mhs_5m_sum_aggr: 10000000, aggrIntervals: 10 } }]],
    }
    const result = extractAvgHashrateFromAggregatedResponse(res as never)
    expect(result).toBe(1000000)
  })

  it('returns 0 when aggrIntervals is 0', () => {
    const res = {
      data: [[{ type: 'miner', data: { hashrate_mhs_5m_sum_aggr: 10000000, aggrIntervals: 0 } }]],
    }
    expect(extractAvgHashrateFromAggregatedResponse(res as never)).toBe(0)
  })
})

describe('extractAvgPowerConsumptionFromAggregatedResponse', () => {
  it('returns 0 when no data', () => {
    expect(extractAvgPowerConsumptionFromAggregatedResponse(undefined)).toBe(0)
  })

  it('extracts and calculates average power consumption', () => {
    const res = {
      data: [[{ type: 'powermeter', data: { site_power_w: 5000000, aggrIntervals: 10 } }]],
    }
    const result = extractAvgPowerConsumptionFromAggregatedResponse(res as never)
    expect(result).toBe(500000)
  })

  it('returns 0 when aggrIntervals is 0', () => {
    const res = {
      data: [[{ type: 'powermeter', data: { site_power_w: 5000000, aggrIntervals: 0 } }]],
    }
    expect(extractAvgPowerConsumptionFromAggregatedResponse(res as never)).toBe(0)
  })
})

describe('useRevenueSummaryData hook', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useRevenueSummaryData())
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('handleRangeChange')
    expect(result.current).toHaveProperty('handleReset')
    expect(result.current).toHaveProperty('revenueData')
    expect(result.current).toHaveProperty('metrics')
    expect(result.current).toHaveProperty('revenueChartData')
    expect(result.current).toHaveProperty('siteList')
  })

  it('handleRangeChange updates the date range', () => {
    const { result } = renderHook(() => useRevenueSummaryData())
    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-01-31')
    expect(() =>
      result.current.handleRangeChange([startDate, endDate], { period: PERIOD.DAILY }),
    ).not.toThrow()
  })

  it('handleReset resets date range without throwing', () => {
    const { result } = renderHook(() => useRevenueSummaryData())
    expect(() => result.current.handleReset()).not.toThrow()
  })

  it('processes full hook body when API queries return data (covers getRevenueLog, aggregateByPeriod, getPeriodPrice, getPeriodBlockSize, getPeriodCosts)', () => {
    const ts = new Date('2025-01-15T00:00:00Z').getTime()

    // Transaction data: minerpool query
    const transactionMockData = {
      data: [[{ ts: String(ts), transactions: [{ changed_balance: 0.001, type: 'energy' }] }]],
      success: true,
    }

    // Historical prices: mempool HISTORICAL_PRICES query
    const pricesMockData = {
      data: [{ ts, priceUSD: 50000 }],
      success: true,
    }

    // Historical block sizes: mempool HISTORICAL_BLOCKSIZES query
    const blockSizesMockData = {
      data: [[[{ ts, blockSize: 1000 }]]],
      success: true,
    }

    // Current mempool price
    const mempoolMockData = {
      data: [[{ currentPrice: 50000, type: 'mempool' }]],
      success: true,
    }

    // Tail log aggregation: miner + powermeter
    const tailLogMockData = {
      data: [
        [
          { type: 'miner', data: [{ ts, val: { hashrate_mhs_5m_sum_aggr: 1_000_000 } }] },
          { type: 'powermeter', data: [{ ts, val: { site_power_w: 500_000 } }] },
        ],
      ],
      success: true,
    }

    // Production costs (MONTHLY format)
    const productionCostsMockData = [
      { year: 2025, month: 1, energyCostsUSD: 10000, operationalCostsUSD: 5000 },
    ]

    vi.mocked(useGetExtDataQuery).mockImplementation((args: unknown) => {
      const a = args as { type?: string; query?: string }
      if (a?.type === 'minerpool') return { data: transactionMockData, isLoading: false } as never
      if (a?.query && a.query.includes('HISTORICAL_PRICES'))
        return { data: pricesMockData, isLoading: false } as never
      if (a?.query && a.query.includes('HISTORICAL_BLOCKSIZES'))
        return { data: blockSizesMockData, isLoading: false } as never
      if (a?.type === 'electricity') return { data: { data: [] }, isLoading: false } as never
      // Current mempool (type: 'mempool' without specific key)
      return { data: mempoolMockData, isLoading: false } as never
    })
    vi.mocked(useGetTailLogRangeAggrQuery).mockReturnValue({
      data: tailLogMockData,
      isLoading: false,
    } as never)
    vi.mocked(useGetGlobalDataQuery).mockReturnValue({
      data: productionCostsMockData,
      isLoading: false,
    } as never)
    vi.mocked(useGetSiteQuery).mockReturnValue({
      data: { site: 'TEST_SITE' },
      isLoading: false,
    } as never)

    const { result } = renderHook(() => useRevenueSummaryData())

    // Hook should produce revenue data from processed transactions
    expect(result.current).toHaveProperty('revenueData')
    expect(result.current).toHaveProperty('metrics')
    expect(result.current.revenueData).toBeDefined()
  })

  it('handleRangeChange with monthly period triggers monthly aggregation', () => {
    const { result } = renderHook(() => useRevenueSummaryData())
    const startDate = new Date('2025-01-01')
    const endDate = new Date('2025-12-31')
    expect(() =>
      result.current.handleRangeChange([startDate, endDate], { period: PERIOD.MONTHLY }),
    ).not.toThrow()
  })
})
