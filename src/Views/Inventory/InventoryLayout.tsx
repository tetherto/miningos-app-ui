import { Outlet } from 'react-router-dom'

import { useGetFeaturesQuery } from '../../app/services/api'
import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'
import NotFoundPage from '../NotFoundPage/NotFoundPage'

import { FeatureFlagsData } from '@/types'

const inventoryReadPermission = `${AUTH_PERMISSIONS.INVENTORY}:${AUTH_LEVELS.READ}`

const InventoryLayout = () => {
  const { data: featureFlags } = useGetFeaturesQuery<FeatureFlagsData>(undefined)
  const isInventoryEnabled = featureFlags?.inventory

  if (!isInventoryEnabled) return <NotFoundPage />

  return (
    <GateKeeper config={{ perm: inventoryReadPermission }}>
      <Outlet />
    </GateKeeper>
  )
}

export default InventoryLayout
