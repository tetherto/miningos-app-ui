import Dropdown from 'antd/es/dropdown'
import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $margin?: string | number
}

import { flexColumn, flexRow } from '../../../app/mixins'
import { COLOR } from '../../../constants/colors'

export const StyledModal = styled(Modal)<StyledProps>`
  ${flexColumn};
`

export const DropdownButton = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  padding: 0 7px;
  color: ${COLOR.WHITE_ALPHA_04};
  border: 1px solid ${COLOR.GRAY};
  background-color: ${COLOR.ONYX};
  border-radius: 6px;
  cursor: pointer;
`

export const GreenText = styled.div<StyledProps>`
  ${flexColumn};
  color: ${COLOR.WHITE};
  font-weight: 700;
  font-size: 18px;
  ${({ $margin }) => $margin && 'margin: 20px 0'}
`

export const WrappedDropdown = styled(Dropdown)<StyledProps>`
  margin: 20px 0 10px 0;
`
