import _isString from 'lodash/isString'
import _join from 'lodash/join'
import _keyBy from 'lodash/keyBy'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _parseInt from 'lodash/parseInt'
import _reduce from 'lodash/reduce'
import _replace from 'lodash/replace'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import _split from 'lodash/split'
import _values from 'lodash/values'

// For testing to be deleted
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateFakeDataset(
  startDate: string | Date,
  endDate: string | Date,
  minRange: number,
  maxRange: number,
) {
  const dataset = []
  const dataset2 = []
  const dataset3 = []

  const oneDay = 24 * 60 * 60 * 1000 // Number of milliseconds in one day

  // Convert the start and end dates to timestamps
  const startTimestamp = new Date(startDate).getTime()
  const endTimestamp = new Date(endDate).getTime()

  let currentDate = startTimestamp

  while (currentDate <= endTimestamp) {
    const randomNumber = getRandomInt(minRange, maxRange)
    dataset.push({ x: new Date(currentDate).toISOString(), y: randomNumber })
    dataset2.push({
      x: new Date(currentDate).toISOString(),
      y: randomNumber + getRandomInt(-10, 100),
    })
    dataset3.push({
      x: new Date(currentDate).toISOString(),
      y: randomNumber + getRandomInt(-150, -50),
    })
    // Move to the next day
    currentDate += oneDay
  }

  return { dataset, dataset2, dataset3 }
}

type ProcessDataProcessor = ((data: unknown) => unknown) | null | undefined

export const processDataset = (
  tailLogData: Record<string, unknown[]>,
  dataset: Record<string, unknown[]>,
  dataProcessor: ProcessDataProcessor = null,
) =>
  _reduce(
    _keys(tailLogData),
    (prev: Record<string, unknown[]>, tailLogKey: string) => {
      const processedData = dataProcessor
        ? dataProcessor(tailLogData[tailLogKey])
        : tailLogData[tailLogKey]
      return {
        ...prev,
        [tailLogKey]: _values({
          ..._keyBy(dataset[tailLogKey] as Array<{ ts: number | string }>, 'ts'),
          ..._keyBy(processedData as Array<{ ts: number | string }> | undefined, 'ts'),
        }),
      }
    },
    {} as Record<string, unknown[]>,
  )

export const hexToOpacity = (hex: string | unknown, opacity = 0.2): string => {
  if (!_isString(hex)) {
    throw new Error(
      `Expected a string for HEX color, but received ${typeof hex} ${JSON.stringify(hex)}`,
    )
  }

  let cleanedHex = _replace(hex, '#', '')

  if (_size(cleanedHex) === 3) {
    const chars = _split(cleanedHex, '')
    cleanedHex = _join(
      _map(chars, (char: string) => char + char),
      '',
    )
  }

  const r = _parseInt(_join(_slice(cleanedHex, 0, 2), ''), 16)
  const g = _parseInt(_join(_slice(cleanedHex, 2, 4), ''), 16)
  const b = _parseInt(_join(_slice(cleanedHex, 4, 6), ''), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
