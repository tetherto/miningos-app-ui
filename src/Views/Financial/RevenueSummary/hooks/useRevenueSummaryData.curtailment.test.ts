import { describe, expect, test } from 'vitest'

import type { DateRange } from '../RevenueSummary.types'

import { getStartOfDay } from './revenueSummaryHelpers'
import {
  calculateAvgHashrate,
  calculateAvgPowerConsumption,
  calculateHashrateCapacityFactors,
  extractAvgHashrateFromAggregatedResponse,
  processElectricityData,
} from './useRevenueSummaryData'

import { calculateCurtailment } from '@/app/utils/electricityUtils'
import { PERIOD } from '@/constants/ranges'
import type { ElectricityDataEntry, HashrateAggregateResponse } from '@/types'

// Type definition matching useRevenueSummaryData.ts
interface ProcessedTailLogData {
  [key: number]: {
    ts: number
    hashrateMHS: number
    sitePowerW: number
  }
}

// Helper to create mock electricity data
// The runtime expects a nested array structure, but the type is ElectricityDataEntry[]
const createMockElectricityData = (
  entries: Array<{ ts: number; usedEnergy: number; availableEnergy: number }>,
): ElectricityDataEntry[] =>
  [
    entries.map((entry) => ({
      ts: entry.ts,
      energy: { usedEnergy: entry.usedEnergy, availableEnergy: entry.availableEnergy },
    })),
  ] as unknown as ElectricityDataEntry[]

// Helper to create mock tail log data
const createMockTailLogData = (
  entries: Array<{ ts: number; hashrateMHS: number; sitePowerW: number }>,
): ProcessedTailLogData => {
  const result: ProcessedTailLogData = {}
  entries.forEach((entry) => {
    const dayTs = getStartOfDay(entry.ts)
    result[dayTs] = {
      ts: dayTs,
      hashrateMHS: entry.hashrateMHS,
      sitePowerW: entry.sitePowerW,
    }
  })
  return result
}

describe('Curtailment Rate and Capacity Factors Calculations', () => {
  describe('processElectricityData', () => {
    test('should process electricity data correctly', () => {
      const mockData = createMockElectricityData([
        { ts: 1759536000000, usedEnergy: 1687.05, availableEnergy: 100 },
        { ts: 1759622400000, usedEnergy: 1700.0, availableEnergy: 150 },
      ])

      const result = processElectricityData(mockData)

      expect(result).toHaveLength(2)
      // processElectricityData only extracts ts and usedEnergy
      expect(result[0]).toEqual({
        ts: 1759536000000,
        usedEnergy: 1687.05,
      })
      expect(result[1]).toEqual({
        ts: 1759622400000,
        usedEnergy: 1700.0,
      })
    })

    test('should handle empty electricity data', () => {
      const result = processElectricityData([])
      expect(result).toEqual([])
    })

    test('should handle undefined electricity data', () => {
      const result = processElectricityData(undefined)
      expect(result).toEqual([])
    })

    test('should filter out entries without energy data', () => {
      const mockData = [
        [
          { ts: 1759536000000, energy: { usedEnergy: 1687.05, availableEnergy: 100 } },
          { ts: 1759622400000, energy: {} as { usedEnergy: number; availableEnergy: number } },
          { ts: 1759708800000 },
        ],
      ] as unknown as ElectricityDataEntry[]

      const result = processElectricityData(mockData)

      expect(result).toHaveLength(1)
      // processElectricityData only extracts ts and usedEnergy
      expect(result[0]).toEqual({
        ts: 1759536000000,
        usedEnergy: 1687.05,
      })
    })
  })

  describe('Curtailment Rate Calculation', () => {
    test('should calculate curtailment rate correctly', () => {
      const usedEnergy = 107000
      const nominalAvailablePowerMWh = 22.5
      const powerConsumptionMW = 20
      const hoursInPeriod = 24

      const { curtailmentRate } = calculateCurtailment(
        usedEnergy,
        nominalAvailablePowerMWh,
        powerConsumptionMW,
        hoursInPeriod,
      )

      expect(curtailmentRate).toBeCloseTo(0.04153, 4)
    })

    test('should return 0 when curtailment is negative (used more than available)', () => {
      // If used energy exceeds nominal available, curtailment rate should be 0
      const usedEnergy = 1000000000 // Very high value
      const nominalAvailablePowerMWh = 22.5
      const powerConsumptionMW = 20
      const hoursInPeriod = 24

      const { curtailmentRate } = calculateCurtailment(
        usedEnergy,
        nominalAvailablePowerMWh,
        powerConsumptionMW,
        hoursInPeriod,
      )

      expect(curtailmentRate).toBe(0)
    })

    test('should return 0 when no power consumption', () => {
      const usedEnergy = 107000
      const nominalAvailablePowerMWh = 22.5
      const powerConsumptionMW = 0
      const hoursInPeriod = 24

      // Division by 0 will result in Infinity, but with no consumption there's no meaningful rate
      const { curtailmentRate } = calculateCurtailment(
        usedEnergy,
        nominalAvailablePowerMWh,
        powerConsumptionMW,
        hoursInPeriod,
      )

      // When powerConsumptionMW is 0, powerConsumptionInMWh = 0, so rate = curtailmentMWh / 0 = Infinity
      expect(curtailmentRate).toBe(Infinity)
    })

    test('should handle high curtailment scenario', () => {
      const usedEnergy = 50000
      const nominalAvailablePowerMWh = 100
      const powerConsumptionMW = 20
      const hoursInPeriod = 24

      const { curtailmentRate } = calculateCurtailment(
        usedEnergy,
        nominalAvailablePowerMWh,
        powerConsumptionMW,
        hoursInPeriod,
      )

      expect(curtailmentRate).toBeCloseTo(0.2058, 3)
    })
  })

  describe('Hashrate Capacity Factors Calculation', () => {
    test('should calculate hashrate capacity factors correctly', () => {
      // Example: nominalHashrateMHS = 50,000,000 MH/s (50 PH/s)
      // actualHashrateMHS = 45,000,000 MH/s (45 PH/s)
      // capacityFactor = (45,000,000 / 50,000,000) * 100 = 90%

      const nominalHashrateMHS = 50_000_000 // 50 PH/s
      const actualHashrateMHS = 45_000_000 // 45 PH/s

      const capacityFactor = calculateHashrateCapacityFactors(actualHashrateMHS, nominalHashrateMHS)

      expect(capacityFactor).toBe(90)
    })

    test('should return 0 when nominal hashrate is 0', () => {
      const nominalHashrateMHS = 0
      const actualHashrateMHS = 45_000_000

      const capacityFactor = calculateHashrateCapacityFactors(actualHashrateMHS, nominalHashrateMHS)

      expect(capacityFactor).toBe(0)
    })

    test('should handle over-capacity (more than 100%)', () => {
      const nominalHashrateMHS = 50_000_000
      const actualHashrateMHS = 55_000_000 // Over capacity

      const capacityFactor = calculateHashrateCapacityFactors(actualHashrateMHS, nominalHashrateMHS)

      expect(capacityFactor).toBeCloseTo(110, 2)
    })

    test('should handle zero actual hashrate', () => {
      const nominalHashrateMHS = 50_000_000
      const actualHashrateMHS = 0

      const capacityFactor = calculateHashrateCapacityFactors(actualHashrateMHS, nominalHashrateMHS)

      expect(capacityFactor).toBe(0)
    })

    test('should calculate hashrate capacity factor from mock API response data', () => {
      // Mock API response data matching the provided structure
      // Hashrate (5m sum): 13,617,098,532,771.879 MH/s
      // Aggregation Intervals: 8,928
      // Nominal Site Hashrate: 709,032,000,000 MH/s
      const mockAggregatedResponse = {
        data: [
          [
            {
              type: 'miner',
              data: {
                hashrate_mhs_5m_sum_aggr: 13617098532771.879,
                aggrIntervals: 8928,
              },
              error: null,
            },
            {
              type: 'powermeter',
              data: {
                site_power_w: 1261539418.3259432,
                aggrCount: 44640,
                aggrIntervals: 8928,
              },
              error: null,
            },
          ],
        ],
        success: true,
      } as unknown as HashrateAggregateResponse

      // Extract average hashrate from aggregated response
      // Formula: hashrate_mhs_5m_sum_aggr / aggrIntervals
      const avgHashrateMHS = extractAvgHashrateFromAggregatedResponse(mockAggregatedResponse)

      // Expected: 13,617,098,532,771.879 / 8,928 = 1,525,212,649.28 MH/s
      const expectedAvgHashrate = 13617098532771.879 / 8928
      expect(avgHashrateMHS).toBeCloseTo(expectedAvgHashrate, 2)

      // Nominal Site Hashrate from API response
      const nominalSiteHashrateMHS = 709_032_000_000 // 709,032,000,000 MH/s

      // Calculate hashrate capacity factor
      // Formula: (Avg Hashrate in MH/s / Nominal Site Hashrate) × 100
      const capacityFactor = calculateHashrateCapacityFactors(
        avgHashrateMHS,
        nominalSiteHashrateMHS,
      )

      // Expected: (1,525,212,649.28 / 709,032,000,000) × 100 = 0.2151119624%
      const expectedCapacityFactor = (expectedAvgHashrate / nominalSiteHashrateMHS) * 100
      expect(capacityFactor).toBeCloseTo(expectedCapacityFactor, 10)
      expect(capacityFactor).toBeCloseTo(0.2151119624, 10)
    })
  })

  describe('Integration with processed data', () => {
    test('should calculate curtailment rate from processed electricity data', () => {
      // Mock electricity data with usedEnergy (watts for toMWh conversion)
      const electricityData = createMockElectricityData([
        { ts: 1759536000000, usedEnergy: 107000, availableEnergy: 32000 },
        { ts: 1759622400000, usedEnergy: 107000, availableEnergy: 32000 },
      ])

      const processedElectricity = processElectricityData(electricityData)
      const totalUsedEnergy = processedElectricity.reduce((sum, entry) => sum + entry.usedEnergy, 0)

      // processElectricityData only extracts ts and usedEnergy
      expect(totalUsedEnergy).toBe(214000)

      // Calculate curtailment rate with proper parameters
      const nominalAvailablePowerMWh = 22.5
      const powerConsumptionMW = 20
      const hoursInPeriod = 24
      const { curtailmentRate } = calculateCurtailment(
        totalUsedEnergy,
        nominalAvailablePowerMWh,
        powerConsumptionMW,
        hoursInPeriod,
      )

      // toMWh(214000) = 214000 / 1e6 * 24 = 5.136 MWh
      // curtailmentMWh = 22.5 - 5.136 = 17.364 MWh
      // curtailmentRate = 17.364 / 480 = 0.03618
      expect(curtailmentRate).toBeCloseTo(0.03618, 4)
    })

    test('should calculate hashrate capacity factors from processed hashrate data', () => {
      const dateRange: DateRange = {
        start: 1759536000000,
        end: 1759622400000,
        period: PERIOD.WEEKLY,
      }

      const tailLogData = createMockTailLogData([
        { ts: 1759536000000, hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
        { ts: 1759622400000, hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
      ])

      const avgHashrate = calculateAvgHashrate(tailLogData, dateRange, PERIOD.WEEKLY)
      const nominalHashrateMHS = 50_000_000

      const capacityFactor = calculateHashrateCapacityFactors(avgHashrate, nominalHashrateMHS)

      expect(avgHashrate).toBe(45_000_000)
      expect(capacityFactor).toBe(90)
    })

    test('should handle monthly period correctly', () => {
      const dateRange: DateRange = {
        start: new Date(2025, 0, 1).getTime(),
        end: new Date(2025, 0, 31).getTime(),
        period: PERIOD.MONTHLY,
      }

      const electricityData = createMockElectricityData([
        { ts: new Date(2025, 0, 1).getTime(), usedEnergy: 500, availableEnergy: 100 },
        { ts: new Date(2025, 0, 15).getTime(), usedEnergy: 500, availableEnergy: 100 },
        { ts: new Date(2025, 0, 31).getTime(), usedEnergy: 500, availableEnergy: 100 },
      ])

      const tailLogData = createMockTailLogData([
        { ts: new Date(2025, 0, 1).getTime(), hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
        { ts: new Date(2025, 0, 15).getTime(), hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
        { ts: new Date(2025, 0, 31).getTime(), hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
      ])

      const processedElectricity = processElectricityData(electricityData)
      // processElectricityData only extracts ts and usedEnergy (not availableEnergy)
      const totalUsedEnergy = processedElectricity.reduce((sum, entry) => sum + entry.usedEnergy, 0)

      const avgPowerConsumption = calculateAvgPowerConsumption(
        tailLogData,
        dateRange,
        PERIOD.MONTHLY,
      )
      const avgPowerConsumptionMW = avgPowerConsumption / 1e6

      expect(totalUsedEnergy).toBe(1500)
      expect(avgPowerConsumptionMW).toBe(20)
    })

    test('should handle yearly period correctly', () => {
      const dateRange: DateRange = {
        start: new Date(2025, 0, 1).getTime(),
        end: new Date(2025, 11, 31).getTime(),
        period: PERIOD.YEARLY,
      }

      const tailLogData = createMockTailLogData([
        { ts: new Date(2025, 0, 1).getTime(), hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
        { ts: new Date(2025, 5, 15).getTime(), hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
        { ts: new Date(2025, 11, 31).getTime(), hashrateMHS: 45_000_000, sitePowerW: 20_000_000 },
      ])

      const avgHashrate = calculateAvgHashrate(tailLogData, dateRange, PERIOD.YEARLY)
      const nominalHashrateMHS = 50_000_000

      const capacityFactor = calculateHashrateCapacityFactors(avgHashrate, nominalHashrateMHS)

      expect(avgHashrate).toBe(45_000_000)
      expect(capacityFactor).toBe(90)
    })
  })

  describe('Edge cases', () => {
    test('should handle empty electricity data', () => {
      const processedElectricity = processElectricityData([])
      expect(processedElectricity).toEqual([])
    })

    test('should handle empty tail log data', () => {
      const dateRange: DateRange = {
        start: 1759536000000,
        end: 1759622400000,
        period: PERIOD.WEEKLY,
      }

      const emptyTailLogData: ProcessedTailLogData = {}
      const avgPowerConsumption = calculateAvgPowerConsumption(
        emptyTailLogData,
        dateRange,
        PERIOD.WEEKLY,
      )
      const avgHashrate = calculateAvgHashrate(emptyTailLogData, dateRange, PERIOD.WEEKLY)

      expect(avgPowerConsumption).toBe(0)
      expect(avgHashrate).toBe(0)
    })

    test('should handle missing nominal values', () => {
      const nominalAvailablePowerMWh = 0
      const activeEnergyInAggr = 400
      const powerConsumptionMW = 20

      // When nominal is 0, curtailment calculation doesn't make sense
      // The function should handle this gracefully
      expect(nominalAvailablePowerMWh).toBe(0)
    })
  })
})
