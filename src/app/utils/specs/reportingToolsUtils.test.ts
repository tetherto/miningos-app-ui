import _map from 'lodash/map'
import { vi } from 'vitest'

import { getUteEnergyAggrDataset } from '../electricityUtils'
import {
  aggregateF2PoolStats,
  aggregateF2PoolSnapLog,
  convertRevenue,
  aggregatePoolRevenue,
  aggregateMiningExtra,
  aggregateData,
  getRangeStatsKey,
  findClosestObjectToNextHour,
  getKunaEnergyAggr,
  getFormattedPoolName,
} from '../reportingToolsUtils'

import { DATE_RANGE } from '@/constants'

vi.mock('../electricityUtils', () => ({
  getUteEnergyAggrDataset: vi.fn(),
}))

describe('reportingToolsUtils', () => {
  afterEach(() => {
    vi.restoreAllMocks() // Restore original implementations after each test
  })

  describe('aggregateF2PoolStats', () => {
    test('aggregates single pool stats correctly', () => {
      const pool = [
        {
          stats: {
            balance: 100,
            containers: {
              'bitdeer-1a': {
                unsettled: 50,
                revenue_24h: 200,
                hashrate: 10,
                hashrate_1h: 50,
                hashrate_24h: 100,
                hashrate_stale_1h: 10,
                hashrate_stale_24h: 20,
                worker_count: 5,
                active_workers_count: 5,
              },
            },
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
            yearlyBalances: [],
          },
          raw_errors: ['error1'],
        },
      ]

      const ts = 123456789

      const result = aggregateF2PoolStats(pool, ts)

      expect(result).toEqual({
        raw_errors: ['error1'],
        ts: ts,
        balance: 100,
        containers: {
          'bitdeer-1a': {
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
          },
        },
        unsettled: 50,
        revenue_24h: 200,
        estimated_today_income: 0,
        hashrate: 10,
        hashrate_1h: 50,
        hashrate_24h: 100,
        hashrate_stale_1h: 10,
        hashrate_stale_24h: 20,
        key: 123456789,
        worker_count: 5,
        active_workers_count: 5,
        aggrCount: 0,
        aggrIntervals: 0,
        yearlyBalances: [],
      })
    })

    test('aggregates with empty values if stats is not present', () => {
      const pool = [{}]

      const ts = 123456789

      const result = aggregateF2PoolStats(pool, ts)

      expect(result).toEqual({
        raw_errors: [],
        ts: 123456789,
        aggrCount: 0,
        aggrIntervals: 0,
        balance: 0,
        containers: {},
        unsettled: 0,
        revenue_24h: 0,
        hashrate: 0,
        estimated_today_income: 0,
        hashrate_1h: 0,
        hashrate_24h: 0,
        hashrate_stale_1h: 0,
        hashrate_stale_24h: 0,
        key: 123456789,
        worker_count: 0,
        active_workers_count: 0,
        yearlyBalances: [],
      })
    })

    test('aggregates multiple pool stats correctly', () => {
      const pool = [
        {
          stats: {
            balance: 100,
            containers: {
              'bitdeer-1a': {
                unsettled: 50,
                revenue_24h: 200,
                hashrate: 10,
                hashrate_1h: 50,
                hashrate_24h: 100,
                hashrate_stale_1h: 10,
                hashrate_stale_24h: 20,
                worker_count: 5,
                active_workers_count: 5,
              },
            },
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
          },
          raw_errors: ['error1'],
        },
        {
          stats: {
            balance: 100,
            containers: {
              'bitdeer-1a': {
                unsettled: 50,
                revenue_24h: 200,
                hashrate: 10,
                hashrate_1h: 50,
                hashrate_24h: 100,
                hashrate_stale_1h: 10,
                hashrate_stale_24h: 20,
                worker_count: 5,
                active_workers_count: 5,
              },
            },
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
            yearlyBalances: [],
          },
          raw_errors: ['error2'],
        },
      ]

      const ts = 123456789

      const result = aggregateF2PoolStats(pool, ts)

      expect(result).toEqual({
        raw_errors: ['error1', 'error2'],
        ts: ts,
        aggrCount: 0,
        aggrIntervals: 0,
        balance: 200,
        containers: {
          'bitdeer-1a': {
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
          },
        },
        unsettled: 100,
        revenue_24h: 400,
        estimated_today_income: 0,
        hashrate: 20,
        hashrate_1h: 100,
        hashrate_24h: 200,
        hashrate_stale_1h: 20,
        hashrate_stale_24h: 40,
        key: 123456789,
        worker_count: 10,
        active_workers_count: 10,
        yearlyBalances: [],
      })
    })

    test('aggregates multiple pool stats with snap undefined correctly', () => {
      const pool = [
        {
          stats: {
            balance: 100,
            containers: {
              'bitdeer-1a': {
                unsettled: 50,
                revenue_24h: 200,
                hashrate: 10,
                hashrate_1h: 50,
                hashrate_24h: 100,
                hashrate_stale_1h: 10,
                hashrate_stale_24h: 20,
                worker_count: 5,
                active_workers_count: 5,
              },
            },
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
            yearlyBalances: [],
          },
          raw_errors: ['error1'],
        },
        undefined,
      ]

      const ts = 123456789

      const result = aggregateF2PoolStats(pool, ts)

      expect(result).toEqual({
        raw_errors: ['error1'],
        ts: ts,
        balance: 100,
        containers: {
          'bitdeer-1a': {
            unsettled: 50,
            revenue_24h: 200,
            hashrate: 10,
            hashrate_1h: 50,
            hashrate_24h: 100,
            hashrate_stale_1h: 10,
            hashrate_stale_24h: 20,
            worker_count: 5,
            active_workers_count: 5,
          },
        },
        unsettled: 50,
        revenue_24h: 200,
        estimated_today_income: 0,
        hashrate: 10,
        hashrate_1h: 50,
        hashrate_24h: 100,
        hashrate_stale_1h: 10,
        hashrate_stale_24h: 20,
        key: 123456789,
        worker_count: 5,
        active_workers_count: 5,
        aggrCount: 0,
        aggrIntervals: 0,
        yearlyBalances: [],
      })
    })
  })

  describe('aggregateF2PoolSnapLog', () => {
    test('aggregates multiple pool stats correctly', () => {
      const log = [
        {
          ts: 1706853600000,
          pool_snap: {
            haven7346: {
              success: true,
              raw_errors: ['error1'],
              stats: {
                timestamp: 1706853407720,
                balance: 100,
                containers: {
                  'bitdeer-1a': {
                    unsettled: 50,
                    revenue_24h: 200,
                    hashrate: 10,
                    hashrate_1h: 50,
                    hashrate_24h: 100,
                    hashrate_stale_1h: 10,
                    hashrate_stale_24h: 20,
                    worker_count: 5,
                    active_workers_count: 5,
                  },
                },
                unsettled: 50,
                revenue_24h: 200,
                hashrate: 10,
                hashrate_1h: 50,
                hashrate_24h: 100,
                hashrate_stale_1h: 10,
                hashrate_stale_24h: 20,
                worker_count: 5,
                active_workers_count: 5,
              },
              config: {},
            },
            haven7347: {
              success: true,
              raw_errors: ['error2'],
              stats: {
                timestamp: 1706853407720,
                balance: 100,
                containers: {
                  'bitdeer-1a': {
                    unsettled: 50,
                    revenue_24h: 200,
                    hashrate: 10,
                    hashrate_1h: 50,
                    hashrate_24h: 100,
                    hashrate_stale_1h: 10,
                    hashrate_stale_24h: 20,
                    worker_count: 5,
                    active_workers_count: 5,
                  },
                },
                unsettled: 50,
                revenue_24h: 200,
                hashrate: 10,
                hashrate_1h: 50,
                hashrate_24h: 100,
                hashrate_stale_1h: 10,
                hashrate_stale_24h: 20,
                worker_count: 5,
                active_workers_count: 5,
                yearlyBalances: [],
              },
              config: {},
            },
          },
        },
      ]

      const result = aggregateF2PoolSnapLog(log as never, 'D1')

      expect(result).toEqual([
        {
          raw_errors: ['error1', 'error2'],
          ts: 1706853600000,
          aggrCount: 0,
          aggrIntervals: 0,
          balance: 200,
          containers: {
            'bitdeer-1a': {
              unsettled: 50,
              revenue_24h: 200,
              hashrate: 10,
              hashrate_1h: 50,
              hashrate_24h: 100,
              hashrate_stale_1h: 10,
              hashrate_stale_24h: 20,
              worker_count: 5,
              active_workers_count: 5,
            },
          },
          unsettled: 100,
          revenue_24h: 400,
          estimated_today_income: 0,
          hashrate: 20,
          hashrate_1h: 100,
          hashrate_24h: 200,
          hashrate_stale_1h: 20,
          hashrate_stale_24h: 40,
          key: 1706853600000,
          worker_count: 10,
          active_workers_count: 10,
          pool_active_workers_count_type_grp_sum_aggr: undefined,
          pool_hashrate_type_grp_sum_aggr: undefined,
          yearlyBalances: [],
        },
      ])
    })

    test('aggregates pool stats skips if log is undefined', () => {
      const log = [undefined] as never

      const result = aggregateF2PoolSnapLog(log, 'D1')

      expect(result).toEqual([])
    })
  })

  describe('convertRevenue', () => {
    it('should convert revenue data with default multiplier', () => {
      expect(convertRevenue(100)).toBe(100)
    })

    it('should convert revenue data with a given multiplier', () => {
      expect(convertRevenue(100, 2)).toBe(200)
    })
  })

  describe('aggregatePoolRevenue', () => {
    it('should aggregate pool revenue correctly', () => {
      const log = [
        {
          ts: 123,
          transactions: [{ mining_extra: { pps: 1, pps_fee_rate: 2, tx_fee: 3, tx_fee_rate: 4 } }],
        },
        {
          ts: 456,
          transactions: [{ mining_extra: { pps: 5, pps_fee_rate: 6, tx_fee: 7, tx_fee_rate: 8 } }],
        },
      ]
      const result = aggregatePoolRevenue(log)
      expect(result).toEqual([
        { ts: 123, pps: 1, pps_fee_rate: 2, tx_fee: 3, tx_fee_rate: 4 },
        { ts: 456, pps: 5, pps_fee_rate: 6, tx_fee: 7, tx_fee_rate: 8 },
      ])
    })

    it('should return an array with the default object if transactions is not present', () => {
      const log = [{ ts: 123, transactions: [] }]
      const result = aggregatePoolRevenue(log)
      expect(result).toEqual([
        {
          pps: 0,
          pps_fee_rate: 0,
          ts: 123,
          tx_fee: 0,
          tx_fee_rate: 0,
        },
      ])
    })

    it('should aggregate the multiple transactions correctly', () => {
      const log = [
        {
          ts: 123,
          transactions: [
            { mining_extra: { pps: 1, pps_fee_rate: 2, tx_fee: 3, tx_fee_rate: 4 } },
            { mining_extra: { pps: 5, pps_fee_rate: 6, tx_fee: 7, tx_fee_rate: 8 } },
          ],
        },
      ]
      const result = aggregatePoolRevenue(log)
      expect(result).toEqual([{ ts: 123, pps: 6, pps_fee_rate: 8, tx_fee: 10, tx_fee_rate: 12 }])
    })
  })

  describe('aggregateMiningExtra', () => {
    it('should aggregate mining extra values based on the given key', () => {
      const transactions = [
        { mining_extra: { pps: 5 } },
        { mining_extra: { pps: 3 } },
        { mining_extra: { pps: 2 } },
      ]
      const result = aggregateMiningExtra(transactions, 'pps')
      expect(result).toBe(10)
    })

    it('should return 0 if the key does not exist', () => {
      const transactions = [{ mining_extra: { tx_fee: 5 } }]
      const result = aggregateMiningExtra(transactions, 'pps')
      expect(result).toBe(0)
    })
  })

  describe('aggregateData', () => {
    it('should aggregate data based on day range', () => {
      const data = [
        {
          ts: 1727740800000,
          balance: 100,
          unsettled: 20,
          revenue_24h: 50,
          hashrate: 200,
        },
        {
          ts: 1727744400000,
          balance: 150,
          unsettled: 30,
          revenue_24h: 60,
          hashrate: 250,
        },
      ]
      const result = aggregateData(data, DATE_RANGE.D1)
      expect(result).toEqual([
        {
          active_workers_count: 0,
          balance: 250,
          count: 2,
          estimated_today_income: 0,
          hashrate: 450,
          hashrate_1h: 0,
          hashrate_24h: 0,
          hashrate_stale_1h: 0,
          hashrate_stale_24h: 0,
          label: '2024-10-1',
          revenue_24h: 110,
          ts: '2024-10-01T00:00:00.000Z',
          unsettled: 50,
          worker_count: 0,
        },
      ])
    })

    it('should return data as-is if range is M15 or H1', () => {
      const data = [{ ts: 1727740800000, balance: 100 }]
      expect(aggregateData(data, DATE_RANGE.M15)).toEqual(data)
    })
  })

  describe('findClosestObjectToNextHour', () => {
    it('should find the object closest to the next hour', () => {
      const mockCurrentTime = 1728646684998

      vi.spyOn(Date, 'now').mockImplementation(() => mockCurrentTime)

      const tailLogData = [
        { ts: mockCurrentTime + 300000 }, // 5 mins from now
        { ts: mockCurrentTime + 4500000 }, // 75 mins from now
        { ts: mockCurrentTime + 60000 }, // 1 min from now
      ]

      const result = findClosestObjectToNextHour(tailLogData)

      const nextHourTimestamp = mockCurrentTime + 60 * 60 * 1000 // 1 hour from mockCurrentTime

      // Assert that the object found is the closest to the next hour
      const closestDifference = Math.abs(result.ts - nextHourTimestamp)

      // Check that the result is closer to the next hour than any other object in the tailLogData
      const differences = _map(tailLogData, (item: { ts: number }) =>
        Math.abs(item.ts - nextHourTimestamp),
      )
      const minDifference = Math.min(...differences)

      // The closest object should have the smallest difference from the next hour
      expect(closestDifference).toBe(minDifference)
      vi.restoreAllMocks()
    })
  })

  describe('getKunaEnergyAggr', () => {
    it('should return aggregated Kuna energy data', () => {
      const tailLogData = [{ ts: 1727740800000, otherData: 'some-data' }] as never

      const result = getKunaEnergyAggr(tailLogData)
      // Just check that it returns an array
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getRangeStatsKey', () => {
    it('should return correct key for different ranges', () => {
      expect(getRangeStatsKey(DATE_RANGE.MONTH1)).toBe(DATE_RANGE.D1)
      expect(getRangeStatsKey(DATE_RANGE.W1)).toBe(DATE_RANGE.D1)
      expect(getRangeStatsKey(DATE_RANGE.D1)).toBe(DATE_RANGE.D1)
    })
  })
})

describe('getFormattedPoolName', () => {
  test('removes minerpool- prefix and formats pool name for "minerpool-f2pool"', () => {
    const result = getFormattedPoolName('minerpool-f2pool')
    expect(result).toBe('F2Pool')
  })

  test('removes minerpool- prefix and formats pool name for "minerpool-ocean"', () => {
    const result = getFormattedPoolName('minerpool-ocean')
    expect(result).toBe('Ocean')
  })

  test('converts to lowercase and capitalizes first letter of each word', () => {
    const result = getFormattedPoolName('minerpool-ocean-pool')
    expect(result).toBe('OceanPool')
  })

  test('returns empty string when given an empty pool name', () => {
    const result = getFormattedPoolName('')
    expect(result).toBe('')
  })

  test('returns the formatted pool name when there is no minerpool- prefix', () => {
    const result = getFormattedPoolName('regular-pool')
    expect(result).toBe('RegularPool')
  })

  test('correctly formats when the name contains multiple spaces', () => {
    const result = getFormattedPoolName('minerpool-hello   world  pool')
    expect(result).toBe('HelloWorldPool')
  })

  test('returns the correct value when there is no space to remove', () => {
    const result = getFormattedPoolName('minerpool-singleword')
    expect(result).toBe('Singleword')
  })

  test('handles pool names with hyphens correctly', () => {
    const result = getFormattedPoolName('minerpool-f-two-pool')
    expect(result).toBe('FTwoPool')
  })
})
