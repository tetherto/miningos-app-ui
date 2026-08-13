import Button from 'antd/es/button'
import Tabs from 'antd/es/tabs'
import styled from 'styled-components'

import { flexColumn, flexRow } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ContainerRoot = styled.div`
  ${flexColumn};
  align-items: flex-start;
  padding: 20px;
  margin-top: 20px;
  padding-right: 0;
`

export const BackButtonContainer = styled.div`
  font-size: 25px;
  color: ${COLOR.COLD_ORANGE};
  gap: 20px;
  ${flexRow};
  align-items: flex-end;
  margin-left: 20px;
`

export const ContainerTabsWrapper = styled.div`
  margin-top: 24px;
  position: relative;
  width: 100%;
`

export const CommentButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
`

export const StyledAntdTabs = styled(Tabs)`
  .ant-tabs-nav .ant-tabs-tab {
    border: none;
    transition: none !important;
    padding: 9px 14px !important;
    background-color: transparent;

    &:not(:first-child) {
      margin-left: 16px !important;
    }
  }

  .ant-tabs-tab-active {
    color: ${COLOR.COLD_ORANGE} !important;
    border-bottom: 2px solid ${COLOR.COLD_ORANGE} !important;
  }

  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${COLOR.COLD_ORANGE} !important;
  }

  .ant-tabs-nav-list {
    flex-wrap: wrap;
  }

  .ant-tabs-content-holder {
    padding-top: 16px;
  }

  .ant-tabs-nav::before {
    bottom: -1px !important;
  }
`

export const ContainerHeader = styled.div`
  ${flexColumn};
  gap: 10px;
`

export const ContainerName = styled.p`
  color: ${COLOR.WHITE};
  font-size: 24px;
  font-weight: 400;
  line-height: 24px;
`

export const ContainerStyledButton = styled(Button)`
  color: ${COLOR.COLD_ORANGE};
  font-size: 14px;
  font-weight: 400;
  background: unset;
  border: unset;
  box-shadow: unset;
  padding: 0;
  justify-content: flex-start;

  &:hover {
    background: unset !important;
  }
`
