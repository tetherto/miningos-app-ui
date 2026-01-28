import Button from 'antd/es/button'
import Collapse from 'antd/es/collapse'
import styled from 'styled-components'

interface StyledProps {
  $noBackground?: boolean
  $color?: string
}

import { flexAlign, flexCenter, flexColumn, flexRow } from '../../../app/mixins'
import { hexToOpacity } from '../../../Components/LineChartCard/utils'
import { COLOR } from '../../../constants/colors'

const AlignedButton = styled(Button)<StyledProps>`
  &&& {
    ${flexCenter};
  }
`

export const DangerButton = styled(AlignedButton)<StyledProps>`
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

export const WarningButton = styled(AlignedButton)<StyledProps>`
  &&& {
    color: ${COLOR.BLACK} !important;
    background-color: ${COLOR.YELLOW} !important;
  }

  &&&:hover,
  &&&:active {
    color: ${COLOR.BLACK} !important;
    border-color: ${COLOR.YELLOW_DARK} !important;
    background-color: ${COLOR.YELLOW_DARK};
  }

  &&&[disabled] {
    opacity: 0.5;
  }
`

export const PrimaryButton = styled(AlignedButton)<StyledProps>`
  transition: all 0.1s ease-in-out;

  &&&,
  &&&:hover {
    color: ${COLOR.SIMPLE_BLACK} !important;
    border-color: ${COLOR.COLD_ORANGE};
    background-color: ${(props) => (props.$noBackground ? 'transparent' : COLOR.COLD_ORANGE)};
    box-shadow: none !important;
  }

  &&&:hover {
    color: ${COLOR.WHITE}!important;
  }

  &&&[disabled] {
    opacity: 0.5;
  }
`

export const SecondaryButton = styled(AlignedButton)<StyledProps>`
  &.ant-btn {
    color: ${COLOR.WHITE_ALPHA_08} !important;
    border: 1px solid ${COLOR.WHITE_ALPHA_02} !important;
    box-shadow: none !important;

    &:hover {
      border-color: ${COLOR.ORANGE_BORDER} !important;
    }

    &[disabled] {
      opacity: 0.5;
    }
  }
`

export const ChangeContainer = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  gap: 20px;
`

export const ChangeContainerWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
`

export const ChangeContainerText = styled.p<StyledProps>`
  color: ${COLOR.WHITE_ALPHA_08};
  font-size: 12px;
  font-weight: 800;
  line-height: 14px;
  letter-spacing: 1.32px;
  text-transform: uppercase;
`

export const ChangeContainerTextRight = styled(ChangeContainerText)<StyledProps>`
  word-break: break-word;
  line-height: 18px;
`

export const ChangeContainerRightWrapper = styled.div<StyledProps>`
  ${flexAlign};
  flex-direction: row;
  gap: 8px;
`

export const IconWrapper = styled.div<StyledProps>``

export const ActionBadge = styled.div<StyledProps>`
  padding: 4px 8px;
  min-width: 125px;
  max-width: fit-content;
  color: ${(props) => props.$color};
  background-color: ${(props) => hexToOpacity(props.$color, 0.1)};
`

export const TimeWrapper = styled.div<StyledProps>`
  ${flexRow};
`

export const ActionHeaderButtonsContainer = styled.div<StyledProps>`
  ${flexAlign};
  gap: 20px;
  flex-direction: row;
  margin-top: 10px;
`
export const ActionsCollapse = styled(Collapse)<StyledProps>`
  border-radius: 0 !important;

  .ant-collapse-header {
    padding: 25px !important;
    background: ${COLOR.OBSIDIAN};
  }

  .ant-collapse-content {
    border-top: none !important;
    background: ${COLOR.OBSIDIAN};
  }

  .ant-collapse-header-text {
    max-width: calc(100% - 28px);
  }
`
