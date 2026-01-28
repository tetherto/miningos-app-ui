import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $margin?: string | number
}

import { flexColumn, flexRow } from '../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)<StyledProps>`
  min-width: 660px;

  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
  }

  .ant-modal-body {
    margin-top: 16px;
  }
`

export const ModalTitle = styled.div<StyledProps>`
  ${flexRow};
  color: ${COLOR.WHITE};
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 28px;
  background-color: ${COLOR.SIMPLE_BLACK};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
  ${({ $margin }) => $margin && 'margin: 20px 0'}
`

export const ModalBody = styled.div<StyledProps>`
  ${flexColumn};
  gap: 12px;
`

export const FormActions = styled.div<StyledProps>`
  ${flexRow};
  flex-direction: row-reverse;
  gap: 12px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};

  button {
    box-shadow: none;
  }
`

export const ModalFooter = styled.div<StyledProps>`
  ${flexRow};
  padding-top: 24px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const ErrorMessage = styled.div<StyledProps>`
  color: ${COLOR.RED};
`
