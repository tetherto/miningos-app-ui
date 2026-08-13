import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { commonTextStyles, flexRow, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PoolManagerDashboardRoot = styled.div`
  color: ${COLOR.WHITE};
  margin-top: 30px;
  padding: 0 20px 20px 20px;
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

export const HeaderSubtitleLink = styled(Link)`
  color: ${COLOR.COLD_ORANGE};
`
