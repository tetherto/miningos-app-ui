import Select from 'antd/es/select'
import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../app/mixins'
import { CardContainer } from '../../../Components/Card/Card.styles'

import { COLOR } from '@/constants/colors'

export const Wrapper = styled.div`
  ${flexColumn};
  gap: 15px;
`

export const HeaderWrapper = styled.div`
  ${flexRow};
  gap: 10px;
`

export const BalanceBarChartRoot = styled.div`
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
`

export const StyledSelect = styled(Select)`
  width: 180px;
  height: 36.5px;
`

export const BarChartCardContainer = styled(CardContainer)`
  padding: 10px;
  background-color: ${COLOR.BLACK_ALPHA_05};
  border: 0;

  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
  }
`
