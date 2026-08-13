import _map from 'lodash/map'
import _split from 'lodash/split'

export const getStackTrace = (error: Error | null | undefined) => {
  if (!error || !error.stack) {
    return 'No stack trace available'
  }

  const lines = _split(error.stack, '\n')

  return _map(lines, (item: string, index: number) => <code key={index}>{item}</code>)
}
