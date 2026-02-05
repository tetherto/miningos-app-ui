import type { ColumnType } from 'antd/es/table'
import Tag from 'antd/es/tag'
import _map from 'lodash/map'
import { Link } from 'react-router'

export interface ThingData extends Record<string, unknown> {
  id: string
  info?: unknown
  tags?: string[]
  addr?: string
  port?: string | number
  type?: string
  rack?: string
}

const columns: ColumnType<ThingData>[] = [
  {
    title: 'id',
    dataIndex: 'id',
    key: 'id',
    render: (_, record) => <Link to={`${record.id}`}>{record.id}</Link>,
  },
  { title: 'addr', dataIndex: 'addr', key: 'addr' },
  { title: 'port', dataIndex: 'port', key: 'port' },
  { title: 'type', dataIndex: 'type', key: 'type' },
  {
    title: 'tags',
    dataIndex: 'tags',
    key: 'tags',
    render: (_, record) => _map(record.tags, (tag) => <Tag key={tag}>{tag}</Tag>),
  },
  { title: 'rack', dataIndex: 'rack', key: 'rack' },
  {
    title: 'info',
    dataIndex: 'info',
    key: 'info',
    render: (_, record) => JSON.stringify(record.info),
  },
]

export default columns
