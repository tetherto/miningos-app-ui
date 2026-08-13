import InputNumber from 'antd/es/input-number'
import styled from 'styled-components'

import { commonTextStyles, flexRow, upperCaseText } from '@/app/mixins'
import AppTable from '@/Components/AppTable/AppTable'
import { COLOR } from '@/constants/colors'

export const CostInputRoot = styled.div`
  min-height: 91vh;
  margin-top: 40px;
  padding: 0 20px 20px 20px;
`

export const StyledInputNumber = styled(InputNumber)`
  width: 50%;
  background-color: ${COLOR.WHITE_ALPHA_01};
  border: 1px solid ${COLOR.WHITE_ALPHA_02};
`

export const Header = styled.div`
  margin-bottom: 20px;
  ${commonTextStyles};
  ${upperCaseText};
  ${flexRow};
  justify-content: space-between;
`

export const HeaderSubtitle = styled.div`
  font-size: 14px;
  margin-top: 10px;
  line-height: 100%;
  text-transform: none;
  color: ${COLOR.COLD_ORANGE};
`

export const DatePickerContainer = styled.div`
  gap: 12px;
  padding: 13px 0;
  margin-bottom: 8px;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const PageFooterActions = styled.div`
  margin-top: 20px;
  ${flexRow};
  flex-direction: row-reverse;
`

export const CostInputTable = styled(AppTable)`
  .ant-table-thead > tr > th.energy-cost,
  th.operational-cost {
    @media (min-width: 768px) {
      position: relative;

      &.energy-cost::after {
        content: '+';
      }
      &.operational-cost::after {
        content: '=';
      }

      &::after {
        position: absolute;
        right: 20%;
        font-size: 16px;
        top: 6px;
      }
    }
  }
`
