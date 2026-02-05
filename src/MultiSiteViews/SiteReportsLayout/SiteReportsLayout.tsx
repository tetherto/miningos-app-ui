import Empty from 'antd/es/empty'
import { Outlet } from 'react-router'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import { EmptyStateContainer } from '@/styles/shared-styles'

const SiteReportsLayout = () => {
  const { data: featureConfig } = useGetFeatureConfigQuery(undefined)

  const isReportingEnabled = featureConfig?.reporting

  if (!isReportingEnabled) {
    return (
      <EmptyStateContainer>
        <Empty description="Reporting feature is not enabled" />
      </EmptyStateContainer>
    )
  }

  return <Outlet />
}

export default SiteReportsLayout
