import Empty from 'antd/es/empty'
import Result from 'antd/es/result'
import _size from 'lodash/size'
import { Link } from 'react-router'

import LabeledCard from '../../Components/Card/LabeledCard'

import { MinerPoolDashboardData, useMinePoolDashboardData } from './hooks/useMinePoolDashboardData'
import columns from './MinerPools.columns'
import { EmptyPoolsContainer } from './MinerPools.styles'

import AppTable from '@/Components/AppTable/AppTable'

const MinerPools = () => {
  const { data, isError, isFetching, isLoading } = useMinePoolDashboardData()
  const size = _size(data)

  if (isError) {
    return (
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong."
        extra={<Link to="/">Back Home</Link>}
      />
    )
  }

  return (
    <LabeledCard noMargin isDark underline label="Mining pools" scrollable>
      {size === 0 ? (
        <EmptyPoolsContainer>
          <Empty description="No mining pools" />
        </EmptyPoolsContainer>
      ) : (
        <AppTable<MinerPoolDashboardData>
          rowKey="id"
          dataSource={data}
          columns={columns}
          pagination={false}
          loading={isFetching || isLoading}
        />
      )}
    </LabeledCard>
  )
}

export { MinerPools }
