import { Outlet } from 'react-router'

import { PoolManagerLayoutRoot } from './PoolManager.styles'

const PoolManagerLayout = () => (
  <PoolManagerLayoutRoot>
    <Outlet />
  </PoolManagerLayoutRoot>
)

export default PoolManagerLayout
