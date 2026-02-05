import { Outlet } from 'react-router'

import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'

const ExplorerLayout = () => {
  const explorerReadPermission = `${AUTH_PERMISSIONS.EXPLORER}:${AUTH_LEVELS.READ}`

  return (
    <GateKeeper config={{ perm: explorerReadPermission }}>
      <Outlet />
    </GateKeeper>
  )
}

export default ExplorerLayout
