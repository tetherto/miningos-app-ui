import { describe, expect, it } from 'vitest'

import {
  aggregateByPeriod,
  calculateEbitdaMetrics,
  checkIfAllValuesAreZero,
  formatCurrency,
  mergeDailyData,
  transformToBtcProducedChartData,
  transformToEbitdaChartData,
} from './EBITDA.helpers'
import type {
  AggregatedEbitdaData,
  DailyEbitdaData,
  MinerpoolTransactionData,
  TailLogAggrData,
} from './EBITDA.types'

import { CHART_COLORS } from '@/constants/colors'
import { MinerHistoricalPrice, ProductionCostData } from '@/types'

describe('EBITDA Helpers', () => {
  describe('mergeDailyData', () => {
    it('should merge transaction, price, cost, and tail log data', () => {
      const transactions: MinerpoolTransactionData[] = [
        {
          ts: new Date('2024-04-15').getTime(),
          stats: [],
          workers: [],
          transactions: [
            {
              username: 'test',
              id: 1,
              type: 'revenue_fpps',
              changed_balance: 0.5,
              created_at: 1713139200,
              mining_extra: {
                mining_date: 1713139200,
                settle_date: 1713225600,
                pps: 0.4,
                pps_fee_rate: 0.01,
                tx_fee: 0.1,
                tx_fee_rate: 0.02,
                hash_rate: 1000000,
              },
              payout_extra: null,
              satoshis_net_earned: 200000,
              fees_colected_satoshis: 20000,
            },
          ],
          blocksData: {},
          workersCount: 1,
        },
      ]

      const prices: MinerHistoricalPrice[] = [
        {
          ts: new Date('2024-04-15').getTime(),
          priceUSD: 65000,
        },
      ]

      const costs: ProductionCostData[] = [
        {
          site: 'Test Site',
          year: 2024,
          month: 4,
          energyCost: 11000,
          operationalCost: 6500,
        },
      ]

      const tailLog: TailLogAggrData[] = [
        {
          type: 'miner',
          data: [
            {
              ts: new Date('2024-04-15').getTime(),
              val: {
                hashrate_mhs_5m_sum_aggr: 1000000,
              },
            },
          ],
        },
        {
          type: 'powermeter',
          data: [
            {
              ts: new Date('2024-04-15').getTime(),
              val: {
                site_power_w: 500000,
              },
            },
          ],
        },
      ]

      const result = mergeDailyData(transactions, prices, costs, tailLog)

      expect(result).toHaveLength(1)
      expect(result[0].revenueBTC).toBe(0.5)
      expect(result[0].priceUSD).toBe(65000)
      expect(result[0].energyCostsUSD).toBe(11000)
      expect(result[0].operationalCostsUSD).toBe(6500)
    })
  })

  describe('aggregateByPeriod', () => {
    it('should aggregate daily data by month', () => {
      const dailyData: DailyEbitdaData[] = [
        {
          ts: new Date('2024-04-15').getTime(),
          revenueBTC: 0.5,
          feesBTC: 0.01,
          priceUSD: 65000,
          energyCostsUSD: 10000,
          operationalCostsUSD: 5000,
          hashrateMHS: 1000000,
          powerW: 500000,
        },
        {
          ts: new Date('2024-04-20').getTime(),
          revenueBTC: 0.6,
          feesBTC: 0.01,
          priceUSD: 66000,
          energyCostsUSD: 11000,
          operationalCostsUSD: 5500,
          hashrateMHS: 1100000,
          powerW: 550000,
        },
      ]

      const currentBTCPrice = 70000
      const result = aggregateByPeriod(dailyData, 'month', currentBTCPrice)

      expect(result).toHaveLength(1)
      expect(result[0].period).toBe('2024-04')
      expect(result[0].revenueBTC).toBeCloseTo(1.1)
      expect(result[0].revenueUSD).toBeCloseTo(72100) // 0.5*65000 + 0.6*66000
      expect(result[0].totalCostsUSD).toBe(31500)
      expect(result[0].ebitdaSell).toBeCloseTo(40600)
      expect(result[0].ebitdaHodl).toBeCloseTo(45500) // 1.1*70000 - 31500
    })
  })

  describe('calculateEbitdaMetrics', () => {
    it('should calculate all metrics correctly', () => {
      const aggregatedData: AggregatedEbitdaData[] = [
        {
          period: '04-24',
          revenueBTC: 1.1,
          revenueUSD: 72100,
          totalCostsUSD: 31500,
          ebitdaSell: 40600,
          ebitdaHodl: 45500,
          priceSamples: [65000, 66000],
          dataPointCount: 2,
        },
      ]

      const currentBTCPrice = 70000
      const result = calculateEbitdaMetrics(aggregatedData, currentBTCPrice)

      expect(result.bitcoinProduced).toBeCloseTo(1.1)
      expect(result.ebitdaSellingBTC).toBeCloseTo(40600)
      expect(result.ebitdaNotSellingBTC).toBeCloseTo(45500)
      expect(result.actualEbitda).toBeCloseTo(40600)
      expect(result.bitcoinPrice).toBeCloseTo(65500) // Average of samples
      expect(result.bitcoinProductionCost).toBeCloseTo(28636.36, 1) // 31500 / 1.1
    })
  })

  describe('formatCurrency', () => {
    it('should format millions with M suffix', () => {
      const result = formatCurrency(5000000)
      expect(result).toBe('$5M')
    })

    it('should format thousands with K suffix', () => {
      const result = formatCurrency(120000)
      expect(result).toBe('$120K')
    })

    it('should handle negative values with parentheses', () => {
      const result = formatCurrency(-5000000)
      expect(result).toBe('($5M)')
    })
  })

  describe('transformToEbitdaChartData', () => {
    it('should transform to chart format with grouped bars for comparison', () => {
      const aggregatedData: AggregatedEbitdaData[] = [
        {
          period: '04-24',
          revenueBTC: 1.1,
          revenueUSD: 72100,
          totalCostsUSD: 31500,
          ebitdaSell: 40600,
          ebitdaHodl: 45500,
          priceSamples: [65000],
          dataPointCount: 1,
        },
      ]

      const result = transformToEbitdaChartData(aggregatedData)

      expect(result.labels).toEqual(['04-24'])
      expect(result.series).toHaveLength(2)
      expect(result.series[0].label).toBe('Sell scenario')
      expect(result.series[0].values).toEqual([40600])
      expect(result.series[0].color).toBe(CHART_COLORS.blue)
      expect(result.series[1].label).toBe('HODL scenario')
      expect(result.series[1].values).toEqual([45500])
      expect(result.series[1].color).toBe(CHART_COLORS.green)
    })
  })

  describe('transformToBtcProducedChartData', () => {
    it('should transform to simple bar chart format', () => {
      const aggregatedData: AggregatedEbitdaData[] = [
        {
          period: '04-24',
          revenueBTC: 1.1,
          revenueUSD: 72100,
          totalCostsUSD: 31500,
          ebitdaSell: 40600,
          ebitdaHodl: 45500,
          priceSamples: [65000],
          dataPointCount: 1,
        },
      ]

      const result = transformToBtcProducedChartData(aggregatedData)

      expect(result.labels).toEqual(['04-24'])
      expect(result.series).toHaveLength(1)
      expect(result.series[0].label).toBe('Bitcoin Produced')
      expect(result.series[0].values).toEqual([1.1])
      expect(result.series[0].color).toBe(CHART_COLORS.orange)
    })
  })

  describe('checkIfAllValuesAreZero', () => {
    it('should return true for null or undefined data', () => {
      expect(checkIfAllValuesAreZero(null)).toBe(true)
      expect(checkIfAllValuesAreZero(undefined)).toBe(true)
    })

    it('should return true for empty series', () => {
      expect(checkIfAllValuesAreZero({ series: [] })).toBe(true)
      expect(checkIfAllValuesAreZero({})).toBe(true)
    })

    it('should return true when all values are zero', () => {
      const data = {
        series: [{ values: [0, 0, 0] }, { values: [0, 0] }],
      }
      expect(checkIfAllValuesAreZero(data)).toBe(true)
    })

    it('should return false when any value is non-zero', () => {
      const data = {
        series: [{ values: [0, 1, 0] }, { values: [0, 0] }],
      }
      expect(checkIfAllValuesAreZero(data)).toBe(false)
    })

    it('should return true for series with empty values', () => {
      const data = {
        series: [{ values: [] }, {}],
      }
      expect(checkIfAllValuesAreZero(data)).toBe(true)
    })
  })
})
