import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _startCase from 'lodash/startCase'

import { useGetWorkerConfigQuery } from '../../../app/services/api'
import { getMajorLocation } from '../../../app/utils/inventoryUtils'

interface UseLocationOptionsParams {
  majorLocation?: string
  minorLocation?: string
}

const useLocationOptions = ({
  majorLocation = 'unknown',
  minorLocation = 'unknown',
}: UseLocationOptionsParams = {}) => {
  const {
    data = {},
    isFetching: isLoading,
    error,
  } = useGetWorkerConfigQuery({
    type: 'ticket',
  })

  const allowedMovements = (() => {
    const head = _head(data as unknown[] | undefined)
    const firstItem = _isArray(head) ? _head(head as unknown[] | undefined) : head
    if (!firstItem || !_isObject(firstItem)) return []

    const config = (firstItem as Record<string, unknown>).config
    if (!config || !_isObject(config)) return []

    const siteMovements = (config as Record<string, unknown>).siteMovements
    if (!siteMovements || !_isObject(siteMovements)) return []

    const majorLocationData = (siteMovements as Record<string, unknown>)[majorLocation]
    if (!majorLocationData || !_isObject(majorLocationData)) return []

    const locations = (majorLocationData as Record<string, unknown>).locations
    if (!locations || !_isObject(locations)) return []

    const minorLocationData = (locations as Record<string, unknown>)[minorLocation]
    if (!minorLocationData || !_isObject(minorLocationData)) return []

    const allowedMovementsData = (minorLocationData as Record<string, unknown>).allowedMovements
    return _isArray(allowedMovementsData) ? (allowedMovementsData as string[]) : []
  })()

  const locationOptions = _map(allowedMovements || [], (allowedLocation: string) => ({
    label: _startCase(String(allowedLocation)),
    value: String(allowedLocation),
  }))

  const majorLocationOptions = _map(
    [
      ...new Set(
        _map(allowedMovements || [], (allowedLocation: string) =>
          getMajorLocation(String(allowedLocation)),
        ),
      ),
    ],
    (value: string) => ({
      label: _startCase(String(value)),
      value: String(value),
    }),
  )

  return {
    isLoading,
    error,
    locationOptions,
    majorLocationOptions,
  }
}

export default useLocationOptions
