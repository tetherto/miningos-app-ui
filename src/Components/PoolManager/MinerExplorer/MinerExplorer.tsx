import { SearchOutlined } from '@ant-design/icons'
import Select from 'antd/es/select'
import type { ColumnsType } from 'antd/es/table'
import _capitalize from 'lodash/capitalize'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isNil from 'lodash/isNil'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _toPairs from 'lodash/toPairs'
import _values from 'lodash/values'
import type { ComponentProps, FC } from 'react'
import { useEffect, useState } from 'react'

import {
  DropdownFilters,
  FilterRow,
  FullWidthSelect,
  Header,
  MinerExplorerWrapper,
} from './MinerExplorer.styles'

import { useGetListThingsQuery, useGetSiteQuery } from '@/app/services/api'
import { getHashrateString, getMinerShortCode } from '@/app/utils/deviceUtils'
import { getListQuery } from '@/app/utils/queryUtils'
import { MinerStatus, MinerStatuses } from '@/app/utils/statusUtils'
import AppTable from '@/Components/AppTable/AppTable'
import { getTableDeviceData } from '@/Components/Explorer/List/ListView.util'
import { StatusBadge } from '@/Components/PoolManager/PoolManager.common.styles'
import {
  MINER_IN_POOL_STATUS_COLORS,
  MINER_IN_POOL_STATUSES,
  MINER_STATUS_TO_IN_POOL_STATUS,
} from '@/Components/PoolManager/PoolManager.constants'
import { Spinner } from '@/Components/Spinner/Spinner'
import { DATE_TIME_FORMAT } from '@/constants/dates'
import { COMPLETE_MINER_TYPES, MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'
import { CROSS_THING_TYPES } from '@/constants/devices'
import type { Device } from '@/hooks/hooks.types'
import { useListViewFilters } from '@/hooks/useListViewFilters'
import useTimezone from '@/hooks/useTimezone'

interface MinerRecord {
  id: string
  code: string
  status?: string
  unit?: string
  hashrate?: number
  lastSyncedAt: Date
  tags?: string[]
  raw: Device
}

interface MinerExplorerProps {
  selectedDeviceIds: string[]
  setSelectedDeviceIds: (ids: string[] | ((prev: string[]) => string[])) => void
}

const getMinerTableColumns = (
  getFormattedDate: (date: Date | number, fixedTimezone?: string, formatString?: string) => string,
): ColumnsType<MinerRecord> => [
  {
    dataIndex: 'code',
    key: 'code',
    title: 'Miner Code',
    sorter: (a: MinerRecord, b: MinerRecord) => (a.code || '').localeCompare(b.code || ''),
  },
  {
    dataIndex: 'unit',
    key: 'unit',
    title: 'Unit',
    sorter: (a: MinerRecord, b: MinerRecord) => (a.unit || '').localeCompare(b.unit || ''),
  },
  {
    dataIndex: 'status',
    key: 'status',
    title: 'Status',
    sorter: (a: MinerRecord, b: MinerRecord) => (a.status || '').localeCompare(b.status || ''),
    render: (status: MinerStatus) => {
      const minerStatus = status as keyof typeof MINER_STATUS_TO_IN_POOL_STATUS

      const inPoolStatus =
        MINER_STATUS_TO_IN_POOL_STATUS[minerStatus] || MINER_IN_POOL_STATUSES.INACTIVE

      const inPoolColor = MINER_IN_POOL_STATUS_COLORS[inPoolStatus]

      if (!inPoolColor) {
        return null
      }

      return (
        <StatusBadge $textCapitalized $textColor={inPoolColor}>
          {inPoolStatus}
        </StatusBadge>
      )
    },
  },
  {
    dataIndex: 'hashrate',
    key: 'hashrate',
    title: 'Hashrate',
    sorter: (a: MinerRecord, b: MinerRecord) =>
      String(a.hashrate || '').localeCompare(String(b.hashrate || '')),
    render: (text: number | undefined) => (text ? getHashrateString(text) : '-'),
  },
  {
    dataIndex: 'lastSyncedAt',
    key: 'lastSyncedAt',
    title: 'Last Sync',
    sorter: (a: MinerRecord, b: MinerRecord) => a.lastSyncedAt.getTime() - b.lastSyncedAt.getTime(),
    render: (text: Date) => (text ? getFormattedDate(text, undefined, DATE_TIME_FORMAT) : '-'),
  },
]

const minerTypeOptions = _map(_values(COMPLETE_MINER_TYPES), (type: unknown) => ({
  key: type as string,
  label: MINER_TYPE_NAME_MAP[type as keyof typeof MINER_TYPE_NAME_MAP],
}))

const minerStatusOptions = _map(_toPairs(MinerStatuses), ([label, value]) => ({
  key: value,
  label,
}))

export const MinerExplorer: FC<MinerExplorerProps> = ({
  selectedDeviceIds,
  setSelectedDeviceIds,
}) => {
  const { getFormattedDate } = useTimezone()
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [page, setPage] = useState({
    pageNumber: 1,
    pageSize: 10,
  })
  const [modelFilter, setModelFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const minerTableColumns = getMinerTableColumns(getFormattedDate)

  const { data: siteData, isLoading: isSiteLoading } = useGetSiteQuery(undefined)
  const site = _capitalize(_get(siteData, ['site']))
  const { onFiltersChange, filters } = useListViewFilters({
    selectedType: CROSS_THING_TYPES.MINER,
    site,
  })

  const handleSearch = (value: string[]) => {
    setFilterTags(value)
  }

  useEffect(() => {
    const nextFilters: Array<[string, string]> = []
    if (!_isNil(modelFilter)) {
      nextFilters.push(['type', modelFilter])
    }

    if (!_isNil(statusFilter)) {
      nextFilters.push(['last.snap.stats.status', statusFilter])
    }

    onFiltersChange(nextFilters as unknown as Array<[string, string]>)
  }, [modelFilter, onFiltersChange, statusFilter])

  const {
    data: minerListData,
    isLoading: isMinerListDataLoading,
    isFetching: isMinerListDataFetching,
  } = useGetListThingsQuery({
    status: 1,
    fields: JSON.stringify({
      id: 1,
      info: 1,
      code: 1,
      type: 1,
      rack: 1,
      containerId: 1,
      tags: 1,
      'last.ts': 1,
      'last.snap.stats.status': 1,
      'last.snap.stats.hashrate_mhs': 1,
    }),
    query: getListQuery(filterTags, filters, ['t-miner']),
  })

  const mappedMiners: MinerRecord[] =
    _map(
      _head(minerListData as Device[][] | undefined) as Device[] | undefined,
      (device: Device) => {
        const deviceData = getTableDeviceData(device) as {
          id?: string
          code?: string
          tags?: string[]
          stats?: { status?: string; hashrate_mhs?: { t_5m?: number } }
          info?: { container?: string }
          [key: string]: unknown
        }
        const code = deviceData.code as string | undefined
        const tags = deviceData.tags as string[] | undefined
        const stats = deviceData.stats as
          | { status?: string; hashrate_mhs?: { t_5m?: number } }
          | undefined
        const info = deviceData.info as { container?: string } | undefined
        const shortCode = getMinerShortCode(code, tags || [])
        const deviceId = deviceData.id as string
        const lastTs = device.last?.ts
        return {
          id: deviceId || '',
          code: shortCode,
          status: stats?.status,
          unit: info?.container,
          hashrate: stats?.hashrate_mhs?.t_5m,
          lastSyncedAt: lastTs && _isNumber(lastTs) ? new Date(lastTs) : new Date(0),
          tags: tags || [],
          raw: device,
        }
      },
    ) || []

  const setMinerSelection = (miner: MinerRecord, isSelected: boolean) => {
    if (!isSelected) {
      setSelectedDeviceIds(_reject(selectedDeviceIds, (id: string) => miner.id === id))
      return
    }

    return setSelectedDeviceIds([...selectedDeviceIds, miner.id])
  }

  const handlePageChange = (pageNumber: number, pageSize: number) => {
    setSelectedDeviceIds([])

    setPage({
      pageNumber,
      pageSize,
    })
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (!isChecked) {
      return setSelectedDeviceIds([])
    }

    const sliceStart = (page.pageNumber - 1) * page.pageSize
    const sliceEnd = page.pageNumber * page.pageSize
    setSelectedDeviceIds(
      _map(
        _reject(mappedMiners.slice(sliceStart, sliceEnd), ['status', 'offline']),
        ({ id }: MinerRecord) => id,
      ),
    )
  }

  const isLoading = isSiteLoading || isMinerListDataLoading

  return (
    <MinerExplorerWrapper>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Header>
            <FilterRow>
              <FullWidthSelect
                suffixIcon={<SearchOutlined />}
                mode="tags"
                placeholder="Search by ID, IP, MAC, Serial"
                onChange={(value: unknown) => handleSearch(value as string[])}
                tokenSeparators={[',']}
                value={filterTags}
              />
            </FilterRow>
            <DropdownFilters>
              <FullWidthSelect
                placeholder="Model"
                value={modelFilter}
                onSelect={(value: unknown) => {
                  setModelFilter(value as string | null)
                }}
                allowClear
                onClear={() => setModelFilter(null)}
              >
                {_map(minerTypeOptions, (item: unknown) => {
                  const itemTyped = item as { key: string; label: string }
                  return (
                    <Select.Option key={itemTyped.key} value={itemTyped.key}>
                      {itemTyped.label}
                    </Select.Option>
                  )
                })}
              </FullWidthSelect>
              <FullWidthSelect
                placeholder="Status"
                value={statusFilter}
                onSelect={(value: unknown) => {
                  setStatusFilter(value as string | null)
                }}
                allowClear
                onClear={() => setStatusFilter(null)}
              >
                {_map(minerStatusOptions, (item: unknown) => {
                  const itemTyped = item as { key: string; label: string }
                  return (
                    <Select.Option key={itemTyped.key} value={itemTyped.key}>
                      {itemTyped.label}
                    </Select.Option>
                  )
                })}
              </FullWidthSelect>
            </DropdownFilters>
          </Header>
          {isMinerListDataFetching ? (
            <Spinner />
          ) : (
            <AppTable
              {...({
                columns: minerTableColumns,
                dataSource: mappedMiners,
                rowKey: (record: MinerRecord) => record.id,
                rowSelection: {
                  type: 'checkbox' as const,
                  selectedRowKeys: selectedDeviceIds,
                  onSelect: (record: MinerRecord, selected: boolean) =>
                    setMinerSelection(record, selected),
                  onSelectAll: handleSelectAll,
                  getCheckboxProps: (record: MinerRecord) => ({
                    disabled: record.status === 'offline',
                  }),
                },
                pagination: {
                  current: page.pageNumber,
                  pageSize: page.pageSize,
                  onChange: handlePageChange,
                },
              } as unknown as ComponentProps<typeof AppTable>)}
            />
          )}
        </>
      )}
    </MinerExplorerWrapper>
  )
}
