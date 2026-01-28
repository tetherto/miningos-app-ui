import Col from 'antd/es/col'

import { StyledButton, StyledButtonsRow, StyledWarningButton } from './PositionChangeDialog.styles'

import { POSITION_CHANGE_DIALOG_FLOWS } from '@/constants/dialog'

interface DefaultPositionChangeDialogContentProps {
  setCurrentDialogFlow: (flow: string) => void
  onChangePositionClicked?: () => void
}

const DefaultPositionChangeDialogContent = ({
  setCurrentDialogFlow,
  onChangePositionClicked,
}: DefaultPositionChangeDialogContentProps) => (
  <StyledButtonsRow gutter={[20, 20]}>
    <Col span={12}>
      <StyledButton
        onClick={() => {
          setCurrentDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.CONTAINER_SELECTION)
          onChangePositionClicked?.()
        }}
      >
        Change Position
      </StyledButton>
    </Col>
    <Col span={12}>
      <StyledWarningButton
        onClick={() => setCurrentDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.MAINTENANCE)}
      >
        Maintenance
      </StyledWarningButton>
    </Col>
    <Col span={12}>
      <StyledButton
        onClick={() => {
          setCurrentDialogFlow(POSITION_CHANGE_DIALOG_FLOWS.CHANGE_INFO)
        }}
      >
        Change Miner info
      </StyledButton>
    </Col>
  </StyledButtonsRow>
)

export default DefaultPositionChangeDialogContent
