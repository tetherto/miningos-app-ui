import { ArrowLeftOutlined } from '@ant-design/icons'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import { useParams } from 'react-router-dom'

import {
  Header,
  HeaderSubtitle,
  HeaderSubtitleLink,
  PoolManagerDashboardRoot,
} from '../PoolManagerDashboard.styles'

import { useGetListThingsQuery } from '@/app/services/api'
import { getContainerName } from '@/app/utils/containerUtils'
import SiteOverviewDetailsContainer from '@/Components/PoolManager/SiteOverviewDetails/SiteOverviewDetailsContainer'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ROUTE } from '@/constants/routes'

const SiteOverviewDetails = () => {
  const { unit: unitId } = useParams()
  const containerListQuery = useGetListThingsQuery({
    query: JSON.stringify({
      tags: {
        $in: [`id-${unitId}`],
      },
    }),
    limit: 1,
    status: 1,
    fields: JSON.stringify({
      id: 1,
      type: 1,
      code: 1,
      info: 1,
      address: 1,
      rack: 1,
      'last.snap.stats.status': 1,
      'last.snap.stats.are_all_errors_minor': 1,
      'last.snap.config.power_mode': 1,
      'last.snap.stats.hashrate': 1,
      'last.snap.stats.hashrate_mhs': 1,
      'last.snap.stats.temperature_c': 1,
      'last.snap.stats.frequency_mhz': 1,
      'last.snap.stats.power_w': 1,
      'last.snap.stats.uptime_ms': 1,
      'last.snap.config.led_status': 1,
      'last.snap.config.firmware_ver': 1,
      'last.snap.config.pool_config': 1,
      'last.alerts': 1,
    }),
  })

  const containerListThingsData =
    (containerListQuery.data as Array<Array<Record<string, unknown>>> | undefined) ?? []
  const { isLoading } = containerListQuery

  const unitData = _head(_head(containerListThingsData)) as Record<string, unknown> | undefined
  const unitName = !_isNil(unitData)
    ? getContainerName(_get(unitData, 'info.container') as string, _get(unitData, 'type') as string)
    : ''

  return (
    <PoolManagerDashboardRoot>
      <Header>
        <div>
          <div>Site Overview</div>
          <HeaderSubtitle>
            <HeaderSubtitleLink to={ROUTE.POOL_MANAGER_SITES_OVERVIEW}>
              <ArrowLeftOutlined /> Site Overview
            </HeaderSubtitleLink>
            {` ${unitName ? ` / ${unitName}` : ''}`}
          </HeaderSubtitle>
        </div>
      </Header>
      {isLoading ? <Spinner /> : <SiteOverviewDetailsContainer unit={unitData} />}
    </PoolManagerDashboardRoot>
  )
}

export default SiteOverviewDetails
