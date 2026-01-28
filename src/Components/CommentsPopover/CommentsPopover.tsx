import Button from 'antd/es/button'
import List from 'antd/es/list'
import Popover from 'antd/es/popover'
import Tooltip from 'antd/es/tooltip'
import _head from 'lodash/head'
import _noop from 'lodash/noop'
import _trim from 'lodash/trim'
import { type ChangeEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useAddThingCommentMutation } from '../../app/services/api'
import { getErrorMessage } from '../../app/utils/actionUtils'
import { getDetailedDeviceName } from '../../app/utils/containerUtils'
import { notifyError, notifySuccess } from '../../app/utils/NotificationService'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'
import { useCheckPerm } from '../../hooks/usePermissions'
import useTimezone from '../../hooks/useTimezone'
import { getCommentIds } from '../../Views/Comments/Comments.util'
import { PrimaryButton } from '../ActionsSidebar/ActionCard/ActionCard.styles'
import { CommentIconCommon } from '../Icons/CommentIconCommon'

import {
  CommentButton,
  CommentsPopoverContentContainer,
  CommentsPopoverListContainer,
  CommentText,
  FooterButtonsContainer,
  NonResizableTextArea,
  TimestampText,
  TitleRow,
} from './CommentsPopover.styles'

import { selectUserEmail } from '@/app/slices/userInfoSlice'
import { COLOR } from '@/constants/colors'

const commentsWritePerm = `${AUTH_PERMISSIONS.COMMENTS}:${AUTH_LEVELS.WRITE}`

interface Comment {
  ts?: number
  comment?: string
  user?: string
  type?: string
  pos?: string
  [key: string]: unknown
}
interface Device {
  id?: string
  type?: string
  rack?: string
  powerMeters?: Array<{ id?: string; rack?: string }>
  comments?: Comment[]
  [key: string]: unknown
}

interface CommentsPopoverProps {
  device?: Device
  onAddCommentSuccess?: () => void
  thingRefetchInterval?: number
  shouldOpenImmediately?: boolean
  onPopoverClose?: () => void
  buttonType?: 'icon' | 'text'
}

export const CommentsPopover = ({
  device,
  onAddCommentSuccess,
  thingRefetchInterval = 1000,
  shouldOpenImmediately = false,
  onPopoverClose = _noop,
  buttonType,
}: CommentsPopoverProps) => {
  const [newComment, setNewComment] = useState('')
  const { getFormattedDate } = useTimezone()
  const [addNewThingComment, { isLoading: isAddingNewThingComment }] = useAddThingCommentMutation()
  const [sortedCommentsByDate, setSortedCommentsByDate] = useState<Comment[]>([])
  const [open, setOpen] = useState(shouldOpenImmediately)
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)
  const userEmail = useSelector(selectUserEmail)
  const canAddComments = useCheckPerm({ perm: commentsWritePerm })

  useEffect(
    () => () => {
      if (timeoutId) clearTimeout(timeoutId)
    },
    [timeoutId],
  )

  const hide = () => {
    setOpen(false)
    setNewComment('')
    onPopoverClose?.()
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    if (!newOpen) {
      onPopoverClose?.()
    }
  }

  const onCommentInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(String(e?.target?.value))
  }

  const addNewComment = async () => {
    const trimmedNewComment = _trim(newComment)

    if (!trimmedNewComment) {
      return
    }

    // Get thingId and rackId (handles cabinet devices automatically)
    const { thingId, rackId } = getCommentIds(device)

    // Validate required fields
    if (!thingId || !rackId) {
      notifyError(
        'Cannot add comment',
        `Missing required fields: ${!thingId ? 'device ID' : ''} ${!rackId ? 'rack ID' : ''}`.trim(),
      )
      return
    }

    // API payload - DON'T include ts for new comments (server generates it)
    const apiPayload = {
      thingId: thingId as string,
      rackId: rackId as string,
      comment: trimmedNewComment,
    }

    const { data, error } = await addNewThingComment(apiPayload)

    // Local payload for state update includes ts for optimistic UI
    const newCommentPayload = {
      ...apiPayload,
      ts: Date.now(),
      user: userEmail,
    }

    if (_head(data as Array<{ success?: number }>)?.success === 1) {
      const updatedItems = device?.comments
        ? [...sortedCommentsByDate, newCommentPayload].sort((a, b) => (b.ts || 0) - (a.ts || 0))
        : [newCommentPayload, ...sortedCommentsByDate]

      setSortedCommentsByDate(updatedItems)

      if (onAddCommentSuccess) {
        const commentSuccessTimeoutId = setTimeout(() => {
          onAddCommentSuccess()
        }, thingRefetchInterval)

        setTimeoutId(() => commentSuccessTimeoutId)
      }

      notifySuccess('Submitted Comment', 'Message sent successfully')
    } else {
      const apiError = error as { data?: { message?: string }; [key: string]: unknown } | undefined
      const errorMessage = getErrorMessage(data, apiError) || 'Unknown error'
      notifyError('Error occurred while submission', errorMessage)
    }

    setNewComment('')
  }

  useEffect(() => {
    setSortedCommentsByDate(
      device?.comments
        ? [...(device.comments || [])].sort((a, b) => (b.ts || 0) - (a.ts || 0))
        : [],
    )
  }, [device])

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      styles={{
        root: {
          width: '100%',
          maxWidth: '500px',
        },
        body: {
          backgroundColor: COLOR.SIMPLE_BLACK,
        },
      }}
      content={
        <CommentsPopoverContentContainer>
          <CommentsPopoverListContainer>
            <List
              itemLayout="horizontal"
              dataSource={sortedCommentsByDate}
              renderItem={(item: Comment) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <TitleRow>
                        {item.user || ''}
                        <TimestampText>{item.ts ? getFormattedDate(item.ts) : ''}</TimestampText>
                      </TitleRow>
                    }
                    description={
                      <>
                        <div>
                          <b>
                            {getDetailedDeviceName(
                              item.type || '',
                              item.pos || '',
                              device as Device | undefined,
                            )}
                          </b>
                        </div>
                        <CommentText>{item.comment}</CommentText>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </CommentsPopoverListContainer>
          {canAddComments && (
            <>
              <NonResizableTextArea
                onChange={onCommentInputChange}
                placeholder="Please enter new comments here..."
                value={newComment}
              />
              <FooterButtonsContainer>
                <Button onClick={hide}>Cancel</Button>
                <PrimaryButton
                  loading={isAddingNewThingComment}
                  onClick={addNewComment}
                  disabled={_trim(newComment) === ''}
                >
                  Add Comment
                </PrimaryButton>
              </FooterButtonsContainer>
            </>
          )}
        </CommentsPopoverContentContainer>
      }
    >
      {!shouldOpenImmediately && (
        <Tooltip title="Add Comment to this device">
          <CommentButton
            type={buttonType === 'text' ? 'default' : 'text'}
            icon={<CommentIconCommon />}
          />
        </Tooltip>
      )}
    </Popover>
  )
}
