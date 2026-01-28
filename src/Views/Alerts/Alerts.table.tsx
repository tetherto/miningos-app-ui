import type { ColumnsType } from 'antd/es/table'

import RightNavigateToIcon from '../../Components/Icons/RightNavigateToIcon'
import { SEVERITY_COLORS, SEVERITY_LEVELS } from '../../constants/alerts'

import { ButtonContainer } from './Alerts.styles'

export interface AlertTableRecord {
  shortCode: string
  device: string
  alertName: string
  description?: string
  message?: string
  severity: string
  createdAt: number | string
  id?: string
  uuid: string
  actions?: {
    onAlertClick?: (id: string, uuid: string) => void
    id?: string
    uuid: string
  }
  [key: string]: unknown
}

export type GetFormattedDate = (date: Date) => string

export interface GetAlertsTableColumnsProps {
  isMobile: boolean
  getFormattedDate: GetFormattedDate
}

export const getAlertsTableColumns = (
  isMobile: boolean,
  getFormattedDate: GetFormattedDate,
): ColumnsType<AlertTableRecord> => [
  {
    title: 'Code',
    dataIndex: 'shortCode',
    key: 'shortCode',
    minWidth: 180,
    sorter: (a: AlertTableRecord, b: AlertTableRecord) => a.shortCode.localeCompare(b.shortCode),
  },
  {
    title: 'Position',
    dataIndex: 'device',
    key: 'device',
    sorter: (a: AlertTableRecord, b: AlertTableRecord) => a.device.localeCompare(b.device),
    minWidth: 180,
    fixed: isMobile ? undefined : 'left',
  },
  {
    title: 'Alert name',
    dataIndex: 'alertName',
    key: 'alertName',
    minWidth: 160,
    sorter: (a: AlertTableRecord, b: AlertTableRecord) => a.alertName.localeCompare(b.alertName),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    minWidth: 450,
    render: (description: string | undefined, record: AlertTableRecord) => (
      <>
        <span>{description || ''}</span>
        {record.message ? `: ${record.message}` : ''}
      </>
    ),
    sorter: (a: AlertTableRecord, b: AlertTableRecord) =>
      (a.description || '').localeCompare(b.description || ''),
  },
  {
    title: 'Severity',
    dataIndex: 'severity',
    key: 'severity',
    minWidth: 160,
    render: (severity: string) => (
      <span
        style={{
          color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || severity,
        }}
      >
        {severity}
      </span>
    ),
    sorter: (a: AlertTableRecord, b: AlertTableRecord) =>
      (SEVERITY_LEVELS[a.severity as keyof typeof SEVERITY_LEVELS] || 0) -
      (SEVERITY_LEVELS[b.severity as keyof typeof SEVERITY_LEVELS] || 0),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: 'Created at',
    dataIndex: 'createdAt',
    key: 'createdAt',
    minWidth: 160,
    render: (createdAt: number | string) => getFormattedDate(new Date(createdAt)),
    sorter: (a: AlertTableRecord, b: AlertTableRecord) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: (actions: AlertTableRecord['actions']) => {
      if (!actions) return null
      const { onAlertClick, id, uuid } = actions
      return (
        <ButtonContainer
          onClick={() => {
            onAlertClick?.(id || '', uuid)
          }}
        >
          <RightNavigateToIcon />
        </ButtonContainer>
      )
    },
  },
]
