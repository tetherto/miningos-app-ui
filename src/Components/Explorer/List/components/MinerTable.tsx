import type { ColumnsType } from 'antd/es/table'
import _filter from 'lodash/filter'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { ComponentProps, FC, ReactNode } from 'react'

import { StyledPagination } from '../ListView.styles'
import type { ContainerRecord } from '../ListView.types'

import { isDeviceSelected } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'

interface MinerTableProps {
  minerTabDevices: ContainerRecord[]
  selectedDevicesTags: Record<string, Record<string, unknown>>
  selectedContainers: UnknownRecord
  onMinerSelectionToggle: (isChecked: boolean, device: ContainerRecord) => void
  onSelectAllToggle: (isChecked: boolean) => void
  withoutFilters: boolean
  isLoading: boolean
  isInternalLoading: boolean
  columns: ColumnsType<ContainerRecord>
  current: number
  size: number
  pageSize: number
  handlePaginationChange: (page: number, pageSize: number) => void
  emptyMessage: ReactNode
}

export const MinerTable: FC<MinerTableProps> = ({
  minerTabDevices,
  selectedDevicesTags,
  selectedContainers,
  onMinerSelectionToggle,
  onSelectAllToggle,
  withoutFilters,
  isLoading,
  isInternalLoading,
  columns,
  current,
  size,
  pageSize,
  handlePaginationChange,
  emptyMessage,
}) => (
  <>
    <AppTable
      {...({
        locale: {
          emptyText: emptyMessage,
        },
        $isEmpty: _isEmpty(minerTabDevices),
        rowSelection: {
          type: 'checkbox' as const,
          selectedRowKeys: _map(
            _filter(minerTabDevices, (record: ContainerRecord) => {
              const { device } = record
              return device
                ? isDeviceSelected(
                    selectedDevicesTags as unknown as Record<string, Record<string, boolean>>,
                    selectedContainers as UnknownRecord,
                    device,
                  )
                : false
            }) as ContainerRecord[],
            (record) => (record as ContainerRecord).id as string | number,
          ),
          onSelect: (record: ContainerRecord, selected: boolean) =>
            onMinerSelectionToggle(selected, record),
          onSelectAll: onSelectAllToggle,
        },
        rowKey: (record) => (record?.id as string) || '',
        dataSource: withoutFilters ? [] : minerTabDevices,
        loading: isInternalLoading || isLoading,
        columns,
        pagination: false,
        scroll: {
          x: 'max-content',
          y: 'calc(100vh - 343px)',
        },
        tableLayout: 'auto' as const,
      } as ComponentProps<typeof AppTable>)}
    />
    {!_isEmpty(minerTabDevices) && (
      <StyledPagination
        current={current}
        total={size}
        pageSize={pageSize}
        showSizeChanger
        onChange={handlePaginationChange}
      />
    )}
  </>
)
