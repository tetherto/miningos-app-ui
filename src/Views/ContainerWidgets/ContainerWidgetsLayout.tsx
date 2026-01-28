import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'

const ContainerWidgetsLayout: FC = () => {
  const containersReadPermission = `${AUTH_PERMISSIONS.CONTAINER}:${AUTH_LEVELS.READ}`

  return (
    <GateKeeper config={{ perm: containersReadPermission }}>
      <Outlet />
    </GateKeeper>
  )
}

export default ContainerWidgetsLayout
