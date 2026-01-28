import _find from 'lodash/find'
import _get from 'lodash/get'
import _isNil from 'lodash/isNil'

import { getContainerName } from '@/app/utils/containerUtils'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'

export const ENERGY_REPORT_MINER_VIEW_SLICES = {
  MINER_TYPE: 'MINER_TYPE',
  MINER_UNIT: 'MINER_UNIT',
} as const

interface Container {
  type?: string
  info?: {
    container?: string
  }
}

interface SliceConfigItem {
  key: string
  title: string
  getLabelName: (category: string, containers?: Container[]) => string
  filterCategory?: (category: string, containers?: Container[]) => boolean
}

export const sliceConfig: Record<string, SliceConfigItem> = {
  [ENERGY_REPORT_MINER_VIEW_SLICES.MINER_TYPE]: {
    key: 'power_w_type_group_sum_aggr',
    title: 'Power Consumption',
    getLabelName: (category: string) => _get(MINER_TYPE_NAME_MAP, [category], category),
  },
  [ENERGY_REPORT_MINER_VIEW_SLICES.MINER_UNIT]: {
    key: 'power_w_container_group_sum_aggr',
    title: 'Power Consumption',
    filterCategory: (category: string) => category !== 'maintenance',
    getLabelName: (category: string, containers?: Container[]) => {
      const container = _find(containers, (c) => _get(c, ['info', 'container']) === category)
      if (_isNil(container?.type)) {
        return category
      }

      return getContainerName(category, container.type)
    },
  },
}
