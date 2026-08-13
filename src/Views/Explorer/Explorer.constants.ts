import _map from 'lodash/map'
import _values from 'lodash/values'

import { getContainerTableColumns } from '@/Components/Explorer/List/Container.table'
import { getLvCabinetTableColumns } from '@/Components/Explorer/List/LvCabinet.table'
import { getMinersTableColumns } from '@/Components/Explorer/List/Miners.table'
import { COMPLETE_CONTAINER_TYPE, CONTAINER_TYPE_NAME_MAP } from '@/constants/containerConstants'
import {
  CABINET_DEVICES_TYPES_NAME_MAP,
  COMPLETE_MINER_TYPES,
  LV_CABINET_DEVICES_TYPE,
  MINER_TYPE_NAME_MAP,
} from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'

export const getExplorerFilterTabs = (
  cb: (date: Date | number, fixedTimezone?: string, formatString?: string) => string,
) => [
  {
    key: CROSS_THING_TYPES.CONTAINER,
    label: 'Containers',
    tags: ['t-container'],
    columns: getContainerTableColumns(cb),
    searchOptions: _map(_values(COMPLETE_CONTAINER_TYPE), (containerType) => ({
      label: CONTAINER_TYPE_NAME_MAP[containerType],
      value: containerType,
    })),
  },
  {
    key: CROSS_THING_TYPES.MINER,
    label: 'Miners',
    tags: ['t-miner'],
    columns: getMinersTableColumns(),
    searchOptions: _map(_values(COMPLETE_MINER_TYPES), (minerType) => ({
      label: MINER_TYPE_NAME_MAP[minerType],
      value: `t-${minerType}`,
    })),
  },
  {
    key: CROSS_THING_TYPES.CABINET,
    label: 'Cabinets',
    tags: ['t-powermeter', 't-sensor'],
    columns: getLvCabinetTableColumns(),
    searchOptions: _map(_values(LV_CABINET_DEVICES_TYPE), (cabinetDeviceType) => ({
      label: CABINET_DEVICES_TYPES_NAME_MAP[cabinetDeviceType],
      value: cabinetDeviceType,
    })),
  },
]

export const SetPowerModeValues = {
  antminer: ['sleep', 'normal'],
  avalon: ['sleep', 'normal', 'high'],
  whatsminer: ['sleep', 'low', 'normal', 'high'],
} as const
