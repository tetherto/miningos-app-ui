import { getSmallestAndLargestTs } from '../getSmallestAndLargestTs'

describe('getSmallestAndLargestTimestamps', () => {
  test('returns the smallest start and largest end timestamps', () => {
    const timestamps = [
      { start: 1, end: 10 },
      { start: 5, end: 8 },
      { start: 16, end: 18 },
    ]

    const result = getSmallestAndLargestTs(timestamps)
    expect(result).toEqual({ start: 1, end: 18 })
  })

  test('returns null for start and end when array is empty', () => {
    const result = getSmallestAndLargestTs([])
    expect(result).toEqual({ start: null, end: null })
  })
})
