import { Outlet } from 'react-router'

import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'

const CommentsLayout = () => {
  const commentsReadPermission = `${AUTH_PERMISSIONS.COMMENTS}:${AUTH_LEVELS.READ}`

  return (
    <GateKeeper config={{ perm: commentsReadPermission }}>
      <Outlet />
    </GateKeeper>
  )
}

export default CommentsLayout
