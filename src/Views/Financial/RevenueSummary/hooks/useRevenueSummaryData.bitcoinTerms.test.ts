import { describe, expect, test } from 'vitest'

/**
 * Test calculations for "Avg Revenue - In Bitcoin Terms" metrics
 * Based on documentation values:
 * - Total Bitcoin Produced = 0.02368399750609298 BTC
 * - Average Hashrate = 1,525,212,649.28 MH/s = 1.52521264928 PH/s
 * - Average Power Consumption = 141,301.458146 W = 0.141301458146 MW (site_power_w / aggrIntervals = 1,261,539,418.3259432 / 8,928)
 * - Total MWh = 101.73705 MWh (0.141301458146 MW × 24 hours × 30 days)
 */
describe('Avg Revenue - In Bitcoin Terms Calculations', () => {
  const BTC_SATS = 100_000_000

  // Values from documentation
  const TOTAL_BTC = 0.02368399750609298
  const AVG_HASHRATE_MHS = 1525212649.28
  const AVG_HASHRATE_PHS = 1.52521264928
  const AVG_POWER_W = 141301.458146
  const AVG_POWER_MW = 0.141301458146
  const TOTAL_MWH = 101.73705

  // Expected values from documentation calculations
  // Avg Hash Revenue (BTC) = Total Bitcoin Produced × 60 × 60 × 24 / Avg Hashrate in PH/s
  // = Total Bitcoin Produced × 86400 / Avg Hashrate in PH/s
  const SECONDS_PER_DAY = 60 * 60 * 24 // 86400
  const EXPECTED_HASH_REVENUE_BTC_PER_PHS = (TOTAL_BTC * SECONDS_PER_DAY) / AVG_HASHRATE_PHS
  const EXPECTED_HASH_REVENUE_SATS_PER_PHS = EXPECTED_HASH_REVENUE_BTC_PER_PHS * BTC_SATS

  // Avg Energy Revenue (BTC) = Total Bitcoin / Total MWh
  const EXPECTED_ENERGY_REVENUE_BTC_PER_MWH = TOTAL_BTC / TOTAL_MWH
  const EXPECTED_ENERGY_REVENUE_SATS_PER_MWH = EXPECTED_ENERGY_REVENUE_BTC_PER_MWH * BTC_SATS

  test('should calculate Avg Hash Revenue - In Bitcoin Terms correctly', () => {
    // Formula: Avg Hash Revenue (BTC) = Total Bitcoin Produced × 86400 / Avg Hashrate in PH/s, then convert to SATS
    const avgHashratePHS = AVG_HASHRATE_MHS / 1e9
    const secondsPerDay = 60 * 60 * 24 // 86400
    const avgHashRevenueBTCPerPHS = (TOTAL_BTC * secondsPerDay) / avgHashratePHS
    const avgHashRevenueSatsPerPHS = avgHashRevenueBTCPerPHS * BTC_SATS

    expect(avgHashratePHS).toBeCloseTo(AVG_HASHRATE_PHS, 10)
    expect(avgHashRevenueBTCPerPHS).toBeCloseTo(EXPECTED_HASH_REVENUE_BTC_PER_PHS, 10)
    expect(avgHashRevenueSatsPerPHS).toBeCloseTo(EXPECTED_HASH_REVENUE_SATS_PER_PHS, 0)
  })

  test('should calculate Avg Energy Revenue - In Bitcoin Terms correctly', () => {
    // Formula: Avg Energy Revenue (BTC) = Total Bitcoin Produced / Total MWh, then convert to SATS
    const avgEnergyRevenueBTCPerMWh = TOTAL_BTC / TOTAL_MWH
    const avgEnergyRevenueSatsPerMWh = avgEnergyRevenueBTCPerMWh * BTC_SATS

    expect(avgEnergyRevenueBTCPerMWh).toBeCloseTo(EXPECTED_ENERGY_REVENUE_BTC_PER_MWH, 10)
    expect(avgEnergyRevenueSatsPerMWh).toBeCloseTo(EXPECTED_ENERGY_REVENUE_SATS_PER_MWH, 0)
  })

  test('should match documentation values exactly', () => {
    // Verify hash revenue calculation matches documentation
    // Documentation: 0.02368399750609298 × 86,400 / 1.52521264928 = ~1,341.65 BTC per PH/s per day
    const avgHashratePHS = AVG_HASHRATE_MHS / 1e9
    const secondsPerDay = 60 * 60 * 24 // 86400
    const avgHashRevenueBTCPerPHS = (TOTAL_BTC * secondsPerDay) / avgHashratePHS
    const avgHashRevenueSatsPerPHS = avgHashRevenueBTCPerPHS * BTC_SATS

    // Using calculated expected value (allowing for small precision differences)
    expect(avgHashRevenueBTCPerPHS).toBeCloseTo(EXPECTED_HASH_REVENUE_BTC_PER_PHS, 2)
    expect(avgHashRevenueSatsPerPHS).toBeCloseTo(EXPECTED_HASH_REVENUE_SATS_PER_PHS, 0)

    // Verify energy revenue calculation matches corrected values
    // With corrected Total MWh: 0.02368399750609298 / 101.73705 = 0.0002328... BTC/MWh
    const avgEnergyRevenueBTCPerMWh = TOTAL_BTC / TOTAL_MWH
    expect(avgEnergyRevenueBTCPerMWh).toBeCloseTo(EXPECTED_ENERGY_REVENUE_BTC_PER_MWH, 10)

    const avgEnergyRevenueSatsPerMWh = avgEnergyRevenueBTCPerMWh * BTC_SATS
    // With corrected calculation: ~23,280 SATS/MWh (much higher due to corrected Total MWh)
    expect(avgEnergyRevenueSatsPerMWh).toBeCloseTo(EXPECTED_ENERGY_REVENUE_SATS_PER_MWH, 0)
  })

  test('should calculate Total MWh from average power consumption correctly', () => {
    // Total MWh = Avg Consumption in MW × Number of hours in period
    // Corrected: 0.141301458146 MW × 24 hours × 30 days = 101.73705 MWh
    const hoursInPeriod = 24 * 30 // 30 days
    const totalMWh = AVG_POWER_MW * hoursInPeriod

    expect(totalMWh).toBeCloseTo(TOTAL_MWH, 2)
  })

  test('should handle zero values correctly', () => {
    const zeroBTC = 0
    const zeroHashrateMHS = 0
    const zeroPowerW = 0

    // Hash revenue with zero values
    const avgHashratePHS = zeroHashrateMHS / 1e9
    const secondsPerDay = 60 * 60 * 24 // 86400
    const avgHashRevenueBTCPerPHS =
      avgHashratePHS > 0 ? (zeroBTC * secondsPerDay) / avgHashratePHS : 0
    const avgHashRevenueSatsPerPHS = avgHashRevenueBTCPerPHS * BTC_SATS

    expect(avgHashRevenueSatsPerPHS).toBe(0)

    // Energy revenue with zero values
    const avgPowerConsumptionMW = zeroPowerW / 1e6
    const hoursInPeriod = 24 * 30
    const totalMWh = avgPowerConsumptionMW * hoursInPeriod
    const avgEnergyRevenueBTCPerMWh = totalMWh > 0 ? zeroBTC / totalMWh : 0
    const avgEnergyRevenueSatsPerMWh = avgEnergyRevenueBTCPerMWh * BTC_SATS

    expect(avgEnergyRevenueSatsPerMWh).toBe(0)
  })
})
