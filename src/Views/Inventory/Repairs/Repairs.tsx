import Col from 'antd/es/col'
import Row from 'antd/es/row'
import { List } from 'lodash'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _slice from 'lodash/slice'
import _split from 'lodash/split'
import _toPairs from 'lodash/toPairs'
import type { Key } from 'react'
import { useEffect, useState } from 'react'

import { useGetActionsQuery } from '../../../app/services/api'
import { getRepairActionSummary } from '../../../app/utils/actionUtils'
import { Breadcrumbs } from '../../../Components/Breadcrumbs/Breadcrumbs'
import useInventoryItemFilter from '../../../Components/Inventory/hooks/useInventoryItemFilter'
import RepairLogChangesSubRow from '../../../Components/Inventory/Repairs/RepairLogChangesSubRow'
import {
  getRepairHistoryColumns,
  SEARCHABLE_REPAIR_HISTORY_ATTRIBUTES,
} from '../../../Components/Inventory/Repairs/Repairs.constants'
import { FilterWrapper, Wrapper } from '../Inventory.styles'

import { useGetListThingsQuery } from '@/app/services/api/index'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'
import { ACTION_SUFFIXES } from '@/constants/actions'
import {
  INVENTORY_DEFAULT_PAGE_SIZE,
  INVENTORY_PAGINATION_STORAGE_KEYS,
} from '@/constants/inventoryPagination'
import useInventoryPagination from '@/hooks/useInventoryPagination'
import useTimezone from '@/hooks/useTimezone'

interface ActionResponse {
  id: number
  batchActionUID: string
  action: string
  votesPos: string[]
  votesNeg: string[]
  reqVotesPos: number
  reqVotesNeg: number
  status: string
  requiredPerms: string[]
  targets: UnknownRecord
  params: UnknownRecord[]
}

interface ApiResponseData {
  done: ActionResponse[]
}

interface RepairItem extends UnknownRecord {
  ts?: number
  changes: string
  user: unknown
  raw: {
    batchActionUID: string
    params: ActionResponse[]
  }
  params: ActionResponse[]
  key: string
}

const InventoryRepairs = () => {
  const { getFormattedDate } = useTimezone()
  const [mappedItems, setMappedItems] = useState<RepairItem[]>([])
  const [filteredItems, setFilteredItems] = useState<RepairItem[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([])
  const { pagination, handlePaginationChange } = useInventoryPagination({
    storageKey: INVENTORY_PAGINATION_STORAGE_KEYS.REPAIRS,
    defaultPageSize: INVENTORY_DEFAULT_PAGE_SIZE,
  })

  const { data, isLoading } = useGetActionsQuery({
    overwriteCache: true,
    queries: JSON.stringify([
      {
        type: 'done',
        opts: { reverse: true, limit: 100 },
        query: {
          batchActionUID: { $exists: true },
        },
      },
    ]),
    suffix: ACTION_SUFFIXES.REPAIR,
  })

  const minerIdsInPage = _map(
    _slice(
      filteredItems,
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize,
    ),
    'minerId',
  )

  const { data: listThingsData, isLoading: isMinerDataLoading } = useGetListThingsQuery(
    {
      query: JSON.stringify({
        tags: { $in: ['t-miner'] },
        id: {
          $in: minerIdsInPage,
        },
      }),
      fields: JSON.stringify({
        id: 1,
        code: 1,
      }),
    },
    {
      skip: _isEmpty(minerIdsInPage),
    },
  )

  useEffect(() => {
    const responseData = _head(data as List<unknown>) as ApiResponseData | undefined
    if (!isLoading && responseData?.done) {
      const groupedActions = _map(
        _toPairs(_groupBy(responseData.done, ({ batchActionUID }) => batchActionUID)),
        ([batchActionUID, params]) => ({
          batchActionUID,
          params,
        }),
      )
      const mappedItems = _map(groupedActions, ({ batchActionUID, params }) => ({
        ts: _get(_head(params), ['id']),
        changes: getRepairActionSummary(params),
        code: _get(_head(params), ['params', '0', 'code']),
        user: _get(_head(params), ['votesPos', '0']),
        raw: { batchActionUID, params: params },
        params: params,
        key: batchActionUID,
        minerId: _split(batchActionUID, '-')[1],
      }))
      setFilteredItems(mappedItems)
      setMappedItems(mappedItems)
    }
  }, [data, isLoading])

  const dataSource = _map(filteredItems, (item) => ({
    ...item,
    minerCode: _get(
      _find(_head(listThingsData as List<List<unknown>>), ['id', item.minerId]),
      'code',
    ),
    isMinerDataLoading,
  }))

  const { handleFilterSelect } = useInventoryItemFilter({
    setFilteredItems: setFilteredItems as (items: unknown[]) => void,
    allItems: mappedItems,
    attributes: SEARCHABLE_REPAIR_HISTORY_ATTRIBUTES,
  })

  const expandedRowRender = (batchAction: RepairItem) => (
    <RepairLogChangesSubRow batchAction={batchAction as unknown as UnknownRecord} />
  )

  return (
    <Wrapper>
      <Breadcrumbs title={'Repair History'} destination={'/inventory/dashboard'} />

      <Row>
        <Col md={20}>
          <FilterWrapper placeholder="Search" onChange={handleFilterSelect} allowClear />
        </Col>
      </Row>

      <AppTable
        $fullSize
        dataSource={dataSource}
        columns={getRepairHistoryColumns({
          getFormattedDate,
        })}
        loading={false}
        scroll={{ x: 'max-content', y: 600 }}
        pagination={{
          ...pagination,
          onChange: handlePaginationChange,
        }}
        expandable={{
          expandedRowRender,
          onExpandedRowsChange: setExpandedRowKeys,
          expandedRowKeys,
        }}
      />
    </Wrapper>
  )
}

export default InventoryRepairs
