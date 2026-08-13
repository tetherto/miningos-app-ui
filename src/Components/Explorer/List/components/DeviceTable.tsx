import type { ColumnsType } from 'antd/es/table'
import _filter from 'lodash/filter'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _size from 'lodash/size'
import { ComponentProps, FC, ReactNode } from 'react'

import type { ContainerRecord } from '../ListView.types'

import { CabinetTableWrapper } from './DeviceTable.styles'

import { isDeviceSelected } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import AppTable from '@/Components/AppTable/AppTable'
import { CROSS_THING_TYPES } from '@/constants/devices'

interface DeviceTableProps {
  selectedType: string
  devices: Device[]
  selectedDevicesTags: Record<string, Record<string, unknown>>
  selectedContainers: UnknownRecord
  selectedLVCabinets: UnknownRecord
  onDeviceSelectionToggle: (isChecked: boolean, device: ContainerRecord) => void
  onSelectAllToggle: (isChecked: boolean) => void
  isLoading: boolean
  isInternalLoading: boolean
  containerWithoutFilters: boolean
  columns: ColumnsType<ContainerRecord>
  pageSizeDefault: number
  emptyMessage: ReactNode
}

export const DeviceTable: FC<DeviceTableProps> = ({
  selectedType,
  devices,
  selectedDevicesTags,
  selectedContainers,
  selectedLVCabinets,
  onDeviceSelectionToggle,
  onSelectAllToggle,
  isLoading,
  isInternalLoading,
  containerWithoutFilters,
  columns,
  pageSizeDefault,
  emptyMessage,
}) => {
  const isCabinet = selectedType === CROSS_THING_TYPES.CABINET

  const table = (
    <AppTable
      {...({
        locale: {
          emptyText: emptyMessage,
        },
        $isEmpty: !_size(devices),
        rowSelection: {
          type: (!isCabinet ? 'checkbox' : 'radio') as 'checkbox' | 'radio',
          hideSelectAll: isCabinet,
          selectedRowKeys: isCabinet
            ? _keys(selectedLVCabinets)
            : _map(
                _filter(devices as ContainerRecord[], (record: ContainerRecord) => {
                  const device = record as Device
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
          onSelect: isCabinet
            ? undefined
            : (record: ContainerRecord, selected: boolean) =>
                onDeviceSelectionToggle(selected, record),
          onSelectAll: onSelectAllToggle,
        },
        onRow: isCabinet
          ? (record: ContainerRecord) => ({
              onClick: () => {
                const isCurrentlySelected = !!selectedLVCabinets[record.id as string]
                onDeviceSelectionToggle(!isCurrentlySelected, record)
              },
            })
          : undefined,
        rowKey: (record) => ((record as ContainerRecord)?.id as string) || '',
        dataSource:
          isLoading || isInternalLoading || containerWithoutFilters
            ? []
            : (devices as ContainerRecord[]),
        loading: isInternalLoading || isLoading,
        columns,
        pagination: {
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          defaultPageSize: pageSizeDefault,
        },
        scroll: {
          x: 'max-content',
          y: 'calc(100vh - 343px)',
        },
        tableLayout: 'auto' as const,
      } as ComponentProps<typeof AppTable>)}
    />
  )

  // Wrap cabinet table to make radio buttons pass clicks through to the row
  return isCabinet ? <CabinetTableWrapper>{table}</CabinetTableWrapper> : table
}
