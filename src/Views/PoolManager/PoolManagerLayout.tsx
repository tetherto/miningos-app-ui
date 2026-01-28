import { Outlet } from 'react-router-dom'

import { PoolManagerLayoutRoot } from './PoolManager.styles'

const PoolManagerLayout = () => (
  <PoolManagerLayoutRoot>
    <Outlet />
  </PoolManagerLayoutRoot>
)

export default PoolManagerLayout
