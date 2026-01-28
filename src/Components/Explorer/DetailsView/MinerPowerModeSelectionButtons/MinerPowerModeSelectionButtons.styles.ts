import styled from 'styled-components'

interface StyledProps {
  $hasMargin?: unknown
  $disabled?: boolean
  $isOpen?: boolean
}

import { flexColumn, flexRow } from '../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const Wrapper = styled.div<StyledProps>`
  ${flexColumn};
  grid-column: 1;
  gap: 8px;
  margin-left: ${(props) => (props.$hasMargin ? '10px' : '0')};
`

export const DropdownButton = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  background-color: ${COLOR.ONYX};
  padding: 4px 10px;
  color: ${(props) => (props.$disabled ? COLOR.WHITE_ALPHA_04 : COLOR.WHITE_ALPHA_07)};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${(props) => (props.$disabled ? COLOR.WHITE_ALPHA_01 : COLOR.WHITE_ALPHA_02)};
  }

  .anticon {
    transform: ${(props) => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.3s ease;
  }
`
