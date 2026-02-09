import { JSX } from 'react'

import { EfficiencyMinerTypeView, EfficiencyMinerUnitView, EfficiencySiteView } from './tabs'

export const TAB_TYPES = {
  SITE_VIEW: 'site-view',
  MINER_TYPE_VIEW: 'miner-type-view',
  MINING_UNIT_VIEW: 'mining-unit-view',
} as const

export const TAB_LABELS = {
  [TAB_TYPES.SITE_VIEW]: 'Site View',
  [TAB_TYPES.MINER_TYPE_VIEW]: 'Miner Type View',
  [TAB_TYPES.MINING_UNIT_VIEW]: 'Mining Unit View',
} as const

export const tabs = [
  {
    key: TAB_TYPES.SITE_VIEW,
    label: TAB_LABELS[TAB_TYPES.SITE_VIEW],
  },
  {
    key: TAB_TYPES.MINER_TYPE_VIEW,
    label: TAB_LABELS[TAB_TYPES.MINER_TYPE_VIEW],
  },
  {
    key: TAB_TYPES.MINING_UNIT_VIEW,
    label: TAB_LABELS[TAB_TYPES.MINING_UNIT_VIEW],
  },
]

export const VIEW_BY_TAB_TYPE: Record<string, JSX.Element> = {
  [TAB_TYPES.SITE_VIEW]: <EfficiencySiteView />,
  [TAB_TYPES.MINER_TYPE_VIEW]: <EfficiencyMinerTypeView />,
  [TAB_TYPES.MINING_UNIT_VIEW]: <EfficiencyMinerUnitView />,
}

export const TAIL_LOG_MINER_TYPE_KEY = 'efficiency_w_ths_type_group_avg_aggr'
export const TAIL_LOG_CONTAINER_KEY = 'efficiency_w_ths_container_group_avg_aggr'
