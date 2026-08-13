import _map from 'lodash/map'
import _values from 'lodash/values'

import { SparePartNames, SparePartTypes } from '../SpareParts/SpareParts.constants'

export const SHOW_DETAILS = 'Show Details'
export const DEVICE_HISTORY = 'Device History'

export const MOVEMENTS_ACTIONS = {
  1: SHOW_DETAILS,
  2: DEVICE_HISTORY,
}

export const SEARCHABLE_MOVEMENT_ATTRIBUTES = [
  'date',
  'serialNum',
  'macAddress',
  'type',
  'origin',
  'destination',
  'previousStatus',
  'newStatus',
  'code',
]

export const MOVEMENTS_LIST_TAB_ITEMS = [
  { key: 'miner', label: 'Miner' },
  ..._map(_values(SparePartTypes), (type: string) => ({
    key: type,
    label: (SparePartNames as Record<string, string>)[type] || type,
  })),
]
