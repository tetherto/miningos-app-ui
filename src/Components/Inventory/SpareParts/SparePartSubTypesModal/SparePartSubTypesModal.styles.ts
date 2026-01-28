import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $margin?: string | number
}

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const StyledModal = styled(Modal)<StyledProps>`
  min-width: 660px;
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

export const AddItemFormRow = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  align-items: flex-start;
  gap: 5px;
`

export const AddItemFormControl = styled.div<StyledProps>`
  flex: 1;
  flex-basis: 45%;
`

export const AddItemFormActions = styled.div<StyledProps>`
  ${flexRow};
  flex: 0;
  flex-basis: 5%;
  gap: 8px;

  button {
    box-shadow: none;
  }
`
