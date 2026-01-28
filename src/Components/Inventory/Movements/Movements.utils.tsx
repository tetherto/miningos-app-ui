import { DownOutlined } from '@ant-design/icons'
import Dropdown from 'antd/es/dropdown'
import type { ColumnsType } from 'antd/es/table'
import _filter from 'lodash/filter'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _range from 'lodash/range'
import _toUpper from 'lodash/toUpper'

import { getLocationLabel } from '../../../app/utils/inventoryUtils'
import { getLocationColors, getStatusColors } from '../../../app/utils/minerUtils'
import { DATE_TIME_FORMAT } from '../../../constants/dates'
import {
  ColoredTableValue,
  ColoredDropdownButton,
  DropdownButton,
  DropdownItem,
  NoWrapText,
} from '../InventoryTable/InventoryTable.styles'
import { MINER_STATUS_NAMES } from '../Miners/Miners.constants'
import { SPARE_PART_STATUS_NAMES, SparePartTypes } from '../SpareParts/SpareParts.constants'

import { DEVICE_HISTORY, MOVEMENTS_ACTIONS } from './Movements.constants'

interface GetMovementsColumnsProps {
  handleActionSelect: (record: MovementRecord, action: string) => void
  showDeviceHistoryAction?: boolean
  deviceType?: string
  showCode?: boolean
  isShowingDetails?: boolean
  getFormattedDate: (date: Date, tz?: string, format?: string) => string
}

export interface MovementRecord {
  id?: string
  date: number
  code?: string
  serialNum?: string
  type?: string
  macAddress?: string
  origin?: string
  destination?: string
  previousStatus?: string
  newStatus?: string
  deviceId?: string
  [key: string]: unknown
}

const getMovementsActions = ({
  showDeviceHistoryAction = true,
}: {
  showDeviceHistoryAction?: boolean
}) =>
  _filter(_range(1, _keys(MOVEMENTS_ACTIONS).length + 1), (key: number) => {
    if (!showDeviceHistoryAction) {
      return MOVEMENTS_ACTIONS[key as keyof typeof MOVEMENTS_ACTIONS] !== DEVICE_HISTORY
    }

    return true
  })

export const getMovementsColumns = ({
  handleActionSelect,
  showDeviceHistoryAction,
  deviceType,
  showCode,
  isShowingDetails,
  getFormattedDate,
}: GetMovementsColumnsProps): ColumnsType<MovementRecord> => [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    render: (value: number) => getFormattedDate(new Date(value), undefined, DATE_TIME_FORMAT),
    sortDirections: ['ascend', 'descend', 'ascend'] as const,
    defaultSortOrder: 'descend' as const,
    sorter: (a: MovementRecord, b: MovementRecord) => a.date - b.date,
  },
  ...(showCode
    ? [
        {
          title: 'Code',
          dataIndex: 'code',
          key: 'code',
          width: 120,
        },
      ]
    : []),
  ...(!isShowingDetails
    ? [
        {
          title: 'SN',
          dataIndex: 'serialNum',
          key: 'serialNum',
        },
      ]
    : []),
  ...(deviceType === SparePartTypes.CONTROLLER
    ? [
        {
          title: 'MAC',
          dataIndex: 'macAddress',
          key: 'macAddress',
        },
      ]
    : []),
  {
    title: 'Origin',
    dataIndex: 'origin',
    key: 'origin',
    render: (location: string) => (
      <ColoredDropdownButton {...getLocationColors(location)} $bold $uppercase>
        {getLocationLabel(location)}
      </ColoredDropdownButton>
    ),
  },
  {
    title: 'Destination',
    dataIndex: 'destination',
    key: 'destination',
    render: (location: string) => (
      <ColoredDropdownButton {...getLocationColors(location)} $bold $uppercase>
        {getLocationLabel(location)}
      </ColoredDropdownButton>
    ),
  },
  {
    title: 'Previous Status',
    dataIndex: 'previousStatus',
    key: 'previousStatus',
    render: (status: string) => (
      <ColoredTableValue {...getStatusColors(status)}>
        <NoWrapText>
          {_toUpper(
            MINER_STATUS_NAMES[status as keyof typeof MINER_STATUS_NAMES] ??
              SPARE_PART_STATUS_NAMES[status as keyof typeof SPARE_PART_STATUS_NAMES] ??
              status,
          )}
        </NoWrapText>
      </ColoredTableValue>
    ),
  },
  {
    title: 'New Status',
    dataIndex: 'newStatus',
    key: 'newStatus',
    render: (status: string) => (
      <ColoredTableValue {...getStatusColors(status)}>
        <NoWrapText>
          {_toUpper(
            MINER_STATUS_NAMES[status as keyof typeof MINER_STATUS_NAMES] ??
              SPARE_PART_STATUS_NAMES[status as keyof typeof SPARE_PART_STATUS_NAMES] ??
              status,
          )}
        </NoWrapText>
      </ColoredTableValue>
    ),
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: (_text: unknown, record: MovementRecord) => (
      <Dropdown
        menu={{
          items: [
            {
              type: 'group',
              label: 'Actions',
              children: _map(getMovementsActions({ showDeviceHistoryAction }), (key: number) => ({
                key: String(key),
                label: (
                  <DropdownItem>
                    {MOVEMENTS_ACTIONS[key as keyof typeof MOVEMENTS_ACTIONS]}
                  </DropdownItem>
                ),
                onClick: ({ key }: { key: string }) =>
                  handleActionSelect(
                    record,
                    MOVEMENTS_ACTIONS[Number(key) as keyof typeof MOVEMENTS_ACTIONS],
                  ),
              })),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <DropdownButton>
          <div>Actions</div>
          <DownOutlined />
        </DropdownButton>
      </Dropdown>
    ),
  },
]
