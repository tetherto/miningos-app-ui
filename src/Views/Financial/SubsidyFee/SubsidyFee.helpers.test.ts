import { describe, expect, it } from 'vitest'

import {
  aggregateBlocksByPeriod,
  transformToAverageFeesChartData,
  transformToSubsidyFeesChartData,
} from './SubsidyFee.helpers'
import type { AggregatedPeriodData, MempoolBlockData } from './SubsidyFee.types'

import { CHART_COLORS } from '@/constants/colors'

// Mock data for transformation tests
const mockAggregatedData: AggregatedPeriodData[] = [
  {
    period: '04-24',
    subsidyBTC: 12.4,
    feesBTC: 0.11,
    feePercent: 0.88,
    avgSatsPerVByte: 3.5,
    blockCount: 2,
    firstTs: new Date('2024-04-15').getTime(),
  },
  {
    period: '05-24',
    subsidyBTC: 13.2,
    feesBTC: 0.13,
    feePercent: 0.97,
    avgSatsPerVByte: 4.2,
    blockCount: 3,
    firstTs: new Date('2024-05-01').getTime(),
  },
]

describe('SubsidyFee Helpers', () => {
  describe('aggregateBlocksByPeriod', () => {
    const mockBlocks: MempoolBlockData[] = [
      {
        ts: new Date('2024-04-15').getTime(),
        blockSize: 1500000,
        blockHash: 'hash1',
        blockReward: 625000000, // 6.25 BTC
        blockTotalFees: 5000000, // 0.05 BTC
      },
      {
        ts: new Date('2024-04-16').getTime(),
        blockSize: 1600000,
        blockHash: 'hash2',
        blockReward: 625000000,
        blockTotalFees: 6000000, // 0.06 BTC
      },
      {
        ts: new Date('2024-05-01').getTime(),
        blockSize: 1400000,
        blockHash: 'hash3',
        blockReward: 625000000,
        blockTotalFees: 4000000, // 0.04 BTC
      },
    ]

    it('should aggregate blocks by month', () => {
      const result = aggregateBlocksByPeriod(mockBlocks, 'month')

      expect(result).toHaveLength(2) // April and May

      const aprilData = result.find((d) => d.period === '2024-04')
      expect(aprilData).toBeDefined()
      expect(aprilData?.blockCount).toBe(2)
      expect(aprilData?.subsidyBTC).toBeCloseTo(12.39, 2) // (6.25-0.05) + (6.25-0.06)
      expect(aprilData?.feesBTC).toBeCloseTo(0.11, 2) // 0.05 + 0.06
    })

    it('should calculate fee percentage correctly', () => {
      const result = aggregateBlocksByPeriod(mockBlocks, 'month')
      const aprilData = result.find((d) => d.period === '2024-04')

      const expectedFeePercent = (0.11 / (12.39 + 0.11)) * 100
      expect(aprilData?.feePercent).toBeCloseTo(expectedFeePercent, 2)
    })

    it('should calculate average sats per vByte correctly', () => {
      const result = aggregateBlocksByPeriod(mockBlocks, 'month')
      const aprilData = result.find((d) => d.period === '2024-04')

      const totalFees = 5000000 + 6000000
      const totalSize = 1500000 + 1600000
      const expectedAvg = totalFees / totalSize

      expect(aprilData?.avgSatsPerVByte).toBeCloseTo(expectedAvg, 2)
    })

    it('should handle empty blocks array', () => {
      const result = aggregateBlocksByPeriod([], 'month')
      expect(result).toEqual([])
    })

    it('should handle single block', () => {
      const singleBlock: MempoolBlockData[] = [mockBlocks[0]]
      const result = aggregateBlocksByPeriod(singleBlock, 'month')

      expect(result).toHaveLength(1)
      expect(result[0].blockCount).toBe(1)
    })

    it('should sort results in chronological order (oldest to newest)', () => {
      // Provide blocks in reverse chronological order (newest first)
      const reverseOrderBlocks: MempoolBlockData[] = [
        {
          ts: new Date('2024-05-01').getTime(),
          blockSize: 1400000,
          blockHash: 'hash3',
          blockReward: 625000000,
          blockTotalFees: 4000000,
        },
        {
          ts: new Date('2024-04-15').getTime(),
          blockSize: 1500000,
          blockHash: 'hash1',
          blockReward: 625000000,
          blockTotalFees: 5000000,
        },
      ]

      const result = aggregateBlocksByPeriod(reverseOrderBlocks, 'month')

      // Should be sorted oldest to newest: April before May
      expect(result[0].period).toBe('2024-04')
      expect(result[1].period).toBe('2024-05')
    })
  })

  describe('transformToSubsidyFeesChartData', () => {
    it('should transform to ThresholdBarChart format with stacked bars and line', () => {
      const result = transformToSubsidyFeesChartData(mockAggregatedData)

      // Check labels
      expect(result.labels).toEqual(['04-24', '05-24'])

      // Check series (bars)
      expect(result.series).toHaveLength(2)
      expect(result.series[0]).toMatchObject({
        label: 'Subsidy',
        values: [12.4, 13.2],
        color: CHART_COLORS.blue,
        stack: 'stack1',
      })
      expect(result.series[1]).toMatchObject({
        label: 'Fees',
        values: [0.11, 0.13],
        color: CHART_COLORS.purple,
        stack: 'stack1',
      })

      // Check lines (Fee %)
      expect(result.lines).toHaveLength(1)
      expect(result.lines[0]).toMatchObject({
        label: 'Fee %',
        values: [0.0088, 0.0097], // Converted to decimal
        color: CHART_COLORS.red,
        yAxisID: 'y1',
      })
    })

    it('should handle empty array', () => {
      const result = transformToSubsidyFeesChartData([])
      expect(result.labels).toEqual([])
      expect(result.series).toHaveLength(2)
      expect(result.series[0].values).toEqual([])
    })
  })

  describe('transformToAverageFeesChartData', () => {
    it('should transform to ThresholdBarChart format with simple bars', () => {
      const result = transformToAverageFeesChartData(mockAggregatedData)

      // Check labels
      expect(result.labels).toEqual(['04-24', '05-24'])

      // Check series (bars)
      expect(result.series).toHaveLength(1)
      expect(result.series[0]).toMatchObject({
        label: 'Average Fees in Sats/vByte',
        values: [3.5, 4.2], // Changed from rounded values to actual values
        color: CHART_COLORS.purple,
      })
    })

    it('should handle empty array', () => {
      const result = transformToAverageFeesChartData([])
      expect(result.labels).toEqual([])
      expect(result.series).toHaveLength(1)
      expect(result.series[0].values).toEqual([])
    })

    it('should preserve decimal values', () => {
      const data: AggregatedPeriodData[] = [
        {
          period: '01-25',
          subsidyBTC: 10,
          feesBTC: 0.1,
          feePercent: 1,
          avgSatsPerVByte: 94.7,
          blockCount: 1,
          firstTs: new Date('2025-01-15').getTime(),
        },
        {
          period: '02-25',
          subsidyBTC: 10,
          feesBTC: 0.1,
          feePercent: 1,
          avgSatsPerVByte: 69.3,
          blockCount: 1,
          firstTs: new Date('2025-02-15').getTime(),
        },
      ]

      const result = transformToAverageFeesChartData(data)
      expect(result.series[0].values).toEqual([94.7, 69.3])
    })
  })
})
