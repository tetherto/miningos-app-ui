import { describe, it, expect } from 'vitest'

import {
  BAR_WIDTH,
  BAR_PERCENTAGE,
  CATEGORY_PERCENTAGE,
} from '../Report/components/SiteDetails/SiteDetails.const'
import { PERIOD_CONFIG, getPeriodConfig } from '../Report/hooks/useReportConfig'
import { DEFAULT_TIMEZONE, DEFAULT_SHOW_LOGO, DEFAULT_IS_COVER } from '../Report/Report.constants'
import {
  REPORT_DURATIONS,
  REPORT_DURATION_NAMES,
  REPORTS_GENERATION_CONFIG,
  reportDurationOptions,
} from '../Reports/Reports.constants'

describe('Report.constants', () => {
  it('exports DEFAULT_TIMEZONE', () => {
    expect(DEFAULT_TIMEZONE).toBe('UTC')
  })

  it('exports DEFAULT_SHOW_LOGO and DEFAULT_IS_COVER', () => {
    expect(DEFAULT_SHOW_LOGO).toBe(true)
    expect(DEFAULT_IS_COVER).toBe(false)
  })
})

describe('SiteDetails.const', () => {
  it('exports bar dimension constants', () => {
    expect(BAR_WIDTH).toBe(28)
    expect(BAR_PERCENTAGE).toBeGreaterThan(0)
    expect(CATEGORY_PERCENTAGE).toBeGreaterThan(0)
  })
})

describe('Reports.constants', () => {
  it('exports REPORT_DURATIONS', () => {
    expect(REPORT_DURATIONS.YEARLY).toBe('yearly')
    expect(REPORT_DURATIONS.MONTHLY).toBe('monthly')
    expect(REPORT_DURATIONS.WEEKLY).toBe('weekly')
  })

  it('exports REPORT_DURATION_NAMES with labels', () => {
    expect(REPORT_DURATION_NAMES.yearly).toBe('Yearly')
    expect(REPORT_DURATION_NAMES.monthly).toBe('Monthly')
    expect(REPORT_DURATION_NAMES.weekly).toBe('Weekly')
  })

  it('exports reportDurationOptions array', () => {
    expect(Array.isArray(reportDurationOptions)).toBe(true)
    expect(reportDurationOptions).toHaveLength(3)
    reportDurationOptions.forEach((opt) => {
      expect(opt.id).toBeDefined()
      expect(opt.label).toBeDefined()
    })
  })

  it('exports REPORTS_GENERATION_CONFIG for each duration', () => {
    expect(REPORTS_GENERATION_CONFIG.weekly).toBeDefined()
    expect(REPORTS_GENERATION_CONFIG.monthly).toBeDefined()
    expect(REPORTS_GENERATION_CONFIG.yearly).toBeDefined()
    expect(typeof REPORTS_GENERATION_CONFIG.weekly.getEndDate).toBe('function')
    expect(typeof REPORTS_GENERATION_CONFIG.weekly.getIntervals).toBe('function')
  })
})

describe('useReportConfig', () => {
  it('exports PERIOD_CONFIG for all report types', () => {
    expect(PERIOD_CONFIG.weekly).toBeDefined()
    expect(PERIOD_CONFIG.monthly).toBeDefined()
    expect(PERIOD_CONFIG.yearly).toBeDefined()
  })

  it('getPeriodConfig returns correct config for weekly', () => {
    const config = getPeriodConfig('weekly')
    expect(config.buckets).toBe(7)
    expect(config.days).toBe(7)
    expect(config.periodLabel).toBe('Weekly')
  })

  it('getPeriodConfig returns correct config for monthly', () => {
    const config = getPeriodConfig('monthly')
    expect(config.buckets).toBe(11)
    expect(config.days).toBe(31)
  })

  it('getPeriodConfig returns correct config for yearly', () => {
    const config = getPeriodConfig('yearly')
    expect(config.buckets).toBe(12)
    expect(config.days).toBe(365)
  })

  it('getPeriodConfig falls back to yearly for unknown report type', () => {
    const config = getPeriodConfig('unknown')
    expect(config).toEqual(PERIOD_CONFIG.yearly)
  })
})
