import _capitalize from 'lodash/capitalize'
import _map from 'lodash/map'

import { TYPE_FILTER_MAP } from '../../../app/utils/actionUtils'
import { FilterableMinerStatuses } from '../../../app/utils/statusUtils'

interface FilterOption {
  label: string
  value: string
}

interface AlertsFilterOption {
  label: string
  value: string
  children: FilterOption[] | (typeof TYPE_FILTER_MAP)[keyof typeof TYPE_FILTER_MAP][]
}

export const ALERTS_FILTER_OPTIONS: AlertsFilterOption[] = [
  {
    label: 'Status',
    value: 'status',
    children: _map(FilterableMinerStatuses, (value, label) => ({
      label: _capitalize(label),
      value,
    })),
  },
  {
    label: 'Severity',
    value: 'severity',
    children: [
      {
        label: 'Critical',
        value: 'critical',
      },
      {
        label: 'High',
        value: 'high',
      },
      {
        label: 'Medium',
        value: 'medium',
      },
    ],
  },
  {
    label: 'Type',
    value: 'type',
    children: [
      TYPE_FILTER_MAP.CONTAINER,
      TYPE_FILTER_MAP.MINER,
      TYPE_FILTER_MAP.LV_CABINET,
      TYPE_FILTER_MAP.POOL,
    ],
  },
]
