import { ALERT_SEVERITY_TYPES } from '../../app/utils/alertUtils'

import { ACTIVITY_LOG_STATUS } from './constants'

export const INCIDENTS_LOGS_DATA = [
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ALERT_SEVERITY_TYPES.CRITICAL,
    body: 'WhatsMiner M3x became offline',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ALERT_SEVERITY_TYPES.MEDIUM,
    body: 'WhatsMiner M3x became offline',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ALERT_SEVERITY_TYPES.HIGH,
    body: 'WhatsMiner M3x became offline',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ALERT_SEVERITY_TYPES.MEDIUM,
    body: 'WhatsMiner M3x became offline',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ALERT_SEVERITY_TYPES.CRITICAL,
    body: 'WhatsMiner M3x became offline',
  },
]

export const ACTIVITIES_LOGS_DATA = [
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ACTIVITY_LOG_STATUS.COMPLETED,
    body: 'Just now',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ACTIVITY_LOG_STATUS.COMPLETED,
    body: '59 minutes ago',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ACTIVITY_LOG_STATUS.PENDING,
    body: '12 hours ago',
  },
  {
    title: 'Miner #134',
    subtitle: 'IP 192.190.0.134',
    status: ACTIVITY_LOG_STATUS.PENDING,
    body: 'Today, 11:59 AM',
  },
]
