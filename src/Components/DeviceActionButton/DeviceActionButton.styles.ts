import Button from 'antd/es/button'
import styled from 'styled-components'

interface StyledProps {
  $status?: string
}

import { flexCenter } from '@/app/mixins'
import { COLOR } from '@/constants/colors'
import { DeviceActionButtonColors, StatusLabelColors } from '@/Theme/GlobalColors'

export const StatusLabel = styled.div<StyledProps>`
  ${flexCenter};
  color: ${COLOR.WHITE};
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  height: 14px;
  border-radius: 3px;
  width: fit-content;
  padding-left: 5px;
  padding-right: 5px;
  background-color: ${(props) =>
    (StatusLabelColors as Record<string, string | undefined>)[props?.$status ?? '']};
  flex-grow: 0;
`

export const ActionButton = styled(Button)<StyledProps>`
  color: ${COLOR.WHITE} !important;
  background-color: ${(props) =>
    (DeviceActionButtonColors as Record<string, string | undefined>)[
      props?.$status ?? ''
    ]} !important;
  height: auto;
  cursor: ${(props) => (props.ghost ? 'inital' : 'pointer')};
  pointer-events: ${(props) => (props.ghost ? 'none' : 'auto')};
`
