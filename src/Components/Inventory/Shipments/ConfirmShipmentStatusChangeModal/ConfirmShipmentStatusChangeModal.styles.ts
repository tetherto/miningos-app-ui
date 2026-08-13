import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $margin?: string | number
}

import { flexRow } from '../../../../app/mixins'

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

export const ModalActions = styled.div<StyledProps>`
  margin: 20px 0 10px 0;
  ${flexRow};
  flex-direction: row-reverse;
  gap: 10px;
`
