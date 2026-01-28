import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'

export function getErrorMessage(
  err: unknown,
  fallback = 'Failed to load cabinets.',
): string | null {
  const message = _get(err, ['data', 'message']) || _get(err, ['error']) || _get(err, ['message'])

  if (!message && _isEmpty(err)) return null

  return message || fallback
}
