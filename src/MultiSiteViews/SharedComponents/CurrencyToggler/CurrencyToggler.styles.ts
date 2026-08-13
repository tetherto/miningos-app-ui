import Button from 'antd/es/button'
import styled from 'styled-components'

import { flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const CurrencyTogglerWrapper = styled.div`
  ${flexRow};
  padding: 4px;
  background-color: ${COLOR.BLACK};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
`

interface StyledButtonProps {
  $isActive?: boolean
}

export const StyledButton = styled(Button)<StyledButtonProps>`
  border: none;
  box-shadow: none;
  color: ${({ $isActive }) => $isActive && COLOR.COLD_ORANGE};
  background-color: ${({ $isActive }) => $isActive && COLOR.COLD_ORANGE_ALPHA_02};

  &:hover {
    background-color: ${COLOR.COLD_ORANGE_ALPHA_02} !important;
  }
`
