import _times from 'lodash/times'

interface TimeInterval {
  start: number
  end: number
}

/**
 * Breaks a time range into intervals of the specified number of hours.
 * Each interval starts 1ms after the previous one ends.
 *
 * @param {number} start - The start timestamp in milliseconds.
 * @param {number} end - The end timestamp in milliseconds.
 * @param {number} intervalMs - The interval size in ms.
 * @returns {Array<{start: number, end: number}>} An array of objects containing start and end timestamps for each interval.
 */
export const breakTimeIntoIntervals = (
  start: number,
  end: number,
  intervalMs: number,
): TimeInterval[] => {
  const totalIntervals = Math.ceil((end - start) / intervalMs)
  return _times(totalIntervals, (i: number) => {
    const intervalStart = start + i * intervalMs
    const intervalEnd = Math.min(intervalStart + intervalMs, end)

    return {
      start: intervalStart,
      end: intervalEnd,
    }
  })
}
