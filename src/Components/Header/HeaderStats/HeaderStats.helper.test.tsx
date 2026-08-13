import { getTotalAlerts, getTotalMiners } from './HeaderStats.helper'

describe('getTotalAlerts', () => {
  it('should correctly sum up the alerts from minerEntry, powerMeterLogEntry, and containerEntry', () => {
    const minerEntry = {
      alerts_aggr: {
        high: 3,
        medium: 2,
        critical: 1,
      },
    }

    const powerMeterLogEntry = {
      alerts_aggr: {
        high: 2,
        medium: 1,
        critical: 0,
      },
    }

    const containerEntry = {
      alerts_aggr: {
        high: 4,
        medium: 3,
        critical: 2,
      },
    }

    const result = getTotalAlerts(minerEntry, powerMeterLogEntry, containerEntry)

    expect(result).toEqual({
      high: 9,
      medium: 6,
      critical: 3,
    })
  })

  it('should return 0 for all alert levels when alerts_aggr is not provided', () => {
    const minerEntry = {}
    const powerMeterLogEntry = {}
    const containerEntry = {}

    const result = getTotalAlerts(minerEntry, powerMeterLogEntry, containerEntry)

    expect(result).toEqual({
      high: 0,
      medium: 0,
      critical: 0,
    })
  })

  it('should handle missing entries gracefully', () => {
    const minerEntry = {
      alerts_aggr: {
        high: 2,
        medium: 1,
        critical: 0,
      },
    }

    const powerMeterLogEntry = null
    const containerEntry = {
      alerts_aggr: {
        high: 1,
        medium: 2,
        critical: 1,
      },
    }

    const result = getTotalAlerts(minerEntry, powerMeterLogEntry, containerEntry)

    expect(result).toEqual({
      high: 3,
      medium: 3,
      critical: 1,
    })
  })
})

describe('getTotalMiners', () => {
  it('should correctly format and return the active and total miners', () => {
    const minersStatus = {
      active: 1000,
    }
    const nominalValue = 5000

    const result = getTotalMiners(minersStatus, nominalValue)

    expect(result).toBe('1,000 / 5,000')
  })

  it('should return a formatted string with a fallback when nominalValue is missing', () => {
    const minersStatus = {
      active: 1200,
    }
    const nominalValue = null

    const result = getTotalMiners(minersStatus, nominalValue)

    expect(result).toBe('1,200 / -')
  })

  it('should handle edge cases where active miners are undefined', () => {
    const minersStatus = {
      active: undefined,
    }
    const nominalValue = 3000

    const result = getTotalMiners(minersStatus, nominalValue)

    expect(result).toBe('- / 3,000')
  })

  it('should handle edge cases where both minersStatus and nominalValue are undefined', () => {
    const minersStatus = undefined
    const nominalValue = undefined

    const result = getTotalMiners(minersStatus, nominalValue)

    expect(result).toBe('- / -')
  })
})
