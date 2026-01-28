import { DownOutlined } from '@ant-design/icons'
import Dropdown from 'antd/es/dropdown'
import _map from 'lodash/map'
import _range from 'lodash/range'

import { naturalSorting } from '../../../app/utils/containerUtils'
import { formatNumber } from '../../../app/utils/format'
import {
  DropdownButton,
  DropdownItem,
  NoWrapText,
  CenteredText,
} from '../InventoryTable/InventoryTable.styles'

export const LINKED_MINERS_ACTION = 'Linked Miners'
export const EMPTY_POSITIONS_ACTION = 'Available Positions'
export const DRY_COOLERS_ACTION = 'Dry Coolers'
export const GO_TO_EXPLORER_ACTION = 'Go To Explorer'
export const INVENTORY_LOGS_ACTION = 'Inventory Logs'
export const GO_TO_INVENTORY_ACTION = 'Go To Inventory'
export const MOVE_MINER_ACTION = 'Move Miner'
export const ADD_MINER_ACTION = 'Add Miner'
export const GO_TO_PDU_ACTION = 'Show Pdu Layout'
export const ADD_COMMENT_ACTION = 'Add Comment'

export const CONTAINERS_SEARCH_PARAM = [
  'container',
  'brand',
  'type',
  'serialNumber',
  'site',
  'miners',
  'position',
  'minersBrand',
  'minersModel',
]

export const MODAL_SEARCH_PARAM = {
  [LINKED_MINERS_ACTION]: {
    searchText: 'Searial Number / Position',
    searchProps: ['serialNumber', 'position'],
  },
  [EMPTY_POSITIONS_ACTION]: {
    searchText: 'Position',
    searchProps: ['position'],
  },
  [DRY_COOLERS_ACTION]: {
    searchText: 'Searial Number',
    searchProps: ['serialNumber'],
  },
}

export const CONTAINER_ACTIONS = {
  1: LINKED_MINERS_ACTION,
  2: INVENTORY_LOGS_ACTION,
  3: EMPTY_POSITIONS_ACTION,
  4: DRY_COOLERS_ACTION,
  5: GO_TO_EXPLORER_ACTION,
  6: ADD_COMMENT_ACTION,
}

export const MINERS_ACTIONS = {
  1: MOVE_MINER_ACTION,
  2: GO_TO_INVENTORY_ACTION,
  3: INVENTORY_LOGS_ACTION,
  4: GO_TO_EXPLORER_ACTION,
}

export const POSITION_ACTIONS = {
  1: ADD_MINER_ACTION,
  2: GO_TO_PDU_ACTION,
}

export const DRY_COOLERS_ACTIONS = {
  1: GO_TO_INVENTORY_ACTION,
  2: INVENTORY_LOGS_ACTION,
}

export interface ContainerRecord {
  id?: string
  container: string
  brand: string
  type: string
  site: string
  serialNumber: string
  dryCoolers?: number
  miners?: number
  minersBrand?: string
  minersModel?: string
  emptyPositions?: number
  [key: string]: string | number | undefined
}

export const getContainerListColumns = (
  handleSelect: (record: ContainerRecord, action: string) => void,
) => [
  {
    title: 'Container',
    dataIndex: 'container',
    key: 'container',
    width: 130,
    render: (text: string) => <NoWrapText>{text}</NoWrapText>,
    sorter: (a: ContainerRecord, b: ContainerRecord) => naturalSorting(a.container, b.container),
  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    width: 100,
    sorter: (a: ContainerRecord, b: ContainerRecord) => naturalSorting(a.brand, b.brand),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: 150,
    render: (text: string) => <NoWrapText>{text}</NoWrapText>,
    sorter: (a: ContainerRecord, b: ContainerRecord) => naturalSorting(a.type, b.type),
  },
  {
    title: 'Site',
    dataIndex: 'site',
    key: 'site',
    width: 100,
    sorter: (a: ContainerRecord, b: ContainerRecord) => naturalSorting(a.site, b.site),
  },
  {
    title: () => <NoWrapText>Serial Number</NoWrapText>,
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    width: 140,
    sorter: (a: ContainerRecord, b: ContainerRecord) =>
      naturalSorting(a.serialNumber, b.serialNumber),
  },
  {
    title: () => <CenteredText>Dry Coolers</CenteredText>,
    dataIndex: 'dryCoolers',
    key: 'dryCoolers',
    width: 100,
  },
  {
    title: 'Miners',
    dataIndex: 'miners',
    key: 'miners',
    width: 100,
    render: (text: number) => formatNumber(text),
  },
  {
    title: () => <CenteredText>Miners Brand</CenteredText>,
    dataIndex: 'minersBrand',
    key: 'minersBrand',
    width: 100,
  },
  {
    title: () => <CenteredText>Miners Model</CenteredText>,
    dataIndex: 'minersModel',
    key: 'minersModel',
    width: 100,
  },
  {
    title: () => <CenteredText>Available Positions</CenteredText>,
    dataIndex: 'emptyPositions',
    key: 'emptyPositions',
    width: 100,
    render: (text: number) => formatNumber(text),
  },
  {
    title: 'Links',
    dataIndex: 'actions',
    key: 'actions',
    width: 120,
    render: (_text: string | number, record: ContainerRecord) => (
      <Dropdown
        menu={{
          items: _map(_range(1, 7), (key: number) => ({
            key: String(key),
            label: (
              <DropdownItem>
                {CONTAINER_ACTIONS[key as keyof typeof CONTAINER_ACTIONS]}
              </DropdownItem>
            ),
          })),
          onClick: ({ key }) =>
            handleSelect(record, CONTAINER_ACTIONS[Number(key) as keyof typeof CONTAINER_ACTIONS]),
        }}
        placement="bottomLeft"
      >
        <DropdownButton>
          <div>Links</div>
          <DownOutlined />
        </DropdownButton>
      </Dropdown>
    ),
  },
]

interface ModalRecord {
  position: string
  serialNumber?: string
  shortCode?: string
  brand?: string
  [key: string]: string | number | undefined
}

export const getContainerModalColumns = (
  key: string,
  handleActionSelect: (action: string) => void,
) => {
  const COLUMNS: Record<string, unknown> = {
    [CONTAINER_ACTIONS[1]]: [
      {
        title: 'Short Code',
        dataIndex: 'shortCode',
        key: 'shortCode',
        width: 140,
      },
      {
        title: () => <NoWrapText>Serial Number</NoWrapText>,
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text: string) => <NoWrapText>{text}</NoWrapText>,
      },
      {
        title: 'Position',
        dataIndex: 'position',
        key: 'position',
        width: 90,
      },
      {
        title: 'Links',
        dataIndex: 'actions',
        key: 'actions',
        width: 100,
        render: () => (
          <Dropdown
            menu={{
              items: _map(_range(1, 5), (key: number) => ({
                key: String(key),
                label: (
                  <DropdownItem>{MINERS_ACTIONS[key as keyof typeof MINERS_ACTIONS]}</DropdownItem>
                ),
              })),
              onClick: ({ key }) =>
                handleActionSelect(MINERS_ACTIONS[Number(key) as keyof typeof MINERS_ACTIONS]),
            }}
            placement="bottomLeft"
          >
            <DropdownButton>
              <div>Links</div>
              <DownOutlined />
            </DropdownButton>
          </Dropdown>
        ),
      },
    ],
    [CONTAINER_ACTIONS[3]]: [
      {
        title: 'Available Position',
        dataIndex: 'position',
        key: 'position',
        sorter: (a: ModalRecord, b: ModalRecord) => naturalSorting(a.position, b.position),
        defaultSortOrder: 'ascend',
      },
      {
        title: 'Links',
        dataIndex: 'actions',
        key: 'actions',
        width: 100,
        render: () => (
          <Dropdown
            menu={{
              items: _map(_range(1, 3), (key: number) => ({
                key: String(key),
                label: (
                  <DropdownItem>
                    {POSITION_ACTIONS[key as keyof typeof POSITION_ACTIONS]}
                  </DropdownItem>
                ),
              })),
              onClick: ({ key }) =>
                handleActionSelect(POSITION_ACTIONS[Number(key) as keyof typeof POSITION_ACTIONS]),
            }}
            placement="bottomLeft"
          >
            <DropdownButton>
              <div>Links</div>
              <DownOutlined />
            </DropdownButton>
          </Dropdown>
        ),
      },
    ],
    [CONTAINER_ACTIONS[4]]: [
      { title: 'Brand', dataIndex: 'brand', key: 'brand' },
      { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber' },
      {
        title: 'Links',
        dataIndex: 'actions',
        key: 'actions',
        width: 100,
        render: () => (
          <Dropdown
            menu={{
              items: _map(_range(1, 3), (key: number) => ({
                key: String(key),
                label: (
                  <DropdownItem>
                    {DRY_COOLERS_ACTIONS[key as keyof typeof DRY_COOLERS_ACTIONS]}
                  </DropdownItem>
                ),
              })),
              onClick: ({ key }) =>
                handleActionSelect(
                  DRY_COOLERS_ACTIONS[Number(key) as keyof typeof DRY_COOLERS_ACTIONS],
                ),
            }}
            placement="bottomLeft"
          >
            <DropdownButton>
              <div>Links</div>
              <DownOutlined />
            </DropdownButton>
          </Dropdown>
        ),
      },
    ],
  }
  return COLUMNS[key]
}
