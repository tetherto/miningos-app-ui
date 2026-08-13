import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $margin?: string | number
}

import { flexCenterRow, flexColumn, flexRow } from '../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)<StyledProps>`
  min-width: 660px;

  .ant-modal-header {
    background-color: ${COLOR.SIMPLE_BLACK};
    padding-bottom: 12px;
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
  ${flexColumn}
  gap: 6px;
`

export const AttributeRow = styled.div<StyledProps>`
  ${flexRow};
  gap: 4px;
`

export const AttributeName = styled.div<StyledProps>`
  font-weight: 700;
`

export const FormActions = styled.div<StyledProps>`
  ${flexRow};
  flex-direction: row-reverse;
  gap: 10px;
`

export const EmptyStateWrapper = styled.div<StyledProps>`
  ${flexCenterRow};
  height: 80px;
`
