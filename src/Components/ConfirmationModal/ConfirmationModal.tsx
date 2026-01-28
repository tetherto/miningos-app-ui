import { FC, ReactNode } from 'react'

import { ConfirmationModalHead, ModalContent } from './ConfirmationModal.styles'

interface ConfirmationModalProps {
  isOpen: boolean
  isCentered?: boolean
  title?: ReactNode
  message: ReactNode
  okText?: string
  onOk: () => void
  onCancel: () => void
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  isCentered = false,
  title = '',
  message,
  okText = 'Confirm',
  onOk,
  onCancel,
}) => (
  <ConfirmationModalHead
    transitionName="" // disable glitchy transition animation
    maskTransitionName=""
    open={isOpen}
    $centered={isCentered}
    title={title}
    okText={okText}
    onOk={onOk}
    onCancel={onCancel}
  >
    <ModalContent>{message}</ModalContent>
  </ConfirmationModalHead>
)

export default ConfirmationModal
