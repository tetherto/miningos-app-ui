import Button from 'antd/es/button'
import _noop from 'lodash/noop'
import { FC, ReactNode } from 'react'

import { PrimaryButton } from '../ActionsSidebar/ActionCard/ActionCard.styles'
import { FooterButtonsContainer } from '../CommentsPopover/CommentsPopover.styles'

import { StyledModal } from './SimpleConfirmationModal.styles'

interface SimpleConfirmationModalProps {
  isOpened?: boolean
  onCancel?: () => void
  onConfirm?: () => void
  title?: ReactNode
  message?: ReactNode
  confirmText?: string
  cancelText?: string
}

export const SimpleConfirmationModal: FC<SimpleConfirmationModalProps> = ({
  isOpened = false,
  onCancel = _noop,
  onConfirm = _noop,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => (
  <StyledModal open={isOpened} title={title} onCancel={onCancel} footer={null}>
    {message && <div>{message}</div>}

    <FooterButtonsContainer $hideMarginTop>
      <Button onClick={onCancel}>{cancelText}</Button>
      <PrimaryButton onClick={onConfirm}>{confirmText}</PrimaryButton>
    </FooterButtonsContainer>
  </StyledModal>
)
