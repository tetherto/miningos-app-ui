import { describe, expect, it } from 'vitest'

import {
  aggregateByPeriod,
  calculateEnergyCostMetrics,
  calculateEnergyRevenueMetrics,
  calculateOperationalIssues,
  mergeDailyData,
  transformToDowntimeChartData,
  transformToEnergyCostChartData,
  transformToEnergyRevenueChartData,
  transformToPowerChartData,
} from './EnergyBalance.helpers'
import type {
  AggregatedEnergyPeriodData,
  DailyEnergyData,
  MinerpoolTransaction,
  MinerpoolTransactionData,
  PowerMeterData,
} from './EnergyBalance.types'

import { calculateCurtailment } from '@/app/utils/electricityUtils'
import { CHART_COLORS } from '@/constants/colors'
import type { ElectricityDataEntry, MinerHistoricalPrice, ProductionCostData } from '@/types'

// Mock data in exact shape of API responses
const mockTransaction: MinerpoolTransaction = {
  username: 'haven7346',
  id: 564786953,
  type: 'revenue_fpps',
  changed_balance: 0.001, // ~0.001 BTC
  created_at: 1735693200,
  mining_extra: {
    mining_date: 1735715682,
    settle_date: 1735740089,
    pps: 0.00022,
    pps_fee_rate: 0.005,
    tx_fee: 0.00026,
    tx_fee_rate: 0.008,
    hash_rate: 611539601937678,
  },
  payout_extra: null,
  satoshis_net_earned: 2000000,
  fees_colected_satoshis: 20000,
}

const mockTransactionData: MinerpoolTransactionData = {
  ts: '1735689600000', // Jan 1, 2025
  stats: [],
  workers: [],
  transactions: [mockTransaction],
  blocksData: {},
  workersCount: 0,
}

const mockHistoricalPrice: MinerHistoricalPrice = {
  ts: 1735689600000,
  priceUSD: 95000,
}

const mockCurrentPrice: MinerHistoricalPrice = {
  ts: 1735689600000,
  priceUSD: 95000,
  currentPrice: 87429, // Fallback when historical not available
}

const mockProductionCost: ProductionCostData = {
  site: 'SITE-C',
  year: 2025,
  month: 1,
  energyCost: 5000,
  operationalCost: 3000,
}

const mockPowerMeterData: PowerMeterData = {
  type: 'powermeter',
  data: [
    {
      ts: 1735689600000,
      val: { site_power_w: 20000000 }, // 20 MW
    },
    {
      ts: 1735776000000,
      val: { site_power_w: 21000000 }, // 21 MW
    },
  ],
}

const mockElectricityEntry: ElectricityDataEntry = {
  ts: 1735689600000,
  energy: {
    usedEnergy: 107000, // kWh - energy actually consumed
    availableEnergy: 32000, // kWh - energy available but not used (curtailed)
    label: 1,
    count: 24,
    ts: 1735689600000,
  },
}

describe('EnergyBalance Helpers', () => {
  describe('calculateCurtailment', () => {
    const NOMINAL_AVAILABLE_POWER_MWH = 22.5

    it('should calculate curtailment MWh and rate', () => {
      // Formula (per implementation):
      // usedEnergyInMWh = toMWh(usedEnergy) = usedEnergy / 1e6 * 24 = 107000 / 1e6 * 24 = 2.568
      // powerConsumptionInMWh = powerConsumptionMW * hoursInPeriod = 20 * 24 = 480
      // curtailmentMWh = nominalAvailablePowerMWh - usedEnergyInMWh = 22.5 - 2.568 = 19.932
      // curtailmentRate = curtailmentMWh / powerConsumptionInMWh = 19.932 / 480 = 0.04153
      const hoursInPeriod = 24
      const result = calculateCurtailment(
        mockElectricityEntry.energy.usedEnergy,
        NOMINAL_AVAILABLE_POWER_MWH,
        20,
        hoursInPeriod,
      )
      expect(result.curtailmentMWh).toBeCloseTo(19.932, 2)
      expect(result.curtailmentRate).toBeCloseTo(0.04153, 4)
    })

    it('should handle zero power consumption', () => {
      const zeroEntry: ElectricityDataEntry = {
        ts: 1735689600000,
        energy: {
          usedEnergy: 0,
          availableEnergy: 0,
          label: 1,
          count: 24,
          ts: 1735689600000,
        },
      }
      const hoursInPeriod = 24
      // With zero power consumption, rate will be Infinity (22.5 / 0)
      const result = calculateCurtailment(
        zeroEntry.energy.usedEnergy,
        NOMINAL_AVAILABLE_POWER_MWH,
        0,
        hoursInPeriod,
      )
      expect(result.curtailmentMWh).toBe(22.5) // nominalAvailablePowerMWh - 0
      expect(result.curtailmentRate).toBe(Infinity)
    })
  })

  describe('calculateOperationalIssues', () => {
    it('should return 0 when operational issues calculation is negative', () => {
      // Formula (per implementation):
      // availableEnergyInMWh = toMWh(availableEnergy) = 32000 / 1e6 * 24 = 0.768
      // powerConsumptionInMWh = consumptionMW * hoursInPeriod = 20 * 24 = 480
      // operationalIssues = (0.768 - 480) / 0.768 = negative value, clamped to 0
      const hoursInPeriod = 24
      const result = calculateOperationalIssues(mockElectricityEntry, 20, hoursInPeriod)
      expect(result).toBe(0)
    })

    it('should return operational issues rate when positive', () => {
      // Create entry with high available energy that exceeds power consumption
      const highAvailabilityEntry: ElectricityDataEntry = {
        ts: 1735689600000,
        energy: {
          usedEnergy: 0,
          availableEnergy: 100000000, // 100 MW in watts for toMWh calculation
          label: 1,
          count: 24,
          ts: 1735689600000,
        },
      }
      // availableEnergyInMWh = toMWh(100000000) = 100000000 / 1e6 * 24 = 2400
      // powerConsumptionInMWh = 20 * 24 = 480
      // operationalIssues = (2400 - 480) / 2400 = 0.8
      const hoursInPeriod = 24
      const result = calculateOperationalIssues(highAvailabilityEntry, 20, hoursInPeriod)
      expect(result).toBeCloseTo(0.8, 2)
    })
  })

  describe('mergeDailyData', () => {
    const hoursInPeriod = 24
    const NOMINAL_AVAILABLE_POWER_MWH = 22.5

    it('should merge all data sources into daily data', () => {
      const transactions: MinerpoolTransactionData[] = [mockTransactionData]
      const prices: MinerHistoricalPrice[] = [mockHistoricalPrice]
      const costs: ProductionCostData[] = [mockProductionCost]
      const electricity: ElectricityDataEntry[] = [mockElectricityEntry]

      const result = mergeDailyData(
        transactions,
        prices,
        costs,
        mockPowerMeterData,
        electricity,
        NOMINAL_AVAILABLE_POWER_MWH,
        hoursInPeriod,
      )

      expect(result).toHaveLength(1)
      expect(result[0].revenueBTC).toBe(0.001)
      expect(result[0].priceUSD).toBe(95000)
      expect(result[0].sitePowerMW).toBe(20) // 20000000 W / 1000000 = 20 MW
    })

    it('should use fallback price when historical not available', () => {
      const transactions: MinerpoolTransactionData[] = [mockTransactionData]
      const prices: MinerHistoricalPrice[] = [mockCurrentPrice] // Only currentPrice, no ts/priceUSD
      const costs: ProductionCostData[] = []
      const electricity: ElectricityDataEntry[] = []

      const result = mergeDailyData(
        transactions,
        prices,
        costs,
        null,
        electricity,
        NOMINAL_AVAILABLE_POWER_MWH,
        hoursInPeriod,
      )

      expect(result).toHaveLength(1)
      expect(result[0].priceUSD).toBe(95000) // Should use fallback
    })

    it('should handle empty data gracefully', () => {
      const result = mergeDailyData(
        [],
        [],
        [],
        null,
        [],
        NOMINAL_AVAILABLE_POWER_MWH,
        hoursInPeriod,
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('aggregateByPeriod', () => {
    it('should aggregate daily data by month', () => {
      const dailyData: DailyEnergyData[] = [
        {
          ts: new Date('2025-01-15').getTime(),
          revenueBTC: 0.5,
          feesBTC: 0.01,
          priceUSD: 90000,
          sitePowerMW: 20,
          energyCostsUSD: 50000,
          operationalCostsUSD: 10000,
          curtailmentMWh: 100,
          curtailmentRate: 0.1,
          operationalIssues: 0.05,
        },
        {
          ts: new Date('2025-01-20').getTime(),
          revenueBTC: 0.6,
          feesBTC: 0.01,
          priceUSD: 95000,
          sitePowerMW: 21,
          energyCostsUSD: 52000,
          operationalCostsUSD: 11000,
          curtailmentMWh: 80,
          curtailmentRate: 0.08,
          operationalIssues: 0.03,
        },
      ]

      const currentBTCPrice = 87000
      const result = aggregateByPeriod(dailyData, 'month', currentBTCPrice)

      expect(result).toHaveLength(1)
      expect(result[0].period).toBe('2025-01')
      expect(result[0].revenueBTC).toBeCloseTo(1.1) // 0.5 + 0.6
      // revenueUSD = revenueBTC * avgPrice = 1.1 * ((90000+95000)/2) = 1.1 * 92500 = 101750
      expect(result[0].revenueUSD).toBeCloseTo(101750)
      expect(result[0].totalCostsUSD).toBe(123000) // 50000+10000+52000+11000
    })

    it('should calculate energy revenue per MW', () => {
      const dailyData: DailyEnergyData[] = [
        {
          ts: new Date('2025-01-15').getTime(),
          revenueBTC: 1.0,
          feesBTC: 0.01,
          priceUSD: 100000,
          sitePowerMW: 20,
          energyCostsUSD: 0,
          operationalCostsUSD: 0,
          curtailmentMWh: 0,
          curtailmentRate: 0,
          operationalIssues: 0,
        },
      ]

      const result = aggregateByPeriod(dailyData, 'month', 100000)

      expect(result[0].energyRevenueBTC_MW).toBeCloseTo(0.05) // 1.0 / 20
      expect(result[0].energyRevenueUSD_MW).toBeCloseTo(5000) // 100000 / 20
    })
  })

  describe('calculateEnergyRevenueMetrics', () => {
    it('should calculate revenue metrics as percentages', () => {
      const aggregatedData: AggregatedEnergyPeriodData[] = [
        {
          period: '01-25',
          ts: 1735689600000,
          revenueBTC: 1.0,
          revenueUSD: 100000,
          energyRevenueBTC_MW: 0.05,
          energyRevenueUSD_MW: 5000,
          totalCostsUSD: 50000,
          energyCostsUSD: 40000,
          operationalCostsUSD: 10000,
          sitePowerMW: 20,
          curtailmentRate: 0.1, // 10%
          operationalIssuesRate: 0.05, // 5%
        },
      ]

      const result = calculateEnergyRevenueMetrics(aggregatedData)

      expect(result.curtailmentRate).toBe(10) // 0.1 * 100
      expect(result.operationalIssuesRate).toBe(5) // 0.05 * 100
    })
  })

  describe('calculateEnergyCostMetrics', () => {
    it('should calculate cost metrics correctly', () => {
      const aggregatedData: AggregatedEnergyPeriodData[] = [
        {
          period: '01-25',
          ts: 1735689600000,
          revenueBTC: 1.0,
          revenueUSD: 100000,
          energyRevenueBTC_MW: 0.05,
          energyRevenueUSD_MW: 5000,
          totalCostsUSD: 50000,
          energyCostsUSD: 40000,
          operationalCostsUSD: 10000,
          sitePowerMW: 20,
          curtailmentRate: 0.1,
          operationalIssuesRate: 0.05,
        },
      ]

      const result = calculateEnergyCostMetrics(aggregatedData)

      expect(result.avgPowerConsumption).toBe(20)
      expect(result.avgEnergyCost).toBe(2000) // 40000 / 20
      expect(result.avgAllInCost).toBe(2500) // 50000 / 20
      expect(result.avgPowerAvailability).toBe(22.5) // Constant
      expect(result.avgOperationsCost).toBe(500) // 10000 / 20
      expect(result.avgEnergyRevenue).toBe(5000) // 100000 / 20
    })
  })

  describe('Chart transformations', () => {
    const mockAggregatedData: AggregatedEnergyPeriodData[] = [
      {
        period: '01-25',
        ts: 1735689600000,
        revenueBTC: 1.0,
        revenueUSD: 100000,
        energyRevenueBTC_MW: 0.05,
        energyRevenueUSD_MW: 5000,
        totalCostsUSD: 50000,
        energyCostsUSD: 40000,
        operationalCostsUSD: 10000,
        sitePowerMW: 20,
        curtailmentRate: 0.1,
        operationalIssuesRate: 0.05,
      },
    ]

    describe('transformToEnergyRevenueChartData', () => {
      it('should transform to USD energy revenue chart format by default', () => {
        const result = transformToEnergyRevenueChartData(mockAggregatedData)

        expect(result.labels).toEqual(['01-25'])
        expect(result.series).toHaveLength(1)
        expect(result.series[0].label).toBe('Revenue (USD/MWh)')
        expect(result.series[0].color).toBe(CHART_COLORS.red)
        expect(result.series[0].values).toEqual([5000])
      })

      it('should transform to BTC energy revenue chart format when mode is BTC', () => {
        const result = transformToEnergyRevenueChartData(mockAggregatedData, 'BTC')

        expect(result.labels).toEqual(['01-25'])
        expect(result.series).toHaveLength(1)
        expect(result.series[0].label).toBe('Revenue (BTC/MWh)')
        expect(result.series[0].color).toBe(CHART_COLORS.red)
        expect(result.series[0].values).toEqual([0.05])
      })
    })

    describe('transformToDowntimeChartData', () => {
      it('should transform to stacked downtime chart format with correct colors', () => {
        const result = transformToDowntimeChartData(mockAggregatedData)

        expect(result.labels).toEqual(['01-25'])
        expect(result.series).toHaveLength(2)
        expect(result.series[0].label).toBe('Curtailment')
        expect(result.series[0].color).toBe(CHART_COLORS.purple)
        expect(result.series[0].stack).toBe('stack1')
        expect(result.series[1].label).toBe('Op. Issues')
        expect(result.series[1].color).toBe(CHART_COLORS.blue)
        expect(result.series[1].stack).toBe('stack1')
      })
    })

    describe('transformToPowerChartData', () => {
      it('should transform to line chart format for ThresholdLineChart', () => {
        const result = transformToPowerChartData(mockAggregatedData)

        expect(result.series).toHaveLength(1)
        expect(result.series[0].label).toBe('Power Consumption')
        expect(result.series[0].color).toBe(CHART_COLORS.orange)
        expect(result.series[0].points).toHaveLength(1)
        expect(result.series[0].points[0].value).toBe(20)
        expect(result.constants).toHaveLength(1)
        expect(result.constants![0].label).toBe('Power Availability')
        expect(result.constants![0].value).toBe(22.5)
        expect(result.constants![0].color).toBe(CHART_COLORS.green)
      })
    })

    describe('transformToEnergyCostChartData', () => {
      it('should transform to revenue vs all-in cost chart format', () => {
        const result = transformToEnergyCostChartData(mockAggregatedData)

        expect(result.labels).toEqual(['01-25'])
        expect(result.series).toHaveLength(2)
        expect(result.series[0].label).toBe('All-In Cost')
        expect(result.series[1].label).toBe('Revenue')
      })
    })

    describe('BTC label formatting', () => {
      it('should use BTC formatter with 6 decimal places when in BTC mode', () => {
        const smallBtcData: AggregatedEnergyPeriodData[] = [
          {
            period: '01-25',
            ts: 1735689600000,
            revenueBTC: 0.001,
            revenueUSD: 87,
            energyRevenueBTC_MW: 0.00005, // Small BTC value
            energyRevenueUSD_MW: 4.35,
            totalCostsUSD: 50000,
            energyCostsUSD: 40000,
            operationalCostsUSD: 10000,
            sitePowerMW: 20,
            curtailmentRate: 0.1,
            operationalIssuesRate: 0.05,
          },
        ]

        const result = transformToEnergyRevenueChartData(smallBtcData, 'BTC')

        expect(result.series[0].datalabels).toBeDefined()
        // Test that the formatter handles small BTC values correctly
        const formatter = result.series[0].datalabels!.formatter as (value: number) => string
        expect(formatter(0.00005)).toBe('0.00005')
        expect(formatter(0.000123)).toBe('0.000123')
        expect(formatter(0.000001)).toBe('0.000001') // Should show up to 6 decimals
        expect(formatter(0)).toBe('0')
      })

      it('should use standard formatter for USD mode', () => {
        const result = transformToEnergyRevenueChartData(mockAggregatedData, 'USD')

        expect(result.series[0].datalabels).toBeDefined()
        const formatter = result.series[0].datalabels!.formatter as (value: number) => string
        // Standard formatter should show 2 decimal places max
        expect(formatter(5000.12345)).toBe('5,000.12')
        expect(formatter(0.00005)).toBe('0')
        expect(formatter(0)).toBe('0')
      })
    })
  })
})
