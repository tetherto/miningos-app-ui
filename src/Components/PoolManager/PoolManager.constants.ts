import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'

import { MinerStatuses } from '@/app/utils/statusUtils'
import { COLOR } from '@/constants/colors'

export const POOL_VALIDATION_STATUSES = {
  TESTED: 'TESTED',
  NOT_TESTED: 'NOT_TESTED',
} as const

export const POOL_VALIDATION_STATUS_LABELS = {
  [POOL_VALIDATION_STATUSES.TESTED]: 'Tested',
  [POOL_VALIDATION_STATUSES.NOT_TESTED]: 'Not Tested',
} as const

export const POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE = {
  INCREMENTAL: 'INCREMENTAL',
} as const

export const POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_LABELS = {
  INCREMENTAL: 'Incremental',
} as const

export const POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_OPTIONS = _map(
  _toPairs(POOL_CREDENTIAL_TEMPLATE_SUFFIX_TYPE_LABELS),
  ([value, label]) => ({
    value,
    label,
  }),
)

export const POOL_ENDPOINT_ROLES = {
  PRIMARY: 'PRIMARY',
  FAILOVER_1: 'FAILOVER_1',
  FAILOVER_2: 'FAILOVER_2',
} as const

export const POOL_ENDPOINT_ROLE_COLORS = {
  [POOL_ENDPOINT_ROLES.PRIMARY]: COLOR.GREEN,
  [POOL_ENDPOINT_ROLES.FAILOVER_1]: COLOR.GRAY,
  [POOL_ENDPOINT_ROLES.FAILOVER_2]: COLOR.RED,
} as const

export const POOL_ENDPOINT_ROLES_LABELS = {
  [POOL_ENDPOINT_ROLES.PRIMARY]: 'PRIMARY',
  [POOL_ENDPOINT_ROLES.FAILOVER_1]: 'FAILOVER 1',
  [POOL_ENDPOINT_ROLES.FAILOVER_2]: 'FAILOVER 2',
} as const

export const POOL_ENDPOINT_INDEX_ROLES = {
  0: POOL_ENDPOINT_ROLES.PRIMARY,
  1: POOL_ENDPOINT_ROLES.FAILOVER_1,
  2: POOL_ENDPOINT_ROLES.FAILOVER_2,
} as const

export const POOL_ENDPOINT_ROLES_OPTIONS = _map(
  _toPairs(POOL_ENDPOINT_ROLES_LABELS),
  ([value, label]) => ({
    value,
    label,
  }),
)

export const POOL_ENDPOINT_REGIONS = {
  EUROPE: 'EUROPE',
} as const

export const POOL_ENDPOINT_REGIONS_LABELS = {
  [POOL_ENDPOINT_REGIONS.EUROPE]: POOL_ENDPOINT_REGIONS.EUROPE,
} as const

export const POOL_ENDPOINT_REGIONS_OPTIONS = _map(
  _toPairs(POOL_ENDPOINT_REGIONS_LABELS),
  ([value, label]) => ({
    value,
    label,
  }),
)

export const SITE_OVERVIEW_STATUSES = {
  OFFLINE: 'offline',
  EMPTY: 'empty',
  NOT_MINING: 'not_mining',
  MINING: 'mining',
} as const

export const SITE_OVERVIEW_STATUS_LABELS = {
  [SITE_OVERVIEW_STATUSES.OFFLINE]: 'Offline',
  [SITE_OVERVIEW_STATUSES.EMPTY]: 'Empty',
  [SITE_OVERVIEW_STATUSES.NOT_MINING]: 'Not Mining (Sleep + Error)',
  [SITE_OVERVIEW_STATUSES.MINING]: 'Online',
} as const

export const SITE_OVERVIEW_STATUS_COLORS = {
  [SITE_OVERVIEW_STATUSES.OFFLINE]: COLOR.SLATE_GRAY,
  [SITE_OVERVIEW_STATUSES.EMPTY]: COLOR.WHITE_ALPHA_08,
  [SITE_OVERVIEW_STATUSES.NOT_MINING]: COLOR.RED,
  [SITE_OVERVIEW_STATUSES.MINING]: COLOR.STRONG_GREEN,
} as const

export const SiteOverviewDetailsLegendColors = {
  [SITE_OVERVIEW_STATUSES.OFFLINE]: COLOR.WHITE_ALPHA_05,
  [SITE_OVERVIEW_STATUSES.EMPTY]: COLOR.EBONY,
  [SITE_OVERVIEW_STATUSES.NOT_MINING]: COLOR.RED,
  [SITE_OVERVIEW_STATUSES.MINING]: COLOR.GREEN,
} as const

export const SETUP_POOLS_WARNING_MESSAGE =
  'Setup pool can cause a loss of efficiency during mining operations. It is recommended to setup pool when the miner is in Sleep mode.'

export const MINER_IN_POOL_STATUSES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  INACTIVE: 'inactive',
} as const

export const MINER_IN_POOL_STATUS_COLORS = {
  [MINER_IN_POOL_STATUSES.ONLINE]: COLOR.GREEN,
  [MINER_IN_POOL_STATUSES.OFFLINE]: COLOR.RED,
  [MINER_IN_POOL_STATUSES.INACTIVE]: COLOR.GREY_IDLE,
} as const

export const MINER_STATUS_TO_IN_POOL_STATUS = {
  [MinerStatuses.MINING]: MINER_IN_POOL_STATUSES.ONLINE,
  [MinerStatuses.OFFLINE]: MINER_IN_POOL_STATUSES.OFFLINE,
  [MinerStatuses.SLEEPING]: MINER_IN_POOL_STATUSES.INACTIVE,
  [MinerStatuses.ERROR]: MINER_IN_POOL_STATUSES.OFFLINE,
  [MinerStatuses.MAINTENANCE]: MINER_IN_POOL_STATUSES.INACTIVE,
  [MinerStatuses.ALERT]: MINER_IN_POOL_STATUSES.OFFLINE,
} as const

// Popups are disabled in V1
export const ADD_POOL_ENABLED = false
export const ADD_ENDPOINT_ENABLED = false
export const EDIT_ENDPOINT_ENABLED = false
export const POOL_STATUS_INDICATOR_ENABLED = false
export const ASSIGN_POOL_POPUP_ENABLED = false
