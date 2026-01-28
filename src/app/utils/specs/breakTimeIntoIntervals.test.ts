import _forEach from 'lodash/forEach'
import _map from 'lodash/map'
import _slice from 'lodash/slice'

import { breakTimeIntoIntervals } from '../breakTimeIntoIntervals'

interface TimeInterval {
  start: number
  end: number
}

const ONE_HOUR_MS = 60 * 60 * 1000

describe('breakTimeIntoIntervals', () => {
  test('splits time range correctly into 1-hour intervals', () => {
    const start = 1741782924000
    const end = 1741814724001 // 9 hours later
    const intervals = breakTimeIntoIntervals(start, end, ONE_HOUR_MS)

    expect(intervals.length).toBe(9)

    _forEach(_slice(intervals, 0, -1), (interval: TimeInterval) => {
      expect(interval.end - interval.start).toBe(ONE_HOUR_MS) // 1-hour duration
    })

    const starts = _map(intervals, ['start'])
    const ends = _map(intervals, ['end'])

    expect(starts.slice(1)).toEqual(_slice(ends, 0, -1)) // Ensure 1ms gap
  })

  test('handles case where last interval is shorter', () => {
    const start = 1741782924000
    const end = start + 2.5 * ONE_HOUR_MS // 2.5 hours later
    const intervals = breakTimeIntoIntervals(start, end, ONE_HOUR_MS)

    expect(intervals.length).toBe(3)
    expect(intervals[2].end).toBe(end) // Last interval should match end time
  })

  test('returns empty array if start >= end', () => {
    expect(breakTimeIntoIntervals(1000, 1000, ONE_HOUR_MS)).toEqual([])
    expect(breakTimeIntoIntervals(2000, 1000, ONE_HOUR_MS)).toEqual([])
  })

  test('handles large intervals properly', () => {
    const start = 1741782924000
    const end = start + 24 * ONE_HOUR_MS // 1 day later
    const intervals = breakTimeIntoIntervals(start, end, 6 * ONE_HOUR_MS) // 6-hour intervals

    expect(intervals.length).toBe(4)

    _forEach(intervals, (interval: TimeInterval) => {
      expect(interval.end - interval.start).toBe(6 * ONE_HOUR_MS)
    })

    const starts = _map(intervals, ['start'])
    const ends = _map(intervals, ['end'])

    expect(starts.slice(1)).toEqual(_slice(ends, 0, -1)) // Ensure 1ms gap
  })
})
