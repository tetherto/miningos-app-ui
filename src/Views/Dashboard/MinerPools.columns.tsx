import type { ColumnProps } from 'antd/es/table'

import PoolDetailsPopover from '../../Components/Dashboard/PoolDetailsPopover/PoolDetailsPopover'

import { MinerPoolDashboardData } from './hooks/useMinePoolDashboardData'

import { getHashrateString } from '@/app/utils/deviceUtils'
import { formatValueUnit } from '@/app/utils/format'
import { decimalToMegaNumber } from '@/app/utils/numberUtils'

const columns: ColumnProps<MinerPoolDashboardData>[] = [
  { title: 'Pool', dataIndex: 'id', key: 'id' },
  {
    title: 'Revenue 24hrs',
    dataIndex: 'stats',
    key: 'revenue_24h',
    render: (_, record) => formatValueUnit(record.stats?.revenue_24h ?? 0, 'BTC'),
  },
  {
    title: 'Hash rate',
    dataIndex: 'stats',
    key: 'hashrate',
    render: (_, record) => getHashrateString(decimalToMegaNumber(record.stats?.hashrate ?? 0)),
  },
  {
    title: '',
    dataIndex: 'id',
    key: 'details',
    render: (_, record) => <PoolDetailsPopover data={record} />,
  },
]

export default columns
