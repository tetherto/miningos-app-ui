import Button from 'antd/es/button'

import {
  ConfirmationModalHead,
  ModalBody,
} from '../Alerts/CurrentAlerts/AlertConfirmationModal.styles'

interface ContainerWidgetConfirmationModalProps {
  isOpen: boolean
  onOk: VoidFunction
}

const ContainerWidgetConfirmationModal = ({
  isOpen,
  onOk,
}: ContainerWidgetConfirmationModalProps) => (
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

export default ContainerWidgetConfirmationModal
