import React from 'react'

import { AddUserModalBase } from './common.styles'

interface ChangeConfirmationModalProps {
  open: boolean
  onOk: () => void
  onClose: () => void
  children: React.ReactNode
  title: string
  okText?: string
}

const ChangeConfirmationModal = ({
  open,
  onOk,
  onClose,
  children,
  title,
  okText = 'Confirm',
}: ChangeConfirmationModalProps) => (
  <AddUserModalBase
    open={open}
    onCancel={onClose}
    title={title}
    maskClosable={false}
    onOk={onOk}
    okText={okText}
  >
    <p>{children}</p>
  </AddUserModalBase>
)

export default ChangeConfirmationModal
