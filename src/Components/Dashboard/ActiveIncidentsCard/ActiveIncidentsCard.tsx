import _first from 'lodash/first'
import _head from 'lodash/head'
import _isArray from 'lodash/isArray'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGetListThingsQuery } from '@/app/services/api'
import { getAlertsForDevices, getAlertsSortedByGeneralFields } from '@/app/utils/alertUtils'
import { LOG_TYPES } from '@/Components/LogsCard/constants'
import LogsCard from '@/Components/LogsCard/LogsCard'
import { POLLING_20s } from '@/constants/pollingIntervalConstants'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import useTimezone from '@/hooks/useTimezone'
import { onLogClicked } from '@/Views/Alerts/Alerts.util'

const SKELETON_ROWS = 4

const ActiveIncidentsCard = memo(() => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const { getFormattedDate } = useTimezone()

  const navigate = useNavigate()
  const { data, isLoading } = useGetListThingsQuery(
    {
      status: 1,
      query: JSON.stringify({
        'last.alerts': { $ne: null },
      }),
      fields: JSON.stringify({
        id: 1,
        type: 1,
        'info.pos': 1,
        'info.container': 1,
        'last.alerts': 1,
      }),
    },
    {
      pollingInterval: smartPolling20s,
    },
  )

  const devices = _isArray(data) && _isArray(_first(data)) ? _head(data) : []

  const rawAlerts = getAlertsForDevices(devices, getFormattedDate)

  const sortedAlerts = getAlertsSortedByGeneralFields(rawAlerts)

  return (
    <LogsCard
      isDark
      isLoading={isLoading}
      logsData={sortedAlerts}
      label="Active Alerts"
      skeletonRows={SKELETON_ROWS}
      type={LOG_TYPES.INCIDENTS}
      emptyMessage="No active alerts"
      onLogClicked={(id: string) => onLogClicked(navigate, id)}
    />
  )
})

ActiveIncidentsCard.displayName = 'ActiveIncidentsCard'

export default ActiveIncidentsCard
