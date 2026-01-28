import Button from 'antd/es/button'
import { FormikProvider, useFormik } from 'formik'
import _noop from 'lodash/noop'
import { FC } from 'react'
import * as yup from 'yup'

import useTimezone from '../../hooks/useTimezone'
import { PrimaryButton } from '../ActionsSidebar/ActionCard/ActionCard.styles'
import {
  TitleRow,
  TimestampText,
  DescriptionWrapper,
  FooterButtonsContainer,
} from '../CommentsPopover/CommentsPopover.styles'

import { StyledModal } from './CommentsModal.styles'

import { FormikTextArea } from '@/Components/FormInputs'

const validationSchema = yup.object({
  editedComment: yup.string().required('Comment is required').trim(),
})

interface CommentData {
  comment?: string
  user?: string
  ts?: number
}

interface EditCommentModalProps {
  comment?: CommentData
  onSave?: (editedComment: string) => void
  onCancel?: () => void
  isOpened?: boolean
}

export const EditCommentModal: FC<EditCommentModalProps> = ({
  comment,
  onSave = _noop,
  onCancel = _noop,
  isOpened = false,
}) => {
  const { getFormattedDate } = useTimezone()

  const formik = useFormik({
    initialValues: {
      editedComment: comment?.comment || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave(values.editedComment)
    },
  })

  const hide = () => {
    onCancel()
  }

  if (!comment) return null

  return (
    <StyledModal open={isOpened} title="Edit Comment" onCancel={hide} footer={null}>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <TitleRow>
            {comment?.user}
            <TimestampText>{comment?.ts ? getFormattedDate(comment.ts) : ''}</TimestampText>
          </TitleRow>

          <DescriptionWrapper>
            <FormikTextArea name="editedComment" autoSize={{ minRows: 3 }} />
          </DescriptionWrapper>

          <FooterButtonsContainer>
            <Button onClick={hide} disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <PrimaryButton
              htmlType="submit"
              disabled={
                !formik.isValid || !formik.dirty || formik.values.editedComment === comment?.comment
              }
            >
              Save
            </PrimaryButton>
          </FooterButtonsContainer>
        </form>
      </FormikProvider>
    </StyledModal>
  )
}
