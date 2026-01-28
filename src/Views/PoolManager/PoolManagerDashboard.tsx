import { Header, PoolManagerDashboardRoot } from './PoolManagerDashboard.styles'

import Dashboard from '@/Components/PoolManager/Dashboard/Dashboard'

const PoolManagerDashboard = () => (
  <PoolManagerDashboardRoot>
    <Header>Pool Manager</Header>
    <Dashboard />
  </PoolManagerDashboardRoot>
)

export default PoolManagerDashboard
