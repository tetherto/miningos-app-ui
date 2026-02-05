import { ArrowLeftOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import type { CollapseProps } from 'antd/es/collapse'
import _map from 'lodash/map'
import _values from 'lodash/values'
import React, { useState } from 'react'
import { Link } from 'react-router'

import { Header, HeaderSubtitle, PoolManagerDashboardRoot } from '../PoolManagerDashboard.styles'

import { PoolsCollapse } from './PoolManagerPools.styles'
import { getPools } from './PoolManagerPools.utils'

import { useGetMultiTailLogQuery, useGetThingConfigQuery } from '@/app/services/api'
import { ADD_POOL_ENABLED } from '@/Components/PoolManager/PoolManager.constants'
import { AddPoolModal } from '@/Components/PoolManager/Pools/AddPoolModal/AddPoolModal'
import PoolCollapseItemBody from '@/Components/PoolManager/Pools/PoolCollapseItemBody/PoolCollapseItemBody'
import PoolCollapseItemHeader from '@/Components/PoolManager/Pools/PoolCollapseItemHeader/PoolCollapseItemHeader'
import { Spinner } from '@/Components/Spinner/Spinner'
import { COMPLETE_MINER_TYPES } from '@/constants/deviceConstants'
import { ROUTE } from '@/constants/routes'
import { STAT_5_MINUTES } from '@/constants/tailLogStatKeys.constants'
import { useContextualModal } from '@/hooks/useContextualModal'

const minerTypes = _values(COMPLETE_MINER_TYPES)

const PoolManagerPools = () => {
  const [activePoolKey, setActivePoolKey] = useState<CollapseProps['activeKey']>([])

  const poolDataResult = useGetThingConfigQuery({
    requestType: 'poolConfig',
    type: 'miner',
  })

  const tailLogDataResult = useGetMultiTailLogQuery({
    limit: 1,
    aggrFields: JSON.stringify({
      hashrate_mhs_5m_active_container_group_cnt: 1,
    }),
    keys: JSON.stringify(
      _map(minerTypes, (minerType) => ({
        key: STAT_5_MINUTES,
        type: 'miner',
        tag: `t-${minerType}`,
      })),
    ),
  })

  const pools = getPools(poolDataResult.data, tailLogDataResult.data)

  const isLoading = poolDataResult.isLoading || tailLogDataResult.isLoading

  const {
    modalOpen: addPoolModalOpen,
    handleOpen: openAddPoolModal,
    handleClose: closeAddPoolModal,
  } = useContextualModal()

  // PoolSummary is compatible with Pool interface used by PoolCollapseItemBody/PoolCollapseItemHeader
  // Both expect endpoints with role, host, port which PoolSummary provides
  const collapseItems: CollapseProps['items'] = pools.map((pool) => ({
    key: pool.name,
    label: (
      <PoolCollapseItemHeader
        pool={
          pool as unknown as {
            validation?: { status?: string }
            endpoints: Array<{ role: string; host: string; port: string | number }>
            [key: string]: unknown
          }
        }
      />
    ),
    children: (
      <PoolCollapseItemBody
        pool={
          pool as unknown as {
            validation?: { status: string }
            endpoints: Array<{ role: string; host: string; port: string | number }>
            credentialsTemplate?: { workerName: string; suffixType: string }
            [key: string]: unknown
          }
        }
      />
    ),
  }))

  return (
    <PoolManagerDashboardRoot>
      <Header>
        <div>
          <div>Pools</div>
          <HeaderSubtitle>
            <Link to={ROUTE.POOL_MANAGER}>
              <ArrowLeftOutlined /> Pool Manager
            </Link>
          </HeaderSubtitle>
        </div>
        {ADD_POOL_ENABLED && (
          <Button type="primary" onClick={() => openAddPoolModal(undefined)}>
            Add Pool
          </Button>
        )}
      </Header>
      {isLoading ? (
        <Spinner />
      ) : (
        <PoolsCollapse
          defaultActiveKey={['1']}
          activeKey={activePoolKey}
          onChange={(value) => setActivePoolKey(value)}
          items={collapseItems}
        />
      )}
      {addPoolModalOpen && <AddPoolModal isOpen={addPoolModalOpen} onClose={closeAddPoolModal} />}
    </PoolManagerDashboardRoot>
  )
}

export default PoolManagerPools
