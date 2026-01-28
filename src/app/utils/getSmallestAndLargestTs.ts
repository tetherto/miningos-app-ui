import _isEmpty from 'lodash/isEmpty'
import _maxBy from 'lodash/maxBy'
import _minBy from 'lodash/minBy'

interface TimeRange {
  start: number
  end: number
}

interface TimeRangeResult {
  start: number | null
  end: number | null
}

export const getSmallestAndLargestTs = (array: TimeRange[]): TimeRangeResult => {
  if (_isEmpty(array)) {
    return { start: null, end: null }
  }

  const minStart = _minBy(array, 'start')!.start
  const maxEnd = _maxBy(array, 'end')!.end

  return { start: minStart, end: maxEnd }
}
