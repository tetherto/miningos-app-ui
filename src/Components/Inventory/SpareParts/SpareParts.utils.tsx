import { DownOutlined } from '@ant-design/icons'
import Dropdown from 'antd/es/dropdown'
import type { ColumnsType } from 'antd/es/table'
import _filter from 'lodash/filter'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _range from 'lodash/range'
import _reject from 'lodash/reject'
import _values from 'lodash/values'

import {
  ColoredDropdownButton,
  DropdownItem,
  LinksDropdownButton,
  NoWrapText,
} from '../InventoryTable/InventoryTable.styles'

import {
  FREE_SPARE_PART_ACTIONS,
  NO_PARENT_DEVICE_ID,
  SPARE_PART_ACTIONS,
  SPARE_PART_LOCATIONS,
  SPARE_PART_STATUS_NAMES,
  SPARE_PART_STATUSES,
  SparePartNames,
  SparePartTypes,
} from './SpareParts.constants'

import { formatMacAddress } from '@/app/utils/format'
import { getLocationLabel } from '@/app/utils/inventoryUtils'
import { getLocationColors, getStatusColors } from '@/app/utils/sparePartUtils'
import { DATE_TIME_FORMAT } from '@/constants/dates'

export interface SparePart {
  id?: string
  code?: string
  type?: string
  serialNum?: string
  macAddress?: string
  status?: string
  location?: string
  parentDeviceId?: string
  parentDeviceCode?: string
  site?: string
  createdAt?: number
  updatedAt?: number
  [key: string]: unknown
}

type SparePartLocationValue = (typeof SPARE_PART_LOCATIONS)[keyof typeof SPARE_PART_LOCATIONS]
type SparePartStatusValue = (typeof SPARE_PART_STATUSES)[keyof typeof SPARE_PART_STATUSES]

const isSparePartFree = (sparePart: SparePart): boolean =>
  _isNil(sparePart.parentDeviceId) || sparePart.parentDeviceId === NO_PARENT_DEVICE_ID

type SparePartActionKey = keyof typeof SPARE_PART_ACTIONS

export const getSparePartsListActions = ({
  sparePart,
}: {
  sparePart: SparePart
}): SparePartActionKey[] =>
  _filter(
    _range(1, _keys(SPARE_PART_ACTIONS).length + 1) as SparePartActionKey[],
    (key: SparePartActionKey) => {
      if (FREE_SPARE_PART_ACTIONS.has(SPARE_PART_ACTIONS[key])) {
        return isSparePartFree(sparePart)
      }

      return true
    },
  )

export const getSparePartDetailedName = ({ type, code }: { type: string; code: string }) =>
  `${SparePartNames[type]}: ${code}`

type GetSparePartsListColumnsParams = {
  handleActionSelect: (record: SparePart, action: string) => void
  handleStatusChange: (record: SparePart, status: string) => void
  handleLocationChange: (record: SparePart, location: string) => void
  selectedTab: string
  getFormattedDate: (date: Date, tz?: string, format?: string) => string
}

export const getSparePartsListColumns = ({
  handleActionSelect,
  handleStatusChange,
  handleLocationChange,
  selectedTab,
  getFormattedDate,
}: GetSparePartsListColumnsParams): ColumnsType<SparePart> => [
  {
    title: () => <NoWrapText>Code</NoWrapText>,
    dataIndex: 'code',
    key: 'code',
    width: 150,
    sorter: (a: SparePart, b: SparePart) => (a.code || '').localeCompare(b.code || ''),
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    render: (location: string, record: SparePart) => (
      <Dropdown
        disabled={!isSparePartFree(record)}
        menu={{
          items: [
            {
              type: 'group',
              label: 'Location',
              children: _map(
                _reject(
                  _values(SPARE_PART_LOCATIONS),
                  (value: SparePartLocationValue) => value === SPARE_PART_LOCATIONS.SITE_CONTAINER,
                ),
                (value: SparePartLocationValue) => ({
                  key: value,
                  label: (
                    <DropdownItem $bold $uppercase>
                      {getLocationLabel(value)}
                    </DropdownItem>
                  ),
                  onClick: ({ key }: { key: string }) => handleLocationChange(record, key),
                }),
              ),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <ColoredDropdownButton {...getLocationColors(location)} $uppercase>
          <NoWrapText>{getLocationLabel(location)}</NoWrapText>
          {isSparePartFree(record) && <DownOutlined />}
        </ColoredDropdownButton>
      </Dropdown>
    ),
    width: 200,
    sorter: (a: SparePart, b: SparePart) =>
      getLocationLabel(a.location)?.localeCompare(getLocationLabel(b.location) || '') || 0,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string, record: SparePart) => (
      <Dropdown
        disabled={!isSparePartFree(record)}
        menu={{
          items: [
            {
              type: 'group',
              label: 'Status',
              children: _map(_values(SPARE_PART_STATUSES), (value: SparePartStatusValue) => ({
                key: value,
                label: <DropdownItem>{SPARE_PART_STATUS_NAMES[value]}</DropdownItem>,
                onClick: ({ key }: { key: string }) => handleStatusChange(record, key),
              })),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <ColoredDropdownButton {...getStatusColors(status)} $uppercase>
          <NoWrapText>
            {SPARE_PART_STATUS_NAMES[status as SparePartStatusValue] ?? status}
          </NoWrapText>
          {isSparePartFree(record) && <DownOutlined />}
        </ColoredDropdownButton>
      </Dropdown>
    ),
    width: 120,
    sorter: (a: SparePart, b: SparePart) =>
      (SPARE_PART_STATUS_NAMES[a.status as SparePartStatusValue] || '').localeCompare(
        SPARE_PART_STATUS_NAMES[b.status as SparePartStatusValue] || '',
      ),
  },
  {
    title: 'Links',
    dataIndex: 'actions',
    key: 'actions',
    width: 100,
    render: (_text: unknown, record: SparePart) => (
      <Dropdown
        menu={{
          items: [
            {
              type: 'group',
              label: 'Actions',
              children: _map(
                getSparePartsListActions({ sparePart: record }),
                (key: SparePartActionKey) => ({
                  key: String(key),
                  label: <DropdownItem>{SPARE_PART_ACTIONS[key]}</DropdownItem>,
                  onClick: () => handleActionSelect(record, SPARE_PART_ACTIONS[key]),
                }),
              ),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <LinksDropdownButton>...</LinksDropdownButton>
      </Dropdown>
    ),
  },
  {
    title: () => <NoWrapText>Updated</NoWrapText>,
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 150,
    render: (text: number | string | undefined) =>
      text ? getFormattedDate(new Date(text), undefined, DATE_TIME_FORMAT) : '-',
    sorter: (a: SparePart, b: SparePart) => (a.updatedAt || 0) - (b.updatedAt || 0),
  },
  {
    title: () => <NoWrapText>Model</NoWrapText>,
    dataIndex: 'type',
    key: 'type',
    render: (text: string | undefined) => <NoWrapText>{text}</NoWrapText>,
    width: 120,
    sorter: (a: SparePart, b: SparePart) => (a.type || '').localeCompare(b.type || ''),
  },
  {
    title: () => <NoWrapText>SN</NoWrapText>,
    dataIndex: 'serialNum',
    key: 'serialNum',
    width: 150,
    sorter: (a: SparePart, b: SparePart) => (a.serialNum || '').localeCompare(b.serialNum || ''),
  },
  ...(selectedTab === SparePartTypes.CONTROLLER
    ? [
        {
          title: 'MAC',
          dataIndex: 'macAddress',
          key: 'macAddress',
          render: (text: string | undefined) => (
            <NoWrapText>{formatMacAddress(text || '')}</NoWrapText>
          ),
          width: 150,
          sorter: (a: SparePart, b: SparePart) =>
            (a.macAddress || '').localeCompare(b.macAddress || ''),
        },
      ]
    : []),
  {
    title: () => <NoWrapText>Miner Code</NoWrapText>,
    dataIndex: 'parentDeviceCode',
    key: 'parentDeviceCode',
    width: 180,
    sorter: (a: SparePart, b: SparePart) =>
      (a.parentDeviceCode || '').localeCompare(b.parentDeviceCode || ''),
  },
  {
    title: () => <NoWrapText>Miner ID</NoWrapText>,
    dataIndex: 'parentDeviceId',
    key: 'parentDeviceId',
    width: 180,
    sorter: (a: SparePart, b: SparePart) =>
      (a.parentDeviceId || '').localeCompare(b.parentDeviceId || ''),
  },
  {
    title: () => <NoWrapText>Created</NoWrapText>,
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    render: (text: number | string | undefined) =>
      text ? getFormattedDate(new Date(text), undefined, DATE_TIME_FORMAT) : '-',
    sorter: (a: SparePart, b: SparePart) => (a.createdAt || 0) - (b.createdAt || 0),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Site',
    dataIndex: 'site',
    key: 'site',
    width: 100,
    sorter: (a: SparePart, b: SparePart) => (a.site || '').localeCompare(b.site || ''),
  },
]
