import Radio from 'antd/es/radio'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const TimelineToggleButtonText = styled.div`
  font-size: 13px;
  font-weight: 500;
`

export const TimelineToggleOuterContainer = styled.div``

export const RadioButtonGroup = styled(Radio.Group)`
  border: 1px solid ${COLOR.WHITE_ALPHA_02} !important;

  .ant-radio-button-wrapper {
    border-radius: 0 !important;
    background: transparent !important;
    color: ${COLOR.WHITE_ALPHA_05} !important;
    border-right-width: 2px !important;

    &:last-child {
      border-right-width: 1px !important;
    }

    &::before {
      display: none !important;
    }

    &.ant-radio-button-wrapper-checked {
      color: ${COLOR.WHITE} !important;
      border-color: ${COLOR.WHITE_ALPHA_02} !important;
    }

    &:focus,
    &:active {
      box-shadow: none !important;
      outline: none !important;
    }
  }
`
