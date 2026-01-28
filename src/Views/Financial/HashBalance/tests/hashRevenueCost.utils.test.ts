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
