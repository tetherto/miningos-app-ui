import Tabs from 'antd/es/tabs'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _isNil from 'lodash/isNil'
import _map from 'lodash/map'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'
import _toLower from 'lodash/toLower'
import _trim from 'lodash/trim'
import * as React from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { useGetHistoricalLogsQuery, useGetListThingsQuery } from '../../../app/services/api'
import { getMinerShortCode } from '../../../app/utils/deviceUtils'
import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import DeviceDetails from '../../../Components/Inventory/Movements/MovementDetailsModal/DeviceDetails'
import MovementDetailsModal from '../../../Components/Inventory/Movements/MovementDetailsModal/MovementDetailsModal'
import {
  DEVICE_HISTORY,
  MOVEMENTS_LIST_TAB_ITEMS,
  SEARCHABLE_MOVEMENT_ATTRIBUTES,
  SHOW_DETAILS,
} from '../../../Components/Inventory/Movements/Movements.constants'
import {
  getMovementsColumns,
  type MovementRecord,
} from '../../../Components/Inventory/Movements/Movements.utils'
import { Spinner } from '../../../Components/Spinner/Spinner'
import { useContextualModal } from '../../../hooks/useContextualModal'
import { FilterWrapper, Wrapper } from '../Inventory.styles'

import { DeviceDetailsWrapper } from './HistoricalMovements.style'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'
import {
  INVENTORY_DEFAULT_PAGE_SIZE,
  INVENTORY_PAGINATION_STORAGE_KEYS,
} from '@/constants/inventoryPagination'
import useInventoryPagination from '@/hooks/useInventoryPagination'
import useTimezone from '@/hooks/useTimezone'

const HistoricalMovements = () => {
  const { getFormattedDate } = useTimezone()
  const navigate = useNavigate()
  const { deviceId } = useParams()

  const [selectedTab, setSelectedTab] = useState('miner')
  const [filterText, setFilterText] = useState('')
  const { pagination, handlePaginationChange } = useInventoryPagination({
    storageKey: INVENTORY_PAGINATION_STORAGE_KEYS.MOVEMENTS,
    defaultPageSize: INVENTORY_DEFAULT_PAGE_SIZE,
  })

  let query: UnknownRecord = {
    $or: [
      {
        'changes.status': {
          $exists: true,
        },
      },
      {
        'changes.location': {
          $exists: true,
        },
      },
    ],
  }

  if (deviceId) {
    query = {
      $and: [
        query,
        {
          'thing.id': deviceId,
        },
      ],
    } as UnknownRecord
  }

  const { data, isLoading: isMovementsLoading } = useGetHistoricalLogsQuery({
    logType: 'info',
    query: JSON.stringify(query),
  })

  const { data: listThingsData, isLoading: isDeviceDetailsLoading } = useGetListThingsQuery(
    {
      query: JSON.stringify({
        id: deviceId,
      }),
      limit: 1,
    },
    {
      skip: _isNil(deviceId),
    },
  )

  const deviceDetails =
    !_isNil(listThingsData) &&
    (_head(_head(listThingsData as unknown[]) as unknown[]) as UnknownRecord | undefined)

  const getMappedItems = (): MovementRecord[] => {
    const dataArray = _head(data) as UnknownRecord[] | undefined
    if (isMovementsLoading || !dataArray?.length) {
      return []
    }

    return _map(dataArray, (movement: UnknownRecord, index: number) => {
      const deviceId = _get(movement, 'thing.id') as string | undefined
      const timestamp = movement.ts as number
      const origin = _get(movement, 'changes.location.oldValue') as string | undefined
      const destination = _get(movement, 'changes.location.newValue') as string | undefined
      const previousStatus = (_get(movement, 'changes.status.oldValue') as string) || 'unknown'
      const newStatus = (_get(movement, 'changes.status.newValue') as string) || 'unknown'

      // Generate a unique ID by combining timestamp, deviceId, origin, destination, and index
      // This ensures uniqueness even if multiple movements happen at the same time
      const uniqueId = `${timestamp}-${deviceId || 'unknown'}-${origin || 'none'}-${destination || 'none'}-${previousStatus}-${newStatus}-${index}`

      return {
        id: uniqueId,
        origin,
        code: getMinerShortCode(
          _get(movement, 'thing.code') as string,
          _get(movement, 'thing.tags') as string[],
        ),
        destination,
        previousStatus,
        newStatus,
        serialNum: _get(movement, 'thing.info.serialNum') as string | undefined,
        macAddress: _get(movement, 'thing.info.macAddress') as string | undefined,
        type: _get(movement, 'thing.type') as string | undefined,
        date: timestamp,
        deviceId,
        raw: movement,
      }
    })
  }

  const mappedItems = getMappedItems()

  const filteredItems = _filter(mappedItems, (item) => {
    let selected = false

    switch (selectedTab) {
      case 'miner':
        selected = _startsWith(item.type, 'miner')
        break
      default:
        selected = item.type === selectedTab
    }

    const filtered = _some(SEARCHABLE_MOVEMENT_ATTRIBUTES, (prop) =>
      _includes(_toLower(_get(item, prop) as string), _toLower(_trim(filterText))),
    )
    return selected && filtered
  })

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value)
  }

  const {
    modalOpen: movementDetailsModalOpen,
    handleOpen: openMovementDetailsModal,
    handleClose: closeMovementDetailsModal,
    subject: movementToShow,
  } = useContextualModal()

  const handleActionSelect = (movement: MovementRecord, action: string) => {
    switch (action) {
      case SHOW_DETAILS:
        openMovementDetailsModal(movement)
        break
      case DEVICE_HISTORY:
        if (movement.deviceId) {
          navigate(movement.deviceId)
        }
        break
      default:
        break
    }
  }

  const backDestination = deviceId ? '/inventory/movements' : '/inventory/dashboard'

  const isLoading = isMovementsLoading || isDeviceDetailsLoading
  const showTabs = _isNil(deviceId)
  const showDeviceDetails = Boolean(deviceId && deviceDetails)

  return (
    <Wrapper>
      <Breadcrumbs title={'Historical Device Movements'} destination={backDestination} />

      <FilterWrapper
        value={filterText}
        placeholder="Search"
        onChange={handleFilterChange}
        allowClear
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {showTabs && (
            <Tabs
              activeKey={selectedTab}
              items={MOVEMENTS_LIST_TAB_ITEMS}
              onChange={(tab) => setSelectedTab(tab)}
            />
          )}
          {showDeviceDetails && deviceDetails && (
            <DeviceDetailsWrapper>
              <DeviceDetails device={deviceDetails} />
            </DeviceDetailsWrapper>
          )}

          <AppTable<MovementRecord>
            $fullSize
            dataSource={filteredItems}
            columns={getMovementsColumns({
              handleActionSelect,
              showDeviceHistoryAction: _isNil(deviceId),
              showCode: _isNil(deviceId),
              deviceType: selectedTab,
              isShowingDetails: showDeviceDetails,
              getFormattedDate,
            })}
            loading={isLoading}
            scroll={{ x: 'max-content', y: 380 }}
            pagination={{
              ...pagination,
              onChange: handlePaginationChange,
            }}
          />

          {movementDetailsModalOpen && (
            <MovementDetailsModal
              isOpen={movementDetailsModalOpen}
              onClose={closeMovementDetailsModal}
              movement={
                movementToShow as unknown as Parameters<typeof MovementDetailsModal>[0]['movement']
              }
            />
          )}
        </>
      )}
    </Wrapper>
  )
}

export default HistoricalMovements
