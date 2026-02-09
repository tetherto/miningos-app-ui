import { ArrowLeftOutlined } from '@ant-design/icons'

import {
  Header,
  HeaderSubtitle,
  HeaderSubtitleLink,
  PoolManagerDashboardRoot,
} from '../PoolManagerDashboard.styles'

import { SitesOverviewStatusCardList } from '@/Components/PoolManager/SitesOverview/SitesOverviewStatusCardList'
import { ROUTE } from '@/constants/routes'

const SitesOverview = () => (
  <PoolManagerDashboardRoot>
    <Header>
      <div>
        <div>Site Overview</div>
        <HeaderSubtitle>
          <HeaderSubtitleLink to={ROUTE.POOL_MANAGER}>
            <ArrowLeftOutlined /> Pool Manager
          </HeaderSubtitleLink>
        </HeaderSubtitle>
      </div>
    </Header>
    <SitesOverviewStatusCardList />
  </PoolManagerDashboardRoot>
)

export default SitesOverview
