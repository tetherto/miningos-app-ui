import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import _values from 'lodash/values'

import { formatNumber } from '../../../app/utils/format'
import { getLocationLabel } from '../../../app/utils/inventoryUtils'
import { COLOR } from '../../../constants/colors'
import { COMPLETE_MINER_TYPES } from '../../../constants/deviceConstants'
import {
  MINER_LOCATION_BORDER_COLORS,
  MINER_LOCATIONS,
  MINER_STATUS_BORDER_COLORS,
  MINER_STATUSES,
} from '../Miners/Miners.constants'
import {
  SPARE_PART_STATUS_BORDER_COLORS,
  SPARE_PART_STATUSES,
  SparePartTypes,
} from '../SpareParts/SpareParts.constants'

import type { UnknownRecord } from '@/types'

export const minersDistributionColumns = [
  {
    title: 'Miner',
    dataIndex: 'miner',
    key: 'miner',
  },
  // TODO: Not supported by API yet
  // {
  //   title: 'Container Miner Type',
  //   dataIndex: 'containerMinerType',
  //   key: 'containerMinerType',
  // },
  {
    title: 'Total Positions',
    dataIndex: 'totalPositions',
    key: 'totalPositions',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
    sorter: (aUnknown: UnknownRecord, bUnknown: UnknownRecord) => {
      const a = aUnknown as unknown as { totalPositions: number | undefined }
      const b = bUnknown as unknown as { totalPositions: number | undefined }

      return ((a.totalPositions as number) ?? 0) - ((b.totalPositions as number) ?? 0)
    },
  },
  {
    title: 'Available Positions',
    dataIndex: 'freePositions',
    key: 'freePositions',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
    sorter: (aUnknown: UnknownRecord, bUnknown: UnknownRecord) => {
      const a = aUnknown as unknown as { freePositions: number | undefined }
      const b = bUnknown as unknown as { freePositions: number | undefined }

      return ((a.freePositions as number) ?? 0) - ((b.freePositions as number) ?? 0)
    },
  },
  ..._map(_values(MINER_LOCATIONS), (location: unknown) => ({
    title: getLocationLabel(location as string),
    dataIndex: location as string,
    key: location as string,
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
  })),
]

export const minersFaultColumns = [
  {
    title: 'Miner Brand',
    dataIndex: 'minerBrand',
    key: 'minerBrand',
  },
  {
    title: 'Container Miner Type',
    dataIndex: 'containerMinerType',
    key: 'containerMinerType',
  },
  {
    title: 'No Hash',
    dataIndex: 'noHash',
    key: 'noHash',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
  },
  {
    title: 'Control Board',
    dataIndex: 'controlBoard',
    key: 'controlBoard',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
  },
  {
    title: 'Psu',
    dataIndex: 'psu',
    key: 'psu',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
  },
  {
    title: 'Hashboard',
    dataIndex: 'hashboard',
    key: 'hashboard',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
  },
  // TODO - This is not part of MVP
  // {
  //   title: 'Other',
  //   dataIndex: 'other',
  //   key: 'other',
  // },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (value: number | string | undefined) => formatNumber(value ?? 0),
  },
]

export const tableTwoData = [
  {
    key: '1',
    minerBrand: 'Whatsminer',
    containerMinerType: 'Bitdeer M56',
    noHash: 1080,
    controlBoard: 10,
    psu: 500,
    hashboard: 45,
    other: 6,
    total: 10,
  },
  {
    key: '2',
    minerBrand: 'Avalon',
    containerMinerType: 'Bitdeer A1346',
    noHash: 1000,
    controlBoard: 15,
    psu: 10,
    hashboard: 10,
    other: 10,
    total: 10,
  },
  // ... more row data
]

export const dryCoolerColumns = [
  {
    title: 'Site',
    dataIndex: 'site',
    key: 'site',
  },
  {
    title: 'Model',
    dataIndex: 'model',
    key: 'model',
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
  },
  {
    title: 'Container',
    dataIndex: 'container',
    key: 'container',
  },
  {
    title: 'Container Series',
    dataIndex: 'containerSeries',
    key: 'containerSeries',
  },
]

export const inventoryData = [
  {
    key: '1',
    site: 'Site-A',
    model: 'Bitdeer M56',
    serialNumber: 1081123561230,
    container: 10,
    containerSeries: 'asdiuho22oa2',
  },
  {
    key: '2',
    site: 'Site-A',
    model: 'Bitdeer M56',
    serialNumber: 1081123561230,
    container: 10,
    containerSeries: 'asdiuho22oa2',
  },
  // ... more row data
]

export const SPARE_PARTS_MULTI_TAIL_LOG_QUERY_ORDER = {
  [SparePartTypes.CONTROLLER]: 0,
  [SparePartTypes.HASHBOARD]: 1,
  [SparePartTypes.PSU]: 2,
}

export const ALL_MINERS = 'miner'

export const MINERS_MULTI_TAIL_LOG_QUERY_ORDER = {
  [ALL_MINERS]: 0,
  ..._fromPairs(_map(_values(COMPLETE_MINER_TYPES), (type, index) => [type, index + 1])),
}

export const MINER_STATUS_PIE_CHART_COLORS = {
  ...MINER_STATUS_BORDER_COLORS,
  [MINER_STATUSES.UNKNOWN]: COLOR.GREY,
}

export const MINER_LOCATION_PIE_CHART_COLORS = {
  ...MINER_LOCATION_BORDER_COLORS,
  [MINER_LOCATIONS.UNKNOWN]: COLOR.GREY,
}

export const SPARE_PART_STATUS_PIE_CHART_COLORS = {
  ...SPARE_PART_STATUS_BORDER_COLORS,
  [SPARE_PART_STATUSES.UNKNOWN]: COLOR.GREY,
}
