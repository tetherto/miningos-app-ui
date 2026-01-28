import _isNil from 'lodash/isNil'
import { FC } from 'react'

import LabeledCard from '../../Card/LabeledCard'
import { DeviceInfo } from '../../InfoContainer/InfoContainer'

import { getRackNameFromId } from '@/app/utils/deviceUtils'
import { MinerPoolDashboardData } from '@/Views/Dashboard/hooks/useMinePoolDashboardData'

interface PoolDetailsCardProps {
  data?: MinerPoolDashboardData
}

const PoolDetailsCard: FC<PoolDetailsCardProps> = ({ data }) => {
  if (!data) return null

  const {
    id,
    stats: { active_workers_count, username, unsettled, revenue_24h, balance },
  } = data

  const poolDetailsData = [
    { title: 'Id:', value: id ?? '' },
    { title: 'Rack:', value: getRackNameFromId(id) ?? '' },
    { title: 'User name:', value: username ?? '' },
    { title: 'Balance:', value: !_isNil(balance) ? unsettled : undefined },
    { title: 'Unsettled:', value: !_isNil(unsettled) ? unsettled : undefined },
    {
      title: 'Revenue last 24hrs:',
      value: !_isNil(revenue_24h) ? revenue_24h : undefined,
    },
    {
      title: 'Active Worker Count:',
      value: !_isNil(active_workers_count) ? active_workers_count : undefined,
    },
  ]

  return (
    <LabeledCard underline={false}>
      <DeviceInfo data={poolDetailsData} />
    </LabeledCard>
  )
}

export default PoolDetailsCard
