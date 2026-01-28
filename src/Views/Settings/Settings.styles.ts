import Button from 'antd/es/button'
import Tabs from 'antd/es/tabs'
import { styled } from 'styled-components'

import { flexColumn, flexRow } from '../../app/mixins'
import { COLOR } from '../../constants/colors'

import { Title } from '@/Components/Shared'

export const SettingsContainer = styled.div`
  ${flexColumn};
  padding: 10px 20px;
  gap: 20px;
  min-width: 300px;
`

export const SettingsTitle = styled(Title)`
  margin-top: 30px !important;
`

export const UserManagementHeader = styled.div`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  > h1 {
    margin: 0 !important;
  }
`

export const UserListActions = styled.div`
  ${flexRow};
  justify-content: right;
  margin: 20px 0;
  gap: 20px;
`

export const HeaderTabs = styled(Tabs)`
  .ant-tabs-tab.ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: ${COLOR.COLD_ORANGE};
    }
  }

  .ant-tabs-tab:hover {
    color: ${COLOR.COLD_ORANGE};
  }
`
export const RebootDescription = styled.span`
  ${flexColumn};
  gap: 20px;
  max-width: 500px;
`

export const TopActionWrapper = styled.div`
  ${flexRow};
  margin: 0 0 20px 10px;
  width: 300px;
  gap: 10px;
`

export const SpotPriceBtn = styled(Button)`
  max-width: 100px;
`

export const SpotBtnWrapper = styled(TopActionWrapper)<{ $right: boolean }>`
  justify-content: ${({ $right }) => ($right ? 'flex-end' : 'flex-start')};
  margin: 10px 0 0 10px;
  margin-left: ${({ $right }) => ($right ? 0 : '8px')};
  width: 100%;
`
