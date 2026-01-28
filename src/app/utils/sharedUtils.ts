import _isNumber from 'lodash/isNumber'
import _toString from 'lodash/toString'

type CallbackFunction<T> = (...args: unknown[]) => (err: Error | null, result?: T) => void

export const promisify =
  <T>(fn: CallbackFunction<T>) =>
  (...args: unknown[]): Promise<T> =>
    new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, result?: T) => {
        if (err) {
          return reject(err)
        }
        resolve(result!)
      })
    })

export const formatCountTo99Plus = (value: unknown): string => {
  if (!_isNumber(value)) return 'N/A'

  return value > 99 ? '99+' : _toString(value)
}

export const circularArrayAccess = function* (array: unknown[]) {
  let currentIndex = -1

  while (true) {
    currentIndex = (currentIndex + 1) % array.length
    yield array[currentIndex]
  }
}
