import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import Tooltip from 'antd/es/tooltip'

import { ActionsCell, CommentCell } from './SingleDeviceCommentsHistory.styles'

import { ButtonContainer } from '@/Views/Alerts/Alerts.styles'

export interface CommentRecord extends Record<string, unknown> {
  comment?: string
  user?: string
  ts?: number
}

const isActionsDisabled = (currUserEmail: string | undefined, record: CommentRecord): boolean => {
  // Disable actions if no current user or if comment was NOT created by current user
  if (!currUserEmail) return true

  return record.user !== currUserEmail
}

interface GetCommentsHistoryTableColumnsParams {
  isMobile?: boolean
  isTablet?: boolean
  getFormattedDate: (date: Date) => string
  deviceName?: string
  onEdit: (record: CommentRecord) => void
  onDelete: (record: CommentRecord) => void
  user?: string
}

export const getCommentsHistoryTableColumns = ({
  isMobile,
  isTablet,
  getFormattedDate,
  deviceName,
  onEdit,
  onDelete,
  user,
}: GetCommentsHistoryTableColumnsParams) => {
  const getCommentColumnWidth = () => {
    if (isMobile) return 240
    if (isTablet) return 400
    return 600
  }

  return [
    {
      title: `Comments ${deviceName ? `for  ${deviceName}` : ''}`,
      dataIndex: 'comment',
      key: 'comment',
      sorter: (a: CommentRecord, b: CommentRecord) =>
        (a.comment || '').localeCompare(b.comment || ''),
      width: getCommentColumnWidth(),
      render: (text: string) => <CommentCell>{text}</CommentCell>,
    },
    {
      title: 'Commented By',
      dataIndex: 'user',
      key: 'user',
      sorter: (a: CommentRecord, b: CommentRecord) => (a.user || '').localeCompare(b.user || ''),
      width: isMobile ? 240 : 220,
      render: (_: unknown, record: CommentRecord) => (
        <CommentCell>{record.user || 'Unknown'}</CommentCell>
      ),
    },
    {
      title: 'Latest Comment At',
      dataIndex: 'ts',
      width: isMobile ? 220 : 200,
      sorter: (a: CommentRecord, b: CommentRecord) => (a.ts || 0) - (b.ts || 0),
      render: (createdAt: number) => (
        <CommentCell>{getFormattedDate(new Date(createdAt))}</CommentCell>
      ),
      key: 'ts',
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      hidden: false,
      ellipsis: false,
      render: (_text: unknown, record: CommentRecord) => {
        const disabled = isActionsDisabled(user, record)
        return (
          <ActionsCell>
            <Tooltip title={disabled ? 'You can only edit your own comments' : 'Edit'}>
              <ButtonContainer
                onClick={() => {
                  if (!disabled) onEdit(record)
                }}
                style={disabled ? { cursor: 'not-allowed', opacity: 0.4 } : undefined}
              >
                <EditOutlined />
              </ButtonContainer>
            </Tooltip>
            <Tooltip title={disabled ? 'You can only delete your own comments' : 'Delete'}>
              <ButtonContainer
                onClick={() => {
                  if (!disabled) onDelete(record)
                }}
                style={disabled ? { cursor: 'not-allowed', opacity: 0.4 } : undefined}
              >
                <DeleteOutlined />
              </ButtonContainer>
            </Tooltip>
          </ActionsCell>
        )
      },
    },
  ]
}
