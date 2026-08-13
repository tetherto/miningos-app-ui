import { DownOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Checkbox from 'antd/es/checkbox'
import Dropdown from 'antd/es/dropdown'
import type { ColumnsType } from 'antd/es/table'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _range from 'lodash/range'
import _startCase from 'lodash/startCase'
import _values from 'lodash/values'
import { ReactNode } from 'react'

import { DropdownButton, DropdownItem } from '../InventoryTable/InventoryTable.styles'

export const EDIT_SHIPMENT = 'Edit Shipment'
export const SHOW_QR = 'Show QR'

const SHIPMENT_ACTIONS = {
  1: EDIT_SHIPMENT,
  2: SHOW_QR,
} as const

type ShipmentActionKey = keyof typeof SHIPMENT_ACTIONS
type ShipmentStatusValue = (typeof SHIPMENT_STATUSES)[keyof typeof SHIPMENT_STATUSES]

export interface Shipment {
  id?: string
  site?: string
  location?: string
  itinerary?: string
  createdAt?: string | number
  status?: string
  received?: boolean
  [key: string]: unknown
}

export const SEARCHABLE_SHIPMENT_ATTRIBUTES = [
  'id',
  'contents',
  'serialNum',
  'site',
  'location',
  'itinerary',
  'createdBy',
  'createdAt',
  'status',
]

export const SHIPMENT_STATUSES = {
  OPEN: 'OPEN',
  READY: 'READY',
  SHIPPED: 'SHIPPED',
  RECEIVED: 'RECEIVED',
  CLOSED: 'CLOSED',
  UNKNOWN: 'unknown',
} as const

export const SHIPMENT_STATUS_NAMES = {
  [SHIPMENT_STATUSES.OPEN]: 'Open',
  [SHIPMENT_STATUSES.READY]: 'Ready',
  [SHIPMENT_STATUSES.SHIPPED]: 'Shipped',
  [SHIPMENT_STATUSES.RECEIVED]: 'Received',
  [SHIPMENT_STATUSES.CLOSED]: 'Closed',
  [SHIPMENT_STATUSES.UNKNOWN]: 'Unknown',
}

export const getShipmentsListColumns = ({
  handleActionSelect,
  handleStatusChange,
}: {
  handleActionSelect: (record: Shipment, action: string) => void
  handleStatusChange: (record: Shipment, status: string) => void
}): ColumnsType<Shipment> => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 160,
  },
  {
    title: 'Site',
    dataIndex: 'site',
    key: 'site',
    width: 160,
    render: (text: string | undefined) => _startCase(text || ''),
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    width: 100,
    render: (text: string | undefined) => _startCase(text || ''),
  },
  {
    title: 'Itinerary',
    dataIndex: 'itinerary',
    key: 'itinerary',
    width: 200,
  },
  {
    title: 'Creation Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 100,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (_text: string | undefined, record: Shipment) => (
      <Dropdown
        menu={{
          items: [
            {
              type: 'group',
              label: 'Status',
              children: _map(_values(SHIPMENT_STATUSES), (value: ShipmentStatusValue) => ({
                key: value,
                label: <DropdownItem>{SHIPMENT_STATUS_NAMES[value]}</DropdownItem>,
                onClick: () => handleStatusChange(record, value),
              })),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <DropdownButton>
          <div>
            {record.status
              ? SHIPMENT_STATUS_NAMES[record.status as ShipmentStatusValue] || record.status
              : ''}
          </div>
          <DownOutlined />
        </DropdownButton>
      </Dropdown>
    ),
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 120,
    render: (_text: unknown, record: Shipment) => (
      <Dropdown
        menu={{
          items: [
            {
              type: 'group',
              label: 'Actions',
              children: _map(
                _range(1, _keys(SHIPMENT_ACTIONS).length + 1) as ShipmentActionKey[],
                (key: ShipmentActionKey) => ({
                  key: String(key),
                  label: <DropdownItem>{SHIPMENT_ACTIONS[key]}</DropdownItem>,
                  onClick: () => handleActionSelect(record, SHIPMENT_ACTIONS[key]),
                }),
              ),
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

export const getShippingContentsListColumns = ({
  onDelete,
  numRows,
  renderLastRow,
}: {
  onDelete: (record: Shipment) => void
  numRows: number
  renderLastRow: () => ReactNode
}) => [
  {
    title: 'List',
    dataIndex: 'actions',
    key: 'actions',
    width: 120,
    render: (_text: unknown, record: Shipment, rowIndex: number) => {
      if (rowIndex === numRows - 1) {
        return renderLastRow()
      }

      return (
        <Button color="danger" onClick={() => onDelete(record)}>
          Delete
        </Button>
      )
    },
    onCell: (_record: Shipment, rowIndex: number) => {
      if (rowIndex === numRows - 1) {
        return { colSpan: 2 }
      }

      return {}
    },
  },
  {
    title: 'Item',
    dataIndex: 'id',
    key: 'id',
    onCell: (_record: Shipment, rowIndex: number) => {
      if (rowIndex === numRows - 1) {
        return { colSpan: 0 }
      }

      return {}
    },
  },
]

export const getShippedContentsListColumns = ({
  handleReceivedChange,
  numRows,
  renderLastRow,
}: {
  handleReceivedChange: (record: Shipment, checked: boolean) => void
  numRows: number
  renderLastRow: () => ReactNode
}) => [
  {
    title: 'Item',
    dataIndex: 'id',
    key: 'id',
    render: (text: string | undefined, _record: Shipment, rowIndex: number | undefined) => {
      if (rowIndex !== undefined && rowIndex === numRows - 1) {
        return renderLastRow()
      }

      return text
    },
    onCell: (_record: Shipment, rowIndex: number) => {
      if (rowIndex === numRows - 1) {
        return { colSpan: 2 }
      }

      return {}
    },
  },
  {
    title: 'Received',
    dataIndex: 'received',
    key: 'received',
    width: 120,
    render: (_text: boolean | undefined, record: Shipment) => (
      <Checkbox
        checked={record?.received}
        onChange={({ target }) => handleReceivedChange(record, target.checked)}
      />
    ),
    onCell: (_record: Shipment, rowIndex: number) => {
      if (rowIndex === numRows - 1) {
        return { colSpan: 0 }
      }

      return {}
    },
  },
]
