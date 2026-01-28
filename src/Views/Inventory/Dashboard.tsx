import { lazy, Suspense } from 'react'

import { InventoryDashboardRoot, Header } from './Dashboard.styles'

import { Spinner } from '@/Components/Spinner/Spinner'

const Dashboard = lazy(() =>
  import('@/Components/Inventory/Dashboard/Dashboard').then((m) => ({ default: m.Dashboard })),
)

const InventoryDashboard = () => (
  <InventoryDashboardRoot>
    <Header>INVENTORY MANAGEMENT DASHBOARD</Header>
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  </InventoryDashboardRoot>
)

export default InventoryDashboard
