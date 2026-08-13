import Button from 'antd/es/button'
import Modal from 'antd/es/modal'
import styled from 'styled-components'

interface StyledProps {
  $isPinned?: boolean
  $isModal?: boolean
}

import { flexAlign, flexColumn, flexJustifyEnd } from '../../app/mixins'
import { COLOR } from '../../constants/colors'

export const SidebarModal = styled(Modal)<StyledProps>`
  top: 0;
  right: 0;
  bottom: 0;
  position: fixed;
  justify-content: space-between;
  height: 100vh;
  padding: 0;
  width: 20%;
  ${flexColumn};

  @media (max-width: 475px) {
    max-width: 100% !important;
    width: 100%;
    left: 0;
  }

  .ant-modal-content {
    height: 100vh;
    border-radius: 0;
    overflow-x: hidden;
    background-color: ${COLOR.EBONY};
    border: none !important;
    border-left: 1px solid ${COLOR.WHITE_ALPHA_01} !important;
  }

  .ant-modal-title {
    background-color: ${COLOR.SIMPLE_BLACK};
  }

  .ant-modal-close {
    top: 16px;
  }

  .ant-modal-body {
    padding-right: 12px;
    overflow-x: hidden;
    height: calc(100% - 85px);
    overflow-y: auto !important;
  }

  .ant-modal-footer {
    display: none;
  }
`

export const SidebarInnerContainer = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px;
  width: 100%;
  contain: layout;
  ${(props) => (props.$isPinned ? 'height: calc(100vh - 187px)' : '')}
`

export const SidebarHeaderContainer = styled.div<StyledProps>`
  ${flexAlign};
  margin-bottom: ${(props) => !props.$isModal && '20px'};
  font-size: 16px;
  font-weight: 600;
  gap: 10px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const StyledButton = styled(Button)<StyledProps>`
  background-color: ${COLOR.SIMPLE_BLACK};
`

export const ButtonWrapper = styled.div<StyledProps>`
  ${flexJustifyEnd};
  gap: 12px;
`
