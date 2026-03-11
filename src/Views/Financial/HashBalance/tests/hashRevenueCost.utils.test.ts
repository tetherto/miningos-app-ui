import { describe, expect, it } from 'vitest'

import { getStartOfDay } from '../../common/financial.helpers'
import { HashrateData } from '../types/HashBalance.types'
import {
  getLogSummary,
  proceedSiteHashRevenueData,
  processHashPricesData,
  processTailLogData,
  processTransactionData,
} from '../utils/hashRevenueCost.utils'

import { PERIOD } from '@/constants/ranges'
import type { HashrateAggregateData, MinerHistoricalBlockSizes, MinerTransaction } from '@/types'

describe('HashRevenueCost Utils', () => {
  describe('calculateTransactionSum — satoshis_net_earned branch', () => {
    it('uses satoshis_net_earned when changed_balance is not a number', () => {
      const ts = 1700000000000
      const mock = [
        [
          {
            ts,
            transactions: [
              {
                changed_balance: null, // not a number
                satoshis_net_earned: 100_000_000, // 1 BTC in sats
                fees_colected_satoshis: 1000,
                mining_extra: { tx_fee: 0 },
              },
            ],
          },
        ],
      ] as unknown as MinerTransaction[][]

      const res = processTransactionData(mock)
      const dayTs = getStartOfDay(ts)
      expect(res[dayTs].totalRevenueBTC).toBe(1) // 100_000_000 / BTC_SATS
    })

    it('returns 0 revenue when changed_balance and satoshis_net_earned are both non-numeric', () => {
      const ts = 1700000000000
      const mock = [
        [
          {
            ts,
            transactions: [
              {
                changed_balance: null,
                satoshis_net_earned: null,
                mining_extra: { tx_fee: 0 },
              },
            ],
          },
        ],
      ] as unknown as MinerTransaction[][]

      const res = processTransactionData(mock)
      const dayTs = getStartOfDay(ts)
      expect(res[dayTs].totalRevenueBTC).toBe(0)
    })
  })

  describe('processTransactionData', () => {
    it('aggregates BTC and fee revenue per day', () => {
      const ts = 1700000000000

      const mock = [
        [
          {
            ts,
            transactions: [
              {
                changed_balance: 1,
                mining_extra: { tx_fee: 0.1 },
              },
              {
                changed_balance: 2,
                mining_extra: { tx_fee: 0.2 },
              },
            ],
          },
        ],
      ] as unknown as MinerTransaction[][]

      const res = processTransactionData(mock)
      const dayTs = getStartOfDay(ts)

      expect(res[dayTs].totalRevenueBTC).toBe(3)
      expect(res[dayTs].totalFeesBTC).toBe(0.30000000000000004)
    })
  })

  describe('processTailLogData', () => {
    it('aggregates miner hashrate + powermeter site power', () => {
      const ts = 1700000000000
      const dayTs = getStartOfDay(ts)

      const mock = [
        [
          {
            // miner data
            data: [
              { ts, val: { hashrate_mhs_5m_sum_aggr: 100 } },
              { ts, val: { hashrate_mhs_5m_sum_aggr: 50 } },
            ],
          },
          {
            // powermeter is always index 1
            data: [
              { ts, val: { site_power_w: 200 } },
              { ts, val: { site_power_w: 100 } },
            ],
          },
        ],
      ] as unknown as HashrateAggregateData[][]

      const res = processTailLogData(mock)

      expect(res[dayTs].hashrateMHS).toBe(150)
      expect(res[dayTs].sitePowerW).toBe(300)
    })
  })

  describe('processTailLogData edge cases', () => {
    it('returns empty object for empty input', () => {
      expect(processTailLogData([])).toEqual({})
    })

    it('handles val without hashrate_mhs_5m_sum_aggr key', () => {
      const ts = 1700000000000
      const mock = [
        [
          {
            data: [
              { ts, val: { other_key: 100 } }, // no hashrate_mhs_5m_sum_aggr → 0
            ],
          },
        ],
      ] as unknown as HashrateAggregateData[][]

      const res = processTailLogData(mock)
      const dayTs = getStartOfDay(ts)
      expect(res[dayTs].hashrateMHS).toBe(0)
    })

    it('handles val being null/undefined', () => {
      const ts = 1700000000000
      const mock = [
        [
          {
            data: [
              { ts, val: null }, // null val
            ],
          },
        ],
      ] as unknown as HashrateAggregateData[][]

      const res = processTailLogData(mock)
      const dayTs = getStartOfDay(ts)
      expect(res[dayTs].hashrateMHS).toBe(0)
    })
  })

  describe('getLogSummary', () => {
    it('computes sum and avg correctly while skipping NON_METRIC_KEYS', () => {
      const mock = [
        { ts: 1, a: 10, b: 20 },
        { ts: 2, a: 30, b: 40 },
      ]

      const summary = getLogSummary(mock)

      expect(summary.sum.a).toBe(40)
      expect(summary.sum.b).toBe(60)

      expect(summary.avg.a).toBe(20)
      expect(summary.avg.b).toBe(30)
    })

    it('returns empty sums for empty log', () => {
      const summary = getLogSummary([])
      expect(summary.sum).toEqual({})
      expect(summary.avg).toEqual({})
    })

    it('initializes null for missing values and remains null if all missing', () => {
      const mock = [
        { ts: 1, a: null },
        { ts: 2, a: null },
      ]
      const summary = getLogSummary(mock)
      expect(summary.sum.a).toBeNull()
      expect(summary.avg.a).toBeNull()
    })

    it('initializes null then updates when next entry has a value', () => {
      const mock = [
        { ts: 1, a: null }, // first entry → acc.sum.a = null
        { ts: 2, a: 10 },  // second entry → acc.sum.a was null → set to 10
      ]
      const summary = getLogSummary(mock)
      expect(summary.sum.a).toBe(10)
    })

    it('handles string number values by parsing them', () => {
      const mock = [{ ts: 1, a: '15.5' }]
      const summary = getLogSummary(mock)
      expect(summary.sum.a).toBe(15.5)
    })

    it('treats empty string as missing (null)', () => {
      const mock = [{ ts: 1, a: '  ' }] // blank string → isMissing = true
      const summary = getLogSummary(mock)
      expect(summary.sum.a).toBeNull()
    })
  })

  describe('processHashPricesData — missing price', () => {
    it('returns null for dailyRevenueUSD and hashprice when priceUSD is not found', () => {
      const ts = 1700000000000
      const dayTs = getStartOfDay(ts)

      const blocksData = [
        [{ ts, blockReward: 1000, blockTotalFees: 100 }],
      ] as unknown as MinerHistoricalBlockSizes[][]

      const pricesData = [[{ ts: dayTs + 999999, priceUSD: 50000 }]] // different ts → not found
      const hashRateData = {
        [dayTs]: { hashrateMHS: 1_000_000_000 },
      } as unknown as HashrateData

      const res = processHashPricesData(blocksData, pricesData, hashRateData)

      expect(res[0].priceUSD).toBeNull()
      expect(res[0].dailyRevenueUSD).toBeNull()
      expect(res[0].hashprice).toBeNull()
    })
  })

  describe('processHashPricesData', () => {
    it('computes hashprice, revenue, and network hashrate correctly', () => {
      const ts = 1700000000000
      const dayTs = getStartOfDay(ts)

      const blocksData = [
        [
          {
            ts,
            blockReward: 1000,
            blockTotalFees: 100,
          },
        ],
      ] as unknown as MinerHistoricalBlockSizes[][]

      const pricesData = [[{ ts: dayTs, priceUSD: 50000 }]]

      const hashRateData = {
        [dayTs]: { hashrateMHS: 1_000_000_000 }, // 1 PH/s
      } as unknown as HashrateData

      const res = processHashPricesData(blocksData, pricesData, hashRateData)

      expect(res[0].ts).toBe(dayTs)
      expect(res[0].subsidySats).toBe(900)
      expect(res[0].subsidyBTC).toBe(900 / 100_000_000)
      expect(res[0].hashprice).toBeTypeOf('number')
    })
  })

  describe('proceedSiteHashRevenueData', () => {
    it('computes daily hash revenue in BTC and USD per PH/day', () => {
      const ts = 1700000000000
      const dayTs = getStartOfDay(ts)

      const transactionsData = [
        [
          {
            ts,
            transactions: [{ changed_balance: 1, mining_extra: { tx_fee: 0 } }],
          },
        ],
      ] as unknown as MinerTransaction[][]

      const pricesData = [[{ ts: dayTs, priceUSD: 30000 }]]

      const hashRateData = {
        [dayTs]: { hashrateMHS: 1_000_000_000 }, // 1 PH/s
      } as unknown as HashrateData

      const res = proceedSiteHashRevenueData(
        transactionsData,
        pricesData,
        hashRateData,
        PERIOD.DAILY,
      )

      expect(res[0].ts).toBe(dayTs)
      expect(res[0].hashRevenueBTC_PHS_d).toBe(1) // 1 BTC / 1 PH
      expect(res[0].hashRevenueUSD_PHS_d).toBe(30000)
    })
  })
})
