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
  ${({ $margin }) => $margin && 'margin: 20px 0'}
`

export const ModalBody = styled.div<StyledProps>`
  ${flexColumn};
`

export const StyledForm = styled.form`
  ${flexColumn};
  gap: 16px;
`

export const UploadSection = styled.div`
  ${flexColumn};
  gap: 8px;

  .ant-btn {
    width: 200px;
  }
`

export const FormActions = styled.div<StyledProps>`
  ${flexRow};
  flex-direction: row-reverse;
  gap: 8px;
  margin-top: 8px;

  .ant-btn-primary:disabled,
  .ant-btn-primary:disabled:hover {
    background-color: ${COLOR.WHITE_ALPHA_02} !important;
    border-color: ${COLOR.WHITE_ALPHA_02} !important;
    color: ${COLOR.WHITE_ALPHA_05} !important;
    cursor: not-allowed;
  }
`
