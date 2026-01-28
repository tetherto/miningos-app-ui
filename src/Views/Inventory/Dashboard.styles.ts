import styled from 'styled-components'

import { commonTextStyles, upperCaseText } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const InventoryDashboardRoot = styled.div`
  color: ${COLOR.WHITE};
  margin-top: 30px;
  padding: 10px;
`

export const Header = styled.div`
  margin-bottom: 20px;
  ${commonTextStyles};
  ${upperCaseText};
`
