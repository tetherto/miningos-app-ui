import { DownOutlined } from '@ant-design/icons'
import Checkbox from 'antd/es/checkbox'
import Dropdown from 'antd/es/dropdown'
import Input from 'antd/es/input'
import _isNil from 'lodash/isNil'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _range from 'lodash/range'

import { DropdownButton, DropdownItem, NoWrapText } from '../InventoryTable/InventoryTable.styles'

import { AddedLabel, MinerCodeSkeleton, RemovedLabel } from './Repairs.styles'

import { DATE_TIME_FORMAT } from '@/constants/dates'

export const SEARCHABLE_REPAIR_HISTORY_ATTRIBUTES = [
  'id',
  'serialNum',
  'macAddress',
  'site',
  'location',
  'status',
  'dateCreated',
  'user',
  'code',
  'changes',
]

interface MinerCodeRendererOptions {
  isMinerDataLoading: boolean
}

export const getRepairHistoryColumns = ({
  getFormattedDate,
}: {
  getFormattedDate: (date: Date, tz?: string, format?: string) => string
}) => [
  {
    title: 'Date',
    dataIndex: 'ts',
    key: 'ts',
    render: (value: number | undefined) => {
      if (_isNil(value)) {
        return 'Unknown'
      }

      return getFormattedDate(new Date(value), undefined, DATE_TIME_FORMAT)
    },
  },
  {
    title: 'Associated Device',
    dataIndex: 'minerCode',
    key: 'minerCode',
    render: (value: string, { isMinerDataLoading }: MinerCodeRendererOptions) => {
      if (!_isNil(value)) {
        return value
      }
      if (isMinerDataLoading) {
        return <MinerCodeSkeleton active size="small" />
      }
      return <>Unknown</>
    },
  },
  {
    title: () => <NoWrapText>Changes</NoWrapText>,
    dataIndex: 'changes',
    key: 'Changes',
  },
  {
    title: 'User',
    dataIndex: 'user',
    key: 'user',
  },
]

export const sparePartChangesColumns = [
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: () => <NoWrapText>Serial Number</NoWrapText>,
    dataIndex: 'serialNum',
    key: 'serialNum',
  },
  {
    title: 'MAC',
    dataIndex: 'macAddress',
    key: 'macAddress',
  },
  {
    title: 'Changes',
    dataIndex: 'removed',
    key: 'removed',
    render: (removed: boolean) =>
      removed ? <RemovedLabel>Removed</RemovedLabel> : <AddedLabel>Added</AddedLabel>,
  },
]

const REPAIR_TICKET_STATUSES = {
  REPAIRING: 'REPAIRING',
  ON_HOLD: 'ON_HOLD',
  REPAIRED: 'REPAIRED',
}

export const REPAIR_TICKET_STATUS_NAMES = {
  [REPAIR_TICKET_STATUSES.REPAIRING]: 'Repairing',
  [REPAIR_TICKET_STATUSES.ON_HOLD]: 'On hold',
  [REPAIR_TICKET_STATUSES.REPAIRED]: 'Repaired',
}

export const REPAIR_TICKET_SOLUTIONS = {
  REPLACE: 'REPLACE',
  REPAIR: 'REPAIR',
}

export const REPAIR_TICKET_SOLUTION_NAMES = {
  [REPAIR_TICKET_SOLUTIONS.REPLACE]: 'Replace',
  [REPAIR_TICKET_SOLUTIONS.REPAIR]: 'Repair',
}

interface TicketPartsListColumnsProps {
  handleSolutionChange: (record: Record<string, unknown>, key: string) => void
  handleOkChange: (record: Record<string, unknown>, value: unknown) => void
  handleCommentChange: (record: Record<string, unknown>, value: string) => void
  handleReplacementChange: (e: { target: { value: string } }) => void
}

export const getTicketPartsListColumns = ({
  handleSolutionChange,
  handleOkChange,
  handleCommentChange,
  handleReplacementChange,
}: TicketPartsListColumnsProps) => [
  {
    title: 'part',
    dataIndex: 'part',
    key: 'part',
  },
  {
    title: () => <NoWrapText>Is it OK?</NoWrapText>,
    dataIndex: 'partOk',
    key: 'partOk',
    render: (_text: boolean | undefined, record: Record<string, unknown>) => (
      <Checkbox
        onChange={(e: unknown) =>
          handleOkChange(record, (e as { target: { value: unknown } }).target.value)
        }
      />
    ),
  },
  {
    title: 'Solution',
    dataIndex: 'solution',
    key: 'solution',
    width: 120,
    render: (_text: string | undefined, record: Record<string, unknown>) => (
      <>
        <Dropdown
          menu={{
            items: [
              {
                type: 'group',
                label: 'Actions',
                children: _map(
                  _range(1, _keys(REPAIR_TICKET_SOLUTION_NAMES).length + 1),
                  (key: number) => ({
                    key: String(key),
                    label: (
                      <DropdownItem>
                        {
                          REPAIR_TICKET_SOLUTION_NAMES[
                            key as keyof typeof REPAIR_TICKET_SOLUTION_NAMES
                          ]
                        }
                      </DropdownItem>
                    ),
                    onClick: ({ key }: { key: string }) => handleSolutionChange(record, key),
                  }),
                ),
              },
            ],
          }}
          placement="bottomLeft"
        >
          <DropdownButton>
            <div>Solution</div>
            <DownOutlined />
          </DropdownButton>
        </Dropdown>
        <Input onChange={handleReplacementChange} />
      </>
    ),
  },
  {
    title: 'comment',
    dataIndex: 'comment',
    key: 'comment',
    render: (_text: string | undefined, record: Record<string, unknown>) => (
      <Input.TextArea
        onChange={(e: unknown) =>
          handleCommentChange(record, (e as { target: { value: string } }).target.value)
        }
      />
    ),
  },
]
