import type { TableProps } from 'antd/es/table'
import _head from 'lodash/head'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import { CommentsRoot } from './Comments.styles'
import { getDevicesWithMaintenanceContainer, sortDevicesByLatestComment } from './Comments.util'

import { useGetFeatureConfigQuery, useGetListThingsQuery } from '@/app/services/api'
import { selectFilterTags } from '@/app/slices/devicesSlice'
import { isCabinet, navigateToDevice } from '@/app/utils/deviceUtils'
import { getFiltersQuery } from '@/app/utils/queryUtils'
import AppTable from '@/Components/AppTable/AppTable'
import {
  DEVICES_COMMENTS_TABLE_ACTIONS,
  getDevicesCommentsTableColumns,
  type DeviceRecord as CommentsDeviceRecord,
} from '@/Components/Comments/Comments.table'
import { CommentsModal } from '@/Components/CommentsModal/CommentsModal'
import { COMMENTS_FILTER_OPTIONS, formatCabinets } from '@/Components/Explorer/List/ListView.util'
import { SearchAndFilter } from '@/Components/SearchAndFilter/SearchAndFilter'
import { Title } from '@/Components/Shared'
import { POLLING_1m } from '@/constants/pollingIntervalConstants'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import usePagination, { PaginationState } from '@/hooks/usePagination'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import useTimezone from '@/hooks/useTimezone'

export const CABINET_IDENTIFIER = 'cabinet-'

type Device = Record<string, unknown>

export type FeatureConfig = {
  comments?: boolean
}

const Comments = () => {
  const navigate = useNavigate()
  const smartPolling1m = useSmartPolling(POLLING_1m)
  const { pagination, setPagination, hideNextPage } = usePagination()
  const { getFormattedDate } = useTimezone()

  const { current } = pagination
  const { isMobile } = useDeviceResolution()
  const filterTags = useSelector(selectFilterTags)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [commentsPopoverData, setCommentsPopoverData] = useState<Record<string, unknown> | null>(
    null,
  )
  const dispatch = useDispatch()
  const featureConfigQuery = useGetFeatureConfigQuery(undefined)

  const featureConfig = (featureConfigQuery.data as FeatureConfig | undefined) ?? {}
  const isCommentsEnabled = Boolean(featureConfig.comments)

  const devicesListQuery = useGetListThingsQuery(
    {
      query: JSON.stringify({
        $and: [
          getFiltersQuery(filterTags, filters, [
            't-miner',
            't-container',
            't-powermeter',
            't-sensor-temp',
            't-inventory',
          ]),
          { comments: { $exists: true, $ne: [] } },
        ],
      }),
      status: 1,
    },
    {
      pollingInterval: smartPolling1m,
    },
  )

  const devicesList = (devicesListQuery?.data as Device[][] | undefined) ?? []
  const { isLoading, refetch } = devicesListQuery

  const rawDevices = (_head(devicesList) as Device[]) || []
  const devices = (formatCabinets(rawDevices) as Device[]) || []

  const limit = pagination.pageSize
  const offset = (pagination.current - 1) * pagination.pageSize
  const paginatedDevices = _slice(devices, offset, offset + limit)

  const sortedDevicesWithMaintenanceContainer = sortDevicesByLatestComment(
    getDevicesWithMaintenanceContainer(paginatedDevices),
  )

  useEffect(() => {
    refetch()
  }, [])

  const size = _size(paginatedDevices)

  useEffect(() => {
    hideNextPage(size)
  }, [hideNextPage, size, current])

  const handleTableChange: TableProps<CommentsDeviceRecord>['onChange'] = (
    pagination,
    _filters,
    _sorter,
    { action },
  ) => {
    if (action === 'paginate') {
      setPagination(pagination as PaginationState)
    }
  }

  const handleDevicesCommentsTableAction = (action: string, record: CommentsDeviceRecord) => {
    const device = record as unknown as Device
    if (action === DEVICES_COMMENTS_TABLE_ACTIONS.SHOW_HISTORY) {
      if (device.type && isCabinet(device.type as string)) {
        navigate(`/comments/${CABINET_IDENTIFIER}${device.id}`)
        return
      }

      navigate(`/comments/${device.id}`)
    }

    if (action === DEVICES_COMMENTS_TABLE_ACTIONS.SHOW_DEVICE) {
      navigateToDevice(device, dispatch as (action: unknown) => void, navigate)
    }

    if (action === DEVICES_COMMENTS_TABLE_ACTIONS.ADD_COMMENT) {
      setCommentsPopoverData(device)
    }
  }

  const handlePopoverClose = () => {
    if (commentsPopoverData) {
      setCommentsPopoverData(null)
    }
    refetch()
  }

  if (!isCommentsEnabled) return null

  return (
    <CommentsRoot>
      <Title>Comments</Title>
      <SearchAndFilter
        placeholder="Search / filter devices"
        filterOptions={COMMENTS_FILTER_OPTIONS}
        setFilters={(filters) => setFilters(filters as Record<string, string[]>)}
        filters={filters}
      />
      {!!commentsPopoverData && (
        <CommentsModal
          shouldOpenImmediately
          device={commentsPopoverData}
          onModalClose={handlePopoverClose}
        />
      )}
      <AppTable<CommentsDeviceRecord>
        rowKey={(record) => `Comments${record?.id || record?.code}`}
        dataSource={sortedDevicesWithMaintenanceContainer as CommentsDeviceRecord[]}
        columns={getDevicesCommentsTableColumns(
          isMobile,
          handleDevicesCommentsTableAction,
          getFormattedDate,
        )}
        loading={isLoading}
        pagination={{
          ...pagination,
          total: devices.length,
        }}
        onChange={handleTableChange}
      />
    </CommentsRoot>
  )
}

export default Comments
