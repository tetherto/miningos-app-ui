import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router'

import { Header, HeaderSubtitle, PoolManagerDashboardRoot } from '../PoolManagerDashboard.styles'

import { SitesOverviewStatusCardList } from '@/Components/PoolManager/SitesOverview/SitesOverviewStatusCardList'
import { ROUTE } from '@/constants/routes'

const SitesOverview = () => (
  <PoolManagerDashboardRoot>
    <Header>
      <div>
        <div>Site Overview</div>
        <HeaderSubtitle>
          <Link to={ROUTE.POOL_MANAGER}>
            <ArrowLeftOutlined /> Pool Manager
          </Link>
        </HeaderSubtitle>
      </div>
    </Header>
    <SitesOverviewStatusCardList></SitesOverviewStatusCardList>
  </PoolManagerDashboardRoot>
)

export default SitesOverview
