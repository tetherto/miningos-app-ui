import { describe, it, expect } from 'vitest'

import {
  CHART_LABELS,
  CHART_PERFORMANCE,
  CHART_TYPES,
  getChartAnimationConfig,
  getDataDecimationConfig,
  LABEL_TO_IGNORE,
} from '../charts'

describe('charts constants', () => {
  it('exports CHART_LABELS', () => {
    expect(CHART_LABELS.HASHRATE).toBe('Hashrate')
    expect(CHART_LABELS.EFFICIENCY).toBe('Efficiency')
  })

  it('exports CHART_TYPES', () => {
    expect(CHART_TYPES.MINER).toBe('miner')
    expect(CHART_TYPES.CONTAINER).toBe('container')
  })

  it('exports CHART_PERFORMANCE thresholds', () => {
    expect(CHART_PERFORMANCE.NO_ANIMATION_THRESHOLD).toBeGreaterThan(0)
    expect(CHART_PERFORMANCE.LARGE_DATASET_THRESHOLD).toBeGreaterThan(0)
    expect(CHART_PERFORMANCE.DECIMATION_THRESHOLD).toBeGreaterThan(0)
  })

  it('exports LABEL_TO_IGNORE array', () => {
    expect(Array.isArray(LABEL_TO_IGNORE)).toBe(true)
    expect(LABEL_TO_IGNORE).toContain('label')
  })
})

describe('getChartAnimationConfig', () => {
  it('disables animation entirely for very large datasets', () => {
    const result = getChartAnimationConfig(CHART_PERFORMANCE.NO_ANIMATION_THRESHOLD + 1)
    expect(result).toBe(false)
  })

  it('returns instant render (duration 0) for large datasets', () => {
    const count = CHART_PERFORMANCE.LARGE_DATASET_THRESHOLD + 1
    const result = getChartAnimationConfig(count) as { duration: number }
    expect(result).toEqual({ duration: 0 })
  })

  it('returns normal animation duration for small datasets', () => {
    const result = getChartAnimationConfig(50) as { duration: number }
    expect(result.duration).toBe(CHART_PERFORMANCE.ANIMATION_DURATION)
  })
})

describe('getDataDecimationConfig', () => {
  it('enables LTTB decimation for large datasets', () => {
    const result = getDataDecimationConfig(CHART_PERFORMANCE.DECIMATION_THRESHOLD + 1)
    expect(result.enabled).toBe(true)
    expect(result.algorithm).toBe('lttb')
  })

  it('disables decimation for small datasets', () => {
    const result = getDataDecimationConfig(10)
    expect(result.enabled).toBe(false)
    expect(result.algorithm).toBeUndefined()
  })
})
