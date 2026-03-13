import { ArrowLeftOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import type { CollapseProps } from 'antd/es/collapse'
import _map from 'lodash/map'
import _values from 'lodash/values'
import _includes from 'lodash/includes'
import _get from 'lodash/get'
import { useState } from 'react'

import {
  Header,
  HeaderSubtitle,
  HeaderSubtitleLink,
  PoolManagerDashboardRoot,
} from '../PoolManagerDashboard.styles'

import { PoolsCollapse } from './PoolManagerPools.styles'

import { ADD_POOL_ENABLED } from '@/Components/PoolManager/PoolManager.constants'
import { AddPoolModal } from '@/Components/PoolManager/Pools/AddPoolModal/AddPoolModal'
import PoolCollapseItemBody from '@/Components/PoolManager/Pools/PoolCollapseItemBody/PoolCollapseItemBody'
import PoolCollapseItemHeader from '@/Components/PoolManager/Pools/PoolCollapseItemHeader/PoolCollapseItemHeader'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ROUTE } from '@/constants/routes'
import { useContextualModal } from '@/hooks/useContextualModal'
import { usePoolConfigs } from '@/Components/PoolManager/Pools/PoolManager.hooks'

const PoolManagerPools = () => {
  const [activePoolKey, setActivePoolKey] = useState<CollapseProps['activeKey']>([])

  const { pools, isLoading: isPoolDataLoading } = usePoolConfigs()

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
    children: <PoolCollapseItemBody pool={pool} />,
  }))

  const isLoading = isPoolDataLoading

  return (
    <PoolManagerDashboardRoot>
      <Header>
        <div>
          <div>Pools</div>
          <HeaderSubtitle>
            <HeaderSubtitleLink to={ROUTE.POOL_MANAGER}>
              <ArrowLeftOutlined /> Pool Manager
            </HeaderSubtitleLink>
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
