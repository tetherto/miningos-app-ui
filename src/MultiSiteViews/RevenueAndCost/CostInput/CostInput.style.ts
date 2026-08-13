import InputNumber from 'antd/es/input-number'
import styled from 'styled-components'

import { flexRow } from '@/app/mixins'
import AppTable from '@/Components/AppTable/AppTable'

export const HeaderControls = styled.div`
  ${flexRow}
  max-width: 350px;

  & > * {
    flex: 1;
  }
`

export const StyledInputNumber = styled(InputNumber)`
  width: 100%;
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
