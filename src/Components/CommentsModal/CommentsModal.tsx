import Button from 'antd/es/button'
import List from 'antd/es/list'
import { FormikProvider, useFormik } from 'formik'
import _head from 'lodash/head'
import _noop from 'lodash/noop'
import _trim from 'lodash/trim'
import { useEffect, useState, FC } from 'react'
import * as yup from 'yup'

import { useAddThingCommentMutation } from '../../app/services/api'
import { getErrorMessage } from '../../app/utils/actionUtils'
import { notifyError, notifySuccess } from '../../app/utils/NotificationService'
import { AUTH_LEVELS, AUTH_PERMISSIONS } from '../../constants/permissions.constants'
import { useCheckPerm } from '../../hooks/usePermissions'
import useTimezone from '../../hooks/useTimezone'
import { getCommentIds } from '../../Views/Comments/Comments.util'
import { PrimaryButton } from '../ActionsSidebar/ActionCard/ActionCard.styles'
import {
  FooterButtonsContainer,
  TimestampText,
  TitleRow,
  DescriptionWrapper,
} from '../CommentsPopover/CommentsPopover.styles'

import { StyledList, StyledModal } from './CommentsModal.styles'

import { FormikTextArea } from '@/Components/FormInputs'

const commentsWritePerm = `${AUTH_PERMISSIONS.COMMENTS}:${AUTH_LEVELS.WRITE}`

const validationSchema = yup.object({
  newComment: yup.string().required('Comment is required').trim(),
})

interface Comment {
  ts: number
  comment: string
  userEmail?: string
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

interface CommentsModalProps {
  device?: Device
  shouldOpenImmediately?: boolean
  onModalClose?: () => void
}

export const CommentsModal: FC<CommentsModalProps> = ({
  device,
  shouldOpenImmediately = false,
  onModalClose = _noop,
}) => {
  const { getFormattedDate } = useTimezone()
  const [addNewThingComment, { isLoading: isAddingNewThingComment }] = useAddThingCommentMutation()
  const [sortedCommentsByDate, setSortedCommentsByDate] = useState<Comment[]>([])
  const [visible, setVisible] = useState(shouldOpenImmediately)
  const canAddComments = useCheckPerm({ perm: commentsWritePerm })

  const hide = () => {
    setVisible(false)
    onModalClose?.()
  }

  const addNewComment = async (values: { newComment: string }) => {
    const trimmedNewComment = _trim(values.newComment)

    if (!trimmedNewComment || !device) {
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
      rackId: rackId as string,
      thingId: thingId as string,
      comment: trimmedNewComment,
    }
    const { data, error } = await addNewThingComment(apiPayload)

    // Local payload for state update includes ts for optimistic UI
    const newCommentPayload = {
      ...apiPayload,
      ts: Date.now(),
    }

    if (_head(data as Array<{ success?: number }>)?.success === 1) {
      const updatedItems = device?.comments
        ? [...sortedCommentsByDate, newCommentPayload].sort((a, b) => b.ts - a.ts)
        : [newCommentPayload, ...sortedCommentsByDate]

      setSortedCommentsByDate(updatedItems)
      notifySuccess('Submitted Comment', 'Message sent successfully')
    } else {
      const apiError = error as { data?: { message?: string }; [key: string]: unknown } | undefined
      const errorMessage = getErrorMessage(data, apiError) || 'Unknown error'
      notifyError('Error occurred while submission', errorMessage)
    }

    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      newComment: '',
    },
    validationSchema,
    onSubmit: addNewComment,
  })

  useEffect(() => {
    setSortedCommentsByDate(
      device?.comments ? [...(device.comments || [])].sort((a, b) => b.ts - a.ts) : [],
    )
  }, [device])

  return (
    <>
      <StyledModal open={visible} title="Comments" onCancel={hide} footer={null}>
        <StyledList
          itemLayout="horizontal"
          dataSource={sortedCommentsByDate}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <TitleRow>
                    {(item as Comment).userEmail || ''}
                    <TimestampText>
                      {(item as Comment).ts ? getFormattedDate(new Date((item as Comment).ts)) : ''}
                    </TimestampText>
                  </TitleRow>
                }
                description={
                  <DescriptionWrapper>{(item as Comment).comment || ''}</DescriptionWrapper>
                }
              />
            </List.Item>
          )}
        />
        {canAddComments && (
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit}>
              <FormikTextArea
                name="newComment"
                placeholder="Please enter new comments here..."
                $hasMarginTop
              />
              <FooterButtonsContainer>
                <Button onClick={hide} disabled={formik.isSubmitting}>
                  Cancel
                </Button>
                <PrimaryButton
                  loading={isAddingNewThingComment || formik.isSubmitting}
                  htmlType="submit"
                >
                  Add Comment
                </PrimaryButton>
              </FooterButtonsContainer>
            </form>
          </FormikProvider>
        )}
      </StyledModal>
    </>
  )
}
