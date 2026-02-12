import Empty from 'antd/es/empty'
import { Outlet } from 'react-router-dom'

import { useGetFeatureConfigQuery } from '../../app/services/api'
import GateKeeper from '../../Components/GateKeeper/GateKeeper'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'

import { EmptyStateContainer } from '@/styles/shared-styles'

const ReportsLayout = () => {
  const { data: featureConfig } = useGetFeatureConfigQuery()

  const isReportingEnabled = featureConfig?.reporting

  if (!isReportingEnabled) {
    return (
      <EmptyStateContainer>
        <Empty description="Reporting feature is not enabled" />
      </EmptyStateContainer>
    )
  }

  const reportingReadPermission = `${AUTH_PERMISSIONS.REPORTING}:${AUTH_LEVELS.READ}`

  return (
    <GateKeeper config={{ perm: reportingReadPermission }}>
      <Outlet />
    </GateKeeper>
  )
}

export default ReportsLayout
