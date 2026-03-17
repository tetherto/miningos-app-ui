import Alert from 'antd/es/alert'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import _compact from 'lodash/compact'
import _concat from 'lodash/concat'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _without from 'lodash/without'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { usePoolConfigs } from '../Pools/PoolManager.hooks'

import { SetPoolConfiguration } from './SetPoolConfiguration/SetPoolConfiguration'
import SetPoolConfigurationModal from './SetPoolConfiguration/SetPoolConfigurationModal'
import SitesOverviewStatusCard from './SitesOverviewStatusCard'
import {
  SetPoolConfigurationTabletButton,
  SitesOverviewRow,
  SitesUnitCol,
  SitesUnitWrapper,
  StickyConfigurationCol,
} from './SitesOverviewStatusCardList.styles'

import { useLazyGetListThingsQuery } from '@/app/services/api'
import { actionsSlice } from '@/app/slices/actionsSlice'
import { getContainerName } from '@/app/utils/containerUtils'
import { getMinerShortCode } from '@/app/utils/deviceUtils'
import { notifyInfo } from '@/app/utils/NotificationService'
import { getContainerMinersByContainerTagsQuery } from '@/app/utils/queryUtils'
import { Spinner } from '@/Components/Spinner/Spinner'
import { ACTION_TYPES } from '@/constants/actions'
import { ROUTE } from '@/constants/routes'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useSitesOverviewData, type ProcessedContainerUnit } from '@/hooks/useSitesOverviewData'
import { PoolSummary } from '@/Views/PoolManager/types'

const { setAddPendingSubmissionAction } = actionsSlice.actions

type ContainerMiner = {
  id: string
  code: string
  tags: string[]
}

export const SitesOverviewStatusCardList = () => {
  const dispatch = useDispatch()
  const [selected, setSelected] = useState<string[]>([])
  const navigate = useNavigate()
  const { isTablet } = useDeviceResolution()

  // Fetch and process all data using custom hook
  const { units, isLoading: isSiteOverviewDataLoading } = useSitesOverviewData()
  const {
    poolIdMap,
    isLoading: isPoolConfigsLoading,
    error: poolConfigsLoadingError,
  } = usePoolConfigs()
  const [lazyListThingsRequest] = useLazyGetListThingsQuery()

  const handleSelect = (id: string) => {
    setSelected((prev: string[]) => (_includes(prev, id) ? _without(prev, id) : _concat(prev, id)))
  }
  const handleCardClick = (unit: string) => navigate(`${ROUTE.POOL_MANAGER_SITES_OVERVIEW}/${unit}`)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const hasSelection = _size(selected) > 0

  const handleSetPoolConfigurationSubmit = async ({ pool }: { pool: PoolSummary }) => {
    const selectedContainersSet = new Set(selected)
    const containerTags = _compact(
      _map(
        _filter(units, (unit) => {
          const { id } = unit
          if (_isNil(id)) {
            return false
          }
          return selectedContainersSet.has(id)
        }),
        (unit) => {
          if (_isNil(unit.info?.container)) {
            return null
          }
          return `container-${unit.info?.container}`
        },
      ),
    )

    const minersInContainersResponse = await lazyListThingsRequest({
      query: getContainerMinersByContainerTagsQuery(containerTags),
      fields: JSON.stringify({
        id: 1,
        code: 1,
        tags: 1,
      }),
    })

    const minersInContainers = _head(minersInContainersResponse.data) as ContainerMiner[]
    const selectedDeviceIds = _map(minersInContainers, 'id')
    const codesList = _map(minersInContainers, (device) =>
      getMinerShortCode(device.code, device.tags),
    )

    dispatch(
      setAddPendingSubmissionAction({
        query: { id: { $in: selectedDeviceIds } },
        action: ACTION_TYPES.SETUP_POOLS,
        params: [
          {
            poolConfigId: pool.id,
            configType: 'pool',
          },
        ],
        overrideQuery: false,
        codesList,
        poolName: pool.name,
      }),
    )

    notifyInfo('Action added', 'Assign Pools')
    setSelected([])
  }

  const getPoolConfigName = (poolConfigId?: string) => {
    if (_isNil(poolConfigId)) {
      return
    }

    return _get(poolIdMap, [poolConfigId, 'name'])
  }

  const isLoading = isPoolConfigsLoading || isSiteOverviewDataLoading
  const hasError = !_isNil(poolConfigsLoadingError)

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {hasError ? (
            <Alert type="error" message="Failed to load data" />
          ) : (
            <SitesOverviewRow>
              <SitesUnitCol>
                <SitesUnitWrapper>
                  {_map(units, (unit: ProcessedContainerUnit) => (
                    <SitesOverviewStatusCard
                      key={unit.id}
                      id={unit.id ? Number(unit.id) : 0}
                      unit={getContainerName(unit.info?.container ?? '', unit.type)}
                      pool={getPoolConfigName(unit.info?.poolConfig) ?? '-'}
                      hashrate={unit.hashrate}
                      miners={unit.miners?.actualMiners ?? 0}
                      overrides={unit.poolStats?.overriddenConfig ?? 0}
                      onClick={() => handleCardClick(unit.id ?? '')}
                      checked={_includes(selected, unit.id)}
                      onSelect={(e: CheckboxChangeEvent) => {
                        e.stopPropagation()
                        handleSelect(unit.id ?? '')
                      }}
                      status={unit.status}
                    />
                  ))}
                </SitesUnitWrapper>
              </SitesUnitCol>

              {hasSelection &&
                (isTablet ? (
                  <>
                    <SetPoolConfigurationTabletButton onClick={openSidebar}>
                      <div>{`${selected.length} Selected unit${selected.length > 1 ? 's' : ''}`}</div>
                      <div>Selected</div>
                    </SetPoolConfigurationTabletButton>
                    <SetPoolConfigurationModal
                      isSidebarOpen={isSidebarOpen}
                      handleCancel={handleSidebarClose}
                      onSubmit={handleSetPoolConfigurationSubmit}
                    />
                  </>
                ) : (
                  <StickyConfigurationCol>
                    <SetPoolConfiguration
                      onSubmit={handleSetPoolConfigurationSubmit}
                    ></SetPoolConfiguration>
                  </StickyConfigurationCol>
                ))}
            </SitesOverviewRow>
          )}
        </>
      )}
    </>
  )
}
