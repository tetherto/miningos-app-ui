import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _split from 'lodash/split'
import _startCase from 'lodash/startCase'

export const getLocationLabel = (location: string | null | undefined): string => {
  if (_isNil(location) || location === 'unknown') {
    return 'Unknown'
  }

  return _startCase(_split(location, '.').join(' '))
}

/**
 * Get site from the whole location string
 * @param location Whole location string (eg: site.lab)
 * @returns The site fragment of the whole location string
 */
export const getMajorLocation = (location: string): string => {
  const parts = _split(location, '.')
  if (parts.length !== 2) {
    return 'unknown'
  }

  return _head(parts)!
}

/**
 * Get location from the whole location string
 * @param location Whole location string (eg: site.lab)
 * @returns The location fragment of the whole location string
 */
export const getMinorLocation = (location: string): string => {
  const parts = _split(location, '.')
  if (parts.length !== 2) {
    return 'unknown'
  }

  return parts[1]
}
