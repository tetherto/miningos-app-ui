import _last from 'lodash/last'
import _split from 'lodash/split'

import {
  PART_ABBRV_MAPPING,
  SPARE_PART_LOCATION_BG_COLORS,
  SPARE_PART_LOCATION_BORDER_COLORS,
  SPARE_PART_STATUS_BG_COLORS,
  SPARE_PART_STATUS_BORDER_COLORS,
  SparePartNames,
} from '@/Components/Inventory/SpareParts/SpareParts.constants'

interface LocationColors {
  $backgroundColor: string
  $textColor: string
}

export const getLocationColors = (location: string): LocationColors => ({
  $backgroundColor: SPARE_PART_LOCATION_BG_COLORS[location] ?? 'none',
  $textColor: SPARE_PART_LOCATION_BORDER_COLORS[location] ?? 'unset',
})

interface StatusColors {
  $backgroundColor: string
  $textColor: string
}

export const getStatusColors = (status: string): StatusColors => ({
  $backgroundColor: SPARE_PART_STATUS_BG_COLORS[status] ?? 'none',
  $textColor: SPARE_PART_STATUS_BORDER_COLORS[status] ?? 'unset',
})

export const getSparePartKind = (type: string | undefined): string | undefined => {
  if (!type) return
  return _last(_split(type, '-'))
}

export const getPartTypeAbbreviation = (partType: string): string =>
  PART_ABBRV_MAPPING[partType] ?? SparePartNames[partType] ?? partType
