import styled from 'styled-components'

import { commonTextStyles, flexRow, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PoolManagerDashboardRoot = styled.div`
  color: ${COLOR.WHITE};
  margin-top: 30px;
  padding: 0 20px;
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
  line-height: 100%;
  color: ${COLOR.COLD_ORANGE};
  text-transform: none;
  margin-top: 10px;
`
