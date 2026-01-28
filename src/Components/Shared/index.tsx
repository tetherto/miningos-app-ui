import Button, { ButtonProps } from 'antd/es/button'
import styled from 'styled-components'

import { commonTextStyles } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

interface ActionButtonProps extends ButtonProps {
  $secondary?: boolean
}

export const ActionButton = styled(Button)<ActionButtonProps>`
  height: 32px;
  color: ${({ $secondary }) => ($secondary ? COLOR.GREY : COLOR.BLACK)}!important;
  background: ${({ $secondary }) => ($secondary ? COLOR.BLACK : COLOR.COLD_ORANGE)}!important;
  border: ${({ $secondary }) =>
    `1px solid ${$secondary ? COLOR.GREY : COLOR.COLD_ORANGE}`}!important;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  padding: 5px 20px;
  transition: all 0.2s ease-in-out;

  :hover {
    color: ${COLOR.WHITE};
  }
`

export const Title = styled.h1`
  text-transform: uppercase;
  margin: 20px 0 0 0;
  color: ${COLOR.WHITE};
  ${commonTextStyles};

  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 16px;
  }

  @media (max-width: 475px) {
    font-size: 14px !important;
  }
`
