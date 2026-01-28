import { calculateTransactionSum } from '../transactionUtils'

import { mockTransactionsDataFromDoc } from '@/Views/Financial/RevenueSummary/hooks/documentationMocks'

describe('transactionUtils', () => {
  describe('calculateTransactionSum', () => {
    test('returns zero values for empty array', () => {
      const result = calculateTransactionSum([])
      expect(result).toEqual({ revenueBTC: 0, feesBTC: 0 })
    })

    test('returns zero values for null transactions', () => {
      const result = calculateTransactionSum(null as unknown as [])
      expect(result).toEqual({ revenueBTC: 0, feesBTC: 0 })
    })

    test('returns zero values for undefined transactions', () => {
      const result = calculateTransactionSum(undefined as unknown as [])
      expect(result).toEqual({ revenueBTC: 0, feesBTC: 0 })
    })

    describe('new format (changed_balance)', () => {
      test('calculates revenue and fees correctly', () => {
        const transactions = [
          {
            changed_balance: 0.5,
            mining_extra: { tx_fee: 0.01 },
          },
          {
            changed_balance: 0.3,
            mining_extra: { tx_fee: 0.005 },
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.8, feesBTC: 0.015 })
      })

      test('handles missing tx_fee in mining_extra', () => {
        const transactions = [
          {
            changed_balance: 0.5,
            mining_extra: {},
          },
          {
            changed_balance: 0.3,
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.8, feesBTC: 0 })
      })

      test('handles missing mining_extra', () => {
        const transactions = [
          {
            changed_balance: 0.5,
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.5, feesBTC: 0 })
      })

      test('handles zero values', () => {
        const transactions = [
          {
            changed_balance: 0,
            mining_extra: { tx_fee: 0 },
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0, feesBTC: 0 })
      })

      test('handles negative values', () => {
        const transactions = [
          {
            changed_balance: -0.1,
            mining_extra: { tx_fee: -0.01 },
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: -0.1, feesBTC: -0.01 })
      })
    })

    describe('old format (satoshis_net_earned)', () => {
      test('converts satoshis to BTC correctly', () => {
        const transactions = [
          {
            satoshis_net_earned: 50_000_000, // 0.5 BTC
            fees_colected_satoshis: 1_000_000, // 0.01 BTC
          },
          {
            satoshis_net_earned: 30_000_000, // 0.3 BTC
            fees_colected_satoshis: 500_000, // 0.005 BTC
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.8, feesBTC: 0.015 })
      })

      test('handles missing fees_colected_satoshis', () => {
        const transactions = [
          {
            satoshis_net_earned: 50_000_000,
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.5, feesBTC: 0 })
      })

      test('handles zero satoshis', () => {
        const transactions = [
          {
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0, feesBTC: 0 })
      })

      test('handles single satoshi', () => {
        const transactions = [
          {
            satoshis_net_earned: 1,
            fees_colected_satoshis: 1,
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({
          revenueBTC: 0.00000001,
          feesBTC: 0.00000001,
        })
      })
    })

    describe('mixed formats', () => {
      test('handles both formats in same array', () => {
        const transactions = [
          {
            changed_balance: 0.5,
            mining_extra: { tx_fee: 0.01 },
          },
          {
            satoshis_net_earned: 30_000_000, // 0.3 BTC
            fees_colected_satoshis: 500_000, // 0.005 BTC
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.8, feesBTC: 0.015 })
      })

      test('prioritizes changed_balance over satoshis_net_earned', () => {
        const transactions = [
          {
            changed_balance: 0.5,
            satoshis_net_earned: 100_000_000, // Should be ignored
            mining_extra: { tx_fee: 0.01 },
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0.5, feesBTC: 0.01 })
      })
    })

    describe('edge cases', () => {
      test('handles transactions with neither format', () => {
        const transactions = [
          {
            someOtherField: 123,
          },
          {},
        ] as Parameters<typeof calculateTransactionSum>[0]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 0, feesBTC: 0 })
      })

      test('handles large numbers', () => {
        const transactions = [
          {
            changed_balance: 1000,
            mining_extra: { tx_fee: 10 },
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result).toEqual({ revenueBTC: 1000, feesBTC: 10 })
      })

      test('handles many transactions', () => {
        const transactions = Array.from({ length: 100 }, (_, i) => ({
          changed_balance: 0.01,
          mining_extra: { tx_fee: 0.001 },
        }))
        const result = calculateTransactionSum(transactions)
        expect(result.revenueBTC).toBeCloseTo(1.0, 10)
        expect(result.feesBTC).toBeCloseTo(0.1, 10)
      })

      test('handles decimal precision correctly', () => {
        const transactions = [
          {
            changed_balance: 0.123456789,
            mining_extra: { tx_fee: 0.000000001 },
          },
        ]
        const result = calculateTransactionSum(transactions)
        expect(result.revenueBTC).toBeCloseTo(0.123456789, 9)
        expect(result.feesBTC).toBeCloseTo(0.000000001, 9)
      })
    })

    describe('documentation mocks', () => {
      test('calculates sum for a few transactions from documentation mock', () => {
        // Extract first 3 transactions from mock data
        const transactions = mockTransactionsDataFromDoc.data[0]
          .slice(0, 3)
          .flatMap((day) => day.transactions) as Parameters<typeof calculateTransactionSum>[0]

        const result = calculateTransactionSum(transactions)

        // Each transaction has changed_balance: 0.0007894665835364325
        // Expected revenue: 3 * 0.0007894665835364325 = 0.0023683997506092975
        expect(result.revenueBTC).toBeCloseTo(0.002368399750609298, 15)

        // Each transaction has tx_fee: 0.000007680034141740668
        // Expected fees: 3 * 0.000007680034141740668 = 0.000023040102425222004
        expect(result.feesBTC).toBeCloseTo(0.000023040102425222004, 15)
      })

      test('calculates sum for all transactions from documentation mock', () => {
        // Extract all transactions from mock data
        const transactions = mockTransactionsDataFromDoc.data[0].flatMap(
          (day) => day.transactions,
        ) as Parameters<typeof calculateTransactionSum>[0]

        const result = calculateTransactionSum(transactions)

        // According to documentation: Total Bitcoin: 0.02368399750609298 BTC
        // There are 30 transactions, each with changed_balance: 0.0007894665835364325
        // 30 * 0.0007894665835364325 = 0.023683997506092975
        expect(result.revenueBTC).toBeCloseTo(0.02368399750609298, 15)

        // Each transaction has tx_fee: 0.000007680034141740668
        // 30 * 0.000007680034141740668 = 0.00023040102425222004
        expect(result.feesBTC).toBeCloseTo(0.00023040102425222, 15)
      })
    })
  })
})
