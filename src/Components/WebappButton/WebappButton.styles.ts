import Button from 'antd/es/button'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const StyledButton = styled(Button)`
  border-radius: 5px;
  color: ${COLOR.WHITE} !important;
  font-weight: 600;
  border: none;
  background: ${COLOR.COLD_ORANGE};
  box-shadow: 0 2px 0 0 ${COLOR.TRANSPARENT_BLACK};
  text-align: center;
  font-size: 14px;
  line-height: 22px;
  opacity: 1;

  &.ant-btn-default:not(:disabled):not(.ant-btn-disabled):hover {
    background: ${COLOR.ORANGE_HOVER};
    border: none;
  }
`
