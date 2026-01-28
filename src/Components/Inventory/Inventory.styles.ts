import Button from 'antd/es/button'
import styled from 'styled-components'

interface StyledProps {
  $noBackground?: boolean
}

import { COLOR } from '../../constants/colors'

export const DangerButton = styled(Button)<StyledProps>`
  &.ant-btn {
    color: ${(props) => (props.$noBackground ? COLOR.RED : COLOR.WHITE)}!important;
    border-color: ${COLOR.RED} !important;
    border-width: ${(props) => (props.$noBackground ? 2 : 1)}px;
    background-color: ${(props) => (props.$noBackground ? 'transparent' : COLOR.RED)};

    &[disabled] {
      opacity: 0.5;
    }
  }
`
