import _reduce from 'lodash/reduce'

import { getSiteRunningRanges, getLatest24HoursRanges } from '../siteUtils'

describe('getSiteRunningRanges', () => {
  it('should return valid running ranges with buffer excluded', () => {
    const logs = [
      { ts: 1744772000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744782000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744788000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744792000000, aggrCount: 2, full_mining_startup_count: 0 },
    ]

    const result = getSiteRunningRanges(logs)

    // Expect range after skipping 1 hour at start and end to be valid
    expect(result.length).toBe(1)
    expect(result[0].start).toBe(1744772000000 + 3600000)
    expect(result[0].end).toBe(1744792000000 - 3600000)
  })

  it('should exclude range if duration is too short after buffer', () => {
    const logs = [
      { ts: 1744785000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744789000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744792000000, aggrCount: 2, full_mining_startup_count: 0 },
    ]

    const result = getSiteRunningRanges(logs)
    expect(result).toEqual([])
  })

  it('should handle running range at the end of the log', () => {
    const logs = [
      { ts: 1744772000000, aggrCount: 2, full_mining_startup_count: 0 },
      { ts: 1744782000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744788000000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 1744792000000, aggrCount: 2, full_mining_startup_count: 2 },
    ]

    const result = getSiteRunningRanges(logs)

    expect(result.length).toBe(1)
    expect(result[0].start).toBe(1744782000000 + 3600000)
    expect(result[0].end).toBe(1744792000000 - 3600000)
  })

  it('should return empty when all ranges are invalid after trimming buffer', () => {
    const logs = [
      { ts: 1000, aggrCount: 2, full_mining_startup_count: 2 },
      { ts: 61000, aggrCount: 2, full_mining_startup_count: 0 },
    ]

    const result = getSiteRunningRanges(logs)
    expect(result).toEqual([])
  })
})

describe('getLatest24HoursRanges', () => {
  const oneHour = 60 * 60 * 1000
  const now = Date.now()

  it('returns all ranges if total is less than 24 hours', () => {
    const ranges = [
      { start: now - oneHour * 3, end: now - oneHour * 2 },
      { start: now - oneHour * 2, end: now - oneHour },
      { start: now - oneHour, end: now },
    ]

    const result = getLatest24HoursRanges(ranges)
    expect(result).toHaveLength(3)
    expect(result[0].start).toBe(ranges[0].start)
    expect(result[2].end).toBe(ranges[2].end)
  })

  it('returns only latest ranges summing to 24 hours', () => {
    const base = now
    const ranges = Array.from({ length: 30 }, (_, i) => {
      const end = base - i * oneHour
      return { start: end - oneHour, end }
    })

    const result = getLatest24HoursRanges(ranges)
    const total = _reduce<{ start: number; end: number }, number>(
      result,
      (sum: number, r: { start: number; end: number }) => sum + (r.end - r.start),
      0,
    )

    expect(result.length).toBeLessThanOrEqual(24)
    expect(total).toBe(24 * oneHour)
  })

  it('returns a partial range if the last one exceeds remaining duration', () => {
    const partialRange = { start: now - oneHour, end: now }
    const longRange = {
      start: now - 25 * oneHour,
      end: now - oneHour,
    }

    const result = getLatest24HoursRanges([partialRange, longRange])
    const total = _reduce<{ start: number; end: number }, number>(
      result,
      (sum: number, r: { start: number; end: number }) => sum + (r.end - r.start),
      0,
    )

    expect(total).toBe(24 * oneHour)
    expect(result).toHaveLength(2)
    expect(result[1].end).toBe(partialRange.end)
  })

  it('returns an empty array if input is empty', () => {
    const result = getLatest24HoursRanges([])
    expect(result).toEqual([])
  })

  it('preserves chronological order in output', () => {
    const a = { start: now - 3 * oneHour, end: now - 2 * oneHour }
    const b = { start: now - 2 * oneHour, end: now - oneHour }
    const c = { start: now - oneHour, end: now }

    const shuffled = [c, a, b]
    const result = getLatest24HoursRanges(shuffled)

    for (let i = 1; i < result.length; i++) {
      expect(result[i].start).toBeGreaterThanOrEqual(result[i - 1].start)
    }
  })
})
