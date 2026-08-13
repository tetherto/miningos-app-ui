import { DownOutlined } from '@ant-design/icons'
import Dropdown from 'antd/es/dropdown'
import type { ColumnsType } from 'antd/es/table'
import _camelCase from 'lodash/camelCase'
import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _values from 'lodash/values'

import {
  ColoredDropdownButton,
  DropdownButton,
  DropdownItem,
  NoWrapText,
} from '../InventoryTable/InventoryTable.styles'

import {
  Miner,
  MINER_ACTIONS,
  MINER_LOCATIONS,
  MINER_STATUS_NAMES,
  MINER_STATUSES,
  MinerAction,
  READ_ONLY_ACTIONS,
} from './Miners.constants'

import { getMinerShortCode } from '@/app/utils/deviceUtils'
import { formatMacAddress } from '@/app/utils/format'
import { getLocationLabel } from '@/app/utils/inventoryUtils'
import { getLocationColors, getStatusColors } from '@/app/utils/minerUtils'
import { DATE_TIME_FORMAT } from '@/constants/dates'

const getMinerActions = (canEdit: boolean): MinerAction[] =>
  canEdit
    ? [...MINER_ACTIONS]
    : _filter(MINER_ACTIONS, (action) => _includes(READ_ONLY_ACTIONS, action))

type GetMinerListColumnsParams = {
  handleActionSelect: (record: Miner, action: string) => void
  handleStatusChange: (record: Miner, status: string) => void
  handleLocationChange: (record: Miner, location: string) => void
  canEditMiner: boolean
  getFormattedDate: (date: Date, tz?: string, format?: string) => string
}

export const getMinerListColumns = ({
  handleActionSelect,
  handleStatusChange,
  handleLocationChange,
  canEditMiner,
  getFormattedDate,
}: GetMinerListColumnsParams): ColumnsType<Miner> => [
  {
    title: () => <NoWrapText>Code</NoWrapText>,
    dataIndex: 'code',
    key: 'code',
    width: 100,
    render: (text: string | undefined, record: Miner) => (
      <NoWrapText>{getMinerShortCode(text, record.tags || [])}</NoWrapText>
    ),
    sorter: (a: Miner, b: Miner) => (a.code || '').localeCompare(b.code || ''),
  },
  {
    title: 'Container',
    dataIndex: 'container',
    key: 'container',
    width: 140,
    sorter: (a: Miner, b: Miner) => (a.container || '').localeCompare(b.container || ''),
  },
  {
    title: 'POS',
    dataIndex: 'pos',
    key: 'pos',
    width: 100,
    sorter: (a: Miner, b: Miner) => (a.pos || '').localeCompare(b.pos || ''),
  },
  {
    title: () => <NoWrapText>SN</NoWrapText>,
    dataIndex: 'serialNum',
    key: 'serialNum',
    width: 100,
    sorter: (a: Miner, b: Miner) => (a.serialNum || '').localeCompare(b.serialNum || ''),
  },
  {
    title: 'MAC',
    dataIndex: 'macAddress',
    key: 'macAddress',
    width: 100,
    render: (text: string | undefined) => formatMacAddress(text || ''),
    sorter: (a: Miner, b: Miner) => (a.macAddress || '').localeCompare(b.macAddress || ''),
  },
  {
    title: <NoWrapText>Created</NoWrapText>,
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    render: (text: number | string | undefined) =>
      text ? getFormattedDate(new Date(text), undefined, DATE_TIME_FORMAT) : '-',
    sorter: (a: Miner, b: Miner) => (a.createdAt || 0) - (b.createdAt || 0),
    defaultSortOrder: 'descend',
  },
  {
    title: <NoWrapText>Updated</NoWrapText>,
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 120,
    render: (text: number | string | undefined) =>
      text ? getFormattedDate(new Date(text), undefined, DATE_TIME_FORMAT) : '-',
    sorter: (a: Miner, b: Miner) => (a.updatedAt || 0) - (b.updatedAt || 0),
  },

  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    render: (location: string | undefined, record: Miner) => (
      <Dropdown
        disabled={!canEditMiner}
        menu={{
          items: [
            {
              type: 'group',
              label: 'Location',
              children: _map(
                _reject(
                  _values(MINER_LOCATIONS),
                  (value: string) => value === MINER_LOCATIONS.SITE_CONTAINER,
                ),
                (value: string) => ({
                  key: value,
                  label: <DropdownItem>{getLocationLabel(value)}</DropdownItem>,
                  onClick: () => handleLocationChange(record, value),
                }),
              ),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <ColoredDropdownButton {...getLocationColors(location || '')} $bold $uppercase>
          <NoWrapText>{getLocationLabel(location || '')}</NoWrapText>
          <DownOutlined />
        </ColoredDropdownButton>
      </Dropdown>
    ),
    width: 200,
    sorter: (a: Miner, b: Miner) =>
      (getLocationLabel(a.location) || '').localeCompare(getLocationLabel(b.location) || ''),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string | undefined, record: Miner) => (
      <Dropdown
        disabled={!canEditMiner}
        menu={{
          items: [
            {
              type: 'group',
              label: 'Status',
              children: _map(_values(MINER_STATUSES), (value: string) => ({
                key: value,
                label: (
                  <DropdownItem>
                    {MINER_STATUS_NAMES[value as keyof typeof MINER_STATUS_NAMES]}
                  </DropdownItem>
                ),
                onClick: () => handleStatusChange(record, value),
              })),
            },
          ],
        }}
        placement="bottomLeft"
      >
        <ColoredDropdownButton {...getStatusColors(status || '')} $bold $uppercase>
          <NoWrapText>
            {status
              ? (MINER_STATUS_NAMES[status as keyof typeof MINER_STATUS_NAMES] ?? status)
              : ''}
          </NoWrapText>
          <DownOutlined />
        </ColoredDropdownButton>
      </Dropdown>
    ),
    width: 150,
    sorter: (a: Miner, b: Miner) => {
      const aStatus = a.status
        ? MINER_STATUS_NAMES[a.status as keyof typeof MINER_STATUS_NAMES] || ''
        : ''
      const bStatus = b.status
        ? MINER_STATUS_NAMES[b.status as keyof typeof MINER_STATUS_NAMES] || ''
        : ''
      return aStatus.localeCompare(bStatus)
    },
  },
  {
    title: 'Actions',
    dataIndex: 'links',
    key: 'links',
    width: 120,
    render: (_text: unknown, record: Miner) => (
      <Dropdown
        menu={{
          items: [
            {
              type: 'group',
              label: 'Actions',
              children: _map(getMinerActions(canEditMiner), (action) => ({
                key: _camelCase(action),
                label: <DropdownItem $disabled>{action}</DropdownItem>,
                onClick: () => handleActionSelect(record, action),
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
  {
    title: 'Site',
    dataIndex: 'site',
    key: 'site',
    width: 100,
    sorter: (a: Miner, b: Miner) => (a.site || '').localeCompare(b.site || ''),
  },
]
