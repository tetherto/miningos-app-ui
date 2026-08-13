import Button from 'antd/es/button'

import { ConfirmationModalHead, ModalBody } from './AlertConfirmationModal.styles'

interface AlertConfirmationModalProps {
  isOpen: boolean
  onOk: VoidFunction
}

const AlertConfirmationModal = ({ isOpen, onOk }: AlertConfirmationModalProps) => (
  <ConfirmationModalHead
    open={isOpen}
    onOk={onOk}
    okText="Understood"
    footer={null}
    closable={false}
  >
    <ModalBody>
      <p>
        Sound notifications for Critical alerts are only triggered from the Alerts page. To enable
        them, please keep always a tab with this page open
      </p>
      <Button onClick={onOk}>Understood</Button>
    </ModalBody>
  </ConfirmationModalHead>
)

export default AlertConfirmationModal
