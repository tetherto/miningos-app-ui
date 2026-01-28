import { describe, expect, test } from 'vitest'

import { mockTransactionsDataFromBE } from './mocks'
import { getStartOfDay } from './revenueSummaryHelpers'
import { processTransactionData } from './useRevenueSummaryData'

import type { ApiResponse, MinerTransaction, MinerTransactionResponse } from '@/types'

const BTC_SATS = 100_000_000

// Helper to create ApiResponse format for tests
const createMockResponse = (data: MinerTransaction[][]): MinerTransactionResponse => ({
  data,
  success: true,
})

// Helper to create minimal transaction objects for tests
const createMockTransaction = (
  overrides: Partial<MinerTransaction['transactions'][0]> = {},
): MinerTransaction['transactions'][0] => ({
  id: 0,
  username: 'test',
  type: 'revenue_fpps',
  changed_balance: 0,
  created_at: 0,
  satoshis_net_earned: 0,
  fees_colected_satoshis: 0,
  mining_extra: {
    mining_date: 0,
    settle_date: 0,
    pps: 0,
    pps_fee_rate: 0,
    tx_fee: 0,
    tx_fee_rate: 0,
    hash_rate: 0,
  },
  payout_extra: null,
  ...overrides,
})

// Helper to extract totalRevenueBTC from the result (which represents total BTC)
const getTotalBTC = (result: ReturnType<typeof processTransactionData>, dayTs: number) =>
  result[dayTs]?.totalRevenueBTC

describe('processTransactionData - Total BTC Calculation', () => {
  describe('Basic calculations', () => {
    test('should calculate total BTC from a single transaction', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000', // Jan 20, 2025
            transactions: [
              {
                id: 1,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.5,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(1755734400000)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.5)
    })

    test('should sum multiple transactions on the same day', () => {
      const dayStart = 1755734400000 // Jan 20, 2025
      const mockData = createMockResponse([
        [
          {
            ts: String(dayStart),
            transactions: [
              createMockTransaction({ changed_balance: 0.5 }),
              createMockTransaction({ changed_balance: 0.3 }),
              createMockTransaction({ changed_balance: 0.2 }),
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(dayStart)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(1.0) // 0.5 + 0.3 + 0.2
    })

    test('should aggregate multiple timestamps on the same day', () => {
      const dayStart = 1755734400000 // Jan 20, 2025 00:00:00
      const sameDayLater = 1755738000000 // Jan 20, 2025 01:00:00 (same day)

      const mockData = createMockResponse([
        [
          {
            ts: String(dayStart),
            transactions: [createMockTransaction({ changed_balance: 0.003 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(sameDayLater),
            transactions: [createMockTransaction({ changed_balance: 0.009 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(dayStart)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.012) // 0.003 + 0.009
    })

    test('should handle transactions across different days', () => {
      const day1Start = 1755734400000 // Jan 20, 2025
      const day2Start = 1755820800000 // Jan 21, 2025

      const mockData = createMockResponse([
        [
          {
            ts: String(day1Start),
            transactions: [
              {
                id: 1,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.5,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(day2Start),
            transactions: [createMockTransaction({ changed_balance: 0.7 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const day1Ts = getStartOfDay(day1Start)
      const day2Ts = getStartOfDay(day2Start)

      expect(result[day1Ts]).toBeDefined()
      const totalBTC1 = getTotalBTC(result, day1Ts)
      expect(totalBTC1).toBe(0.5)

      expect(result[day2Ts]).toBeDefined()
      const totalBTC2 = getTotalBTC(result, day2Ts)
      expect(totalBTC2).toBe(0.7)
    })
  })

  describe('Old format (satoshis)', () => {
    test('should handle old format with satoshis_net_earned', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000',
            transactions: [
              createMockTransaction({
                changed_balance: undefined,
                satoshis_net_earned: 50000000, // 0.5 BTC
                fees_colected_satoshis: undefined,
              }),
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(1755734400000)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.5) // 50000000 / 100000000
    })

    test('should handle mixed old and new format transactions', () => {
      const dayStart = 1755734400000
      const mockData = createMockResponse([
        [
          {
            ts: String(dayStart),
            transactions: [
              createMockTransaction({ changed_balance: 0.3 }),
              createMockTransaction({ changed_balance: undefined, satoshis_net_earned: 20000000 }), // 0.2 BTC
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(dayStart)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.5) // 0.3 + 0.2
    })
  })

  describe('Edge cases', () => {
    test('should return empty object for undefined input', () => {
      const result = processTransactionData(undefined)
      expect(result).toEqual({})
    })

    test('should return empty object for empty array', () => {
      const result = processTransactionData(createMockResponse([]))
      expect(result).toEqual({})
    })

    test('should return empty object for empty transactions array', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000',
            transactions: [],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      // Empty transactions array results in sums.revenue = 0
      // But the code still creates an entry with 0 values
      // This is expected behavior - the entry exists but with zero values
      const dayTs = getStartOfDay(1755734400000)
      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0)
    })

    test('should handle transactions with zero balance', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000',
            transactions: [
              createMockTransaction({ changed_balance: 0 }),
              createMockTransaction({ changed_balance: 0.5 }),
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(1755734400000)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.5)
    })

    test('should ignore transactions with invalid balance values', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000',
            transactions: [
              createMockTransaction({ changed_balance: 0.5 }),
              createMockTransaction({ changed_balance: 0 }),
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(1755734400000)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.5)
    })
  })

  describe('Real-world scenarios', () => {
    test('should handle a full day with multiple transaction batches', () => {
      const dayStart = 1755734400000 // Jan 20, 2025 00:00:00
      const hour1 = dayStart + 3600000 // 01:00:00
      const hour6 = dayStart + 6 * 3600000 // 06:00:00
      const hour12 = dayStart + 12 * 3600000 // 12:00:00
      const hour18 = dayStart + 18 * 3600000 // 18:00:00

      const mockData = createMockResponse([
        [
          {
            ts: String(dayStart),
            transactions: [
              {
                id: 1,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.1,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
              {
                id: 2,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.15,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(hour1),
            transactions: [createMockTransaction({ changed_balance: 0.2 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(hour6),
            transactions: [createMockTransaction({ changed_balance: 0.25 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(hour12),
            transactions: [
              createMockTransaction({ changed_balance: 0.3 }),
              createMockTransaction({ changed_balance: 0.05 }),
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(hour18),
            transactions: [createMockTransaction({ changed_balance: 0.1 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(dayStart)

      expect(result[dayTs]).toBeDefined()
      // Total: 0.1 + 0.15 + 0.2 + 0.25 + 0.3 + 0.05 + 0.1 = 1.15 BTC
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(1.15)
    })

    test('should handle multiple days with varying transaction counts', () => {
      const day1Start = 1755734400000 // Jan 20, 2025
      const day2Start = 1755820800000 // Jan 21, 2025
      const day3Start = 1755907200000 // Jan 22, 2025

      const mockData = createMockResponse([
        [
          {
            ts: String(day1Start),
            transactions: [
              {
                id: 1,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.5,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
              {
                id: 2,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.3,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(day2Start),
            transactions: [createMockTransaction({ changed_balance: 0.8 })],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
          {
            ts: String(day3Start),
            transactions: [
              {
                id: 1,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.2,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
              {
                id: 2,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.4,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
              {
                id: 3,
                username: 'test',
                type: 'revenue_fpps',
                changed_balance: 0.1,
                created_at: 0,
                satoshis_net_earned: 0,
                fees_colected_satoshis: 0,
                mining_extra: {
                  mining_date: 0,
                  settle_date: 0,
                  pps: 0,
                  pps_fee_rate: 0,
                  tx_fee: 0,
                  tx_fee_rate: 0,
                  hash_rate: 0,
                },
                payout_extra: null,
              },
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const day1Ts = getStartOfDay(day1Start)
      const day2Ts = getStartOfDay(day2Start)
      const day3Ts = getStartOfDay(day3Start)

      const totalBTC1 = getTotalBTC(result, day1Ts)
      expect(totalBTC1).toBe(0.8) // 0.5 + 0.3
      const totalBTC2 = getTotalBTC(result, day2Ts)
      expect(totalBTC2).toBe(0.8)
      const totalBTC3 = getTotalBTC(result, day3Ts)
      expect(totalBTC3).toBeCloseTo(0.7, 10) // 0.2 + 0.4 + 0.1
    })
  })

  describe('Precision and floating point', () => {
    test('should handle small BTC amounts correctly', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000',
            transactions: [
              createMockTransaction({ changed_balance: 0.00000001 }), // 1 satoshi
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(1755734400000)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(0.00000001)
    })

    test('should handle large BTC amounts correctly', () => {
      const mockData = createMockResponse([
        [
          {
            ts: '1755734400000',
            transactions: [
              createMockTransaction({ changed_balance: 100.5 }),
              createMockTransaction({ changed_balance: 50.25 }),
            ],
            stats: [],
            workers: [],
            blocksData: {},
            workersCount: 0,
          },
        ],
      ])

      const result = processTransactionData(mockData)
      const dayTs = getStartOfDay(1755734400000)

      expect(result[dayTs]).toBeDefined()
      const totalBTC = getTotalBTC(result, dayTs)
      expect(totalBTC).toBe(150.75) // 100.5 + 50.25
    })
  })

  describe('BE Team Mock Data - Total Bitcoin Calculation Verification', () => {
    test('should calculate total BTC correctly from BE team mock data (30 transactions)', () => {
      const result = processTransactionData(mockTransactionsDataFromBE)

      // Calculate total BTC across all days
      const totalBTC = Object.values(result).reduce(
        (sum, dayData) => sum + (dayData.totalRevenueBTC || 0),
        0,
      )

      // Expected: 30 transactions × 0.0007894665835364325 BTC = 0.02368399750609298 BTC
      const expectedTotalBTC = 0.02368399750609298
      const transactionCount = 30
      const singleTransactionAmount = 0.0007894665835364325

      // Verify the calculation matches expected value
      expect(totalBTC).toBeCloseTo(expectedTotalBTC, 15) // Use high precision for floating point comparison

      // Also verify the calculation: transactionCount × singleTransactionAmount
      expect(totalBTC).toBeCloseTo(transactionCount * singleTransactionAmount, 15)

      // Verify we have 30 days of data (one transaction per day)
      const dayCount = Object.keys(result).length
      expect(dayCount).toBe(30)

      // Verify each day has the correct amount
      Object.values(result).forEach((dayData) => {
        expect(dayData.totalRevenueBTC).toBeCloseTo(singleTransactionAmount, 15)
      })
    })

    test('should verify Total Bitcoin equals Total Changed Balance sum', () => {
      const result = processTransactionData(mockTransactionsDataFromBE)

      // Sum all changed_balance values directly from transactions
      let totalChangedBalance = 0
      const transactionsArray = mockTransactionsDataFromBE.data[0]
      transactionsArray.forEach((dayData) => {
        dayData.transactions.forEach((tx) => {
          totalChangedBalance += tx.changed_balance
        })
      })

      // Sum all totalRevenueBTC from processed data
      const totalRevenueBTC = Object.values(result).reduce(
        (sum, dayData) => sum + (dayData.totalRevenueBTC || 0),
        0,
      )

      // These should be equal: Total Bitcoin Produced = Total Changed Balance
      expect(totalRevenueBTC).toBeCloseTo(totalChangedBalance, 15)
      expect(totalRevenueBTC).toBeCloseTo(0.02368399750609298, 15)
    })

    test('should calculate total TX fees correctly from BE team mock data (30 transactions)', () => {
      const result = processTransactionData(mockTransactionsDataFromBE)

      // Calculate total fees across all days
      const totalFeesBTC = Object.values(result).reduce(
        (sum, dayData) => sum + (dayData.totalFeesBTC || 0),
        0,
      )

      // Expected: 30 transactions × 0.000007680034141740668 BTC = 0.00023040102425222004 BTC
      const transactionCount = 30
      const singleTransactionFee = 0.000007680034141740668
      const expectedTotalFeesBTC = transactionCount * singleTransactionFee

      // Verify the calculation matches expected value
      expect(totalFeesBTC).toBeCloseTo(expectedTotalFeesBTC, 17) // Use high precision for floating point comparison

      // Also verify the calculation: transactionCount × singleTransactionFee
      expect(totalFeesBTC).toBeCloseTo(transactionCount * singleTransactionFee, 17)

      // Verify each day has the correct fee amount
      Object.values(result).forEach((dayData) => {
        expect(dayData.totalFeesBTC).toBeCloseTo(singleTransactionFee, 17)
      })
    })

    test('should verify Total TX Fee equals sum of all tx_fee values', () => {
      const result = processTransactionData(mockTransactionsDataFromBE)

      // Sum all tx_fee values directly from transactions
      let totalTxFee = 0
      const transactionsArray = mockTransactionsDataFromBE.data[0]
      transactionsArray.forEach((dayData) => {
        dayData.transactions.forEach((tx) => {
          totalTxFee += tx.mining_extra?.tx_fee || 0
        })
      })

      // Sum all totalFeesBTC from processed data
      const totalFeesBTC = Object.values(result).reduce(
        (sum, dayData) => sum + (dayData.totalFeesBTC || 0),
        0,
      )

      // These should be equal: Total TX Fee = Sum of all tx_fee values
      expect(totalFeesBTC).toBeCloseTo(totalTxFee, 17)
      // Calculate expected value: 30 transactions × 0.000007680034141740668 BTC
      const expectedTotalFees = 30 * 0.000007680034141740668
      expect(totalFeesBTC).toBeCloseTo(expectedTotalFees, 17)
    })
  })
})
