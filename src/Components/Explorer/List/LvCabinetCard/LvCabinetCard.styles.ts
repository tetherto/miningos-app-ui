import Row from 'antd/es/row'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { DeviceCardContainer } from '../ListView.styles'

import { COLOR } from '@/constants/colors'

export const LvCabinetCardContainer = styled(DeviceCardContainer)`
  cursor: pointer;
  justify-content: space-between;
  flex-wrap: nowrap;
`

export const BorderedLink = styled(Link)`
  border: 1px solid ${COLOR.COLD_ORANGE};
  padding: 5px 10px;
  border-radius: 6px;
`

export const StyledRow = styled(Row)`
  width: 100%;
`
