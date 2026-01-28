import { DownOutlined } from '@ant-design/icons'
import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import Space from 'antd/es/space'
import type { ColumnType } from 'antd/es/table'
import _get from 'lodash/get'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import _isString from 'lodash/isString'
import _orderBy from 'lodash/orderBy'
import _trim from 'lodash/trim'

import { getDetailedDeviceName, getDeviceName } from '../../app/utils/containerUtils'
import { getCabinetTitle, getMinerShortCode } from '../../app/utils/deviceUtils'

import { DeviceCommentCell } from './Comments.styles'

import { CROSS_THING_TYPES } from '@/constants/devices'

export const DEVICES_COMMENTS_TABLE_ACTIONS = {
  SHOW_HISTORY: 'showHistory',
  SHOW_DEVICE: 'showDevice',
  ADD_COMMENT: 'addComment',
}

const actionItems = [
  {
    key: DEVICES_COMMENTS_TABLE_ACTIONS.SHOW_HISTORY,
    label: 'Show History',
  },
  {
    key: DEVICES_COMMENTS_TABLE_ACTIONS.SHOW_DEVICE,
    label: 'Show Device',
  },
  {
    key: DEVICES_COMMENTS_TABLE_ACTIONS.ADD_COMMENT,
    label: 'Add Comment',
  },
]

const commonColumnProps = (ellipsis = true) => ({
  fixed: 'left' as const,
  ellipsis,
})

interface Comment {
  ts: number
  type?: string
  pos?: string
  comment?: string
  [key: string]: unknown
}

export interface DeviceRecord {
  code: string
  tags?: string[]
  comments?: Comment[]
  type?: string
  id?: string
  rack?: string
  [key: string]: unknown
}

// Helper to convert DeviceRecord to Device/DeviceInfo for utility functions
const asDevice = (record: DeviceRecord) => record as unknown as import('@/types/api').Device

export const getDevicesCommentsTableColumns = (
  isMobile: boolean,
  handleDevicesCommentsTableAction: (action: string, record: DeviceRecord) => void,
  getFormattedDate: (timestamp: number) => string,
): ColumnType<DeviceRecord>[] => {
  const getLatestComment = (record: DeviceRecord) => {
    const sortedArray = _orderBy(record?.comments, ['ts'], ['desc'])
    return _head(sortedArray)
  }

  return [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: isMobile ? 150 : 130,
      sorter: (a: DeviceRecord, b: DeviceRecord) => {
        const aCode = getMinerShortCode(a.code, a.tags || [])
        const bCode = getMinerShortCode(b.code, b.tags || [])
        return aCode.localeCompare(bCode)
      },
      render: (code: string, record: DeviceRecord) => getMinerShortCode(code, record.tags || []),
      ...commonColumnProps(),
    },
    {
      title: 'Device position',
      dataIndex: 'device_name',
      key: 'device_name',
      width: isMobile ? 150 : 130,
      sorter: (a: DeviceRecord, b: DeviceRecord) =>
        `${getDeviceName(asDevice(a))}`.localeCompare(`${getDeviceName(asDevice(b))}`),
      render: (_text: unknown, record: DeviceRecord) =>
        `${
          record.type === CROSS_THING_TYPES.CABINET
            ? getCabinetTitle(asDevice(record))
            : getDeviceName(asDevice(record), false)
        }`,
      ...commonColumnProps(),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      width: isMobile ? 240 : 220,
      sorter: (a: DeviceRecord, b: DeviceRecord) =>
        `${getLatestComment(a)?.comment}`.localeCompare(`${getLatestComment(b)?.comment}`),
      render: (_text: unknown, record: DeviceRecord) => {
        const latestComment = getLatestComment(record)
        const commentValue = _get(latestComment, 'comment')

        if (!latestComment) {
          return ''
        }

        const detailedDeviceNameRaw = getDetailedDeviceName(
          latestComment?.type,
          latestComment?.pos,
          asDevice(record),
        )
        const detailedDeviceName = _trim(detailedDeviceNameRaw)

        return (
          <DeviceCommentCell>
            <span>
              {detailedDeviceName && (
                <>
                  <b>{detailedDeviceName}</b>
                  :&nbsp;
                </>
              )}
              {_isString(commentValue) && !_isEmpty(_trim(commentValue)) ? commentValue : '-'}
            </span>
          </DeviceCommentCell>
        )
      },
      ...commonColumnProps(false),
    },
    {
      title: 'Commented By',
      dataIndex: 'comment_by',
      key: 'comment_by',
      width: 170,
      sorter: (a: DeviceRecord, b: DeviceRecord) =>
        `${getLatestComment(a)?.user}`.localeCompare(`${getLatestComment(b)?.user}`),
      render: (_text: unknown, record: DeviceRecord) => `${getLatestComment(record)?.user || ''}`,
      ...commonColumnProps(),
    },
    {
      title: 'Latest Comment At',
      dataIndex: 'latest_comment_at',
      key: 'latest_comment_at',
      sorter: (a: DeviceRecord, b: DeviceRecord) =>
        (getLatestComment(a)?.ts || 0) - (getLatestComment(b)?.ts || 0),
      render: (_text: unknown, record: DeviceRecord) => {
        const latestComment = getLatestComment(record)
        return latestComment?.ts ? getFormattedDate(latestComment.ts) : ''
      },
      width: isMobile ? 160 : 150,
      ...commonColumnProps(),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: isMobile ? 150 : 140,
      render: (_text: unknown, record: DeviceRecord) => (
        <Space size="middle">
          <Dropdown
            destroyOnHidden
            menu={{
              items: actionItems,
              selectable: true,
              onSelect: (e) =>
                handleDevicesCommentsTableAction(
                  (e.selectedKeys?.[0] as string) || (e.key as string),
                  record,
                ),
            }}
          >
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
      ...commonColumnProps(isMobile),
    },
  ]
}
