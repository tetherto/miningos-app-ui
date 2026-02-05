import { Outlet } from 'react-router'

import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'

const AlertsLayout = () => {
  const alertsReadPermission = `${AUTH_PERMISSIONS.ALERTS}:${AUTH_LEVELS.READ}`

  return (
    <GateKeeper config={{ perm: alertsReadPermission }}>
      <Outlet />
    </GateKeeper>
  )
}

export default AlertsLayout
