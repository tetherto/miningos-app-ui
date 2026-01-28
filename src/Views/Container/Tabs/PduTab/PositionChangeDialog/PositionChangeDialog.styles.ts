import Button from 'antd/es/button'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import styled from 'styled-components'

import { flexColumn, flexRowReverse } from '../../../../../app/mixins'
import {
  DangerButton,
  WarningButton,
} from '../../../../../Components/ActionsSidebar/ActionCard/ActionCard.styles'

import { COLOR } from '@/constants/colors'

export const StyledPositionChangeModal = styled(Modal)`
  ${flexColumn};
  justify-content: space-between;
  padding: 0;

  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
    padding-bottom: 28px;
    border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  }

  .ant-modal-body {
    margin-top: 16px;
  }
`

export const StyledButton = styled(Button)`
  width: 100%;
`

export const StyledWarningButton = styled(WarningButton)`
  width: 100%;
`

export const StyledDangerButton = styled(DangerButton)`
  width: 100%;
`

export const StyledButtonsRow = styled(Row)`
  margin-top: 25px;
`

export const ModalFooter = styled.div`
  ${flexRowReverse};
  width: 100%;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const DangerWarningText = styled.div`
  color: ${COLOR.BRICK_RED};
`
