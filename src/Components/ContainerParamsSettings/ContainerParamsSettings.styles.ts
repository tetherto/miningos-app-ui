import Row from 'antd/es/row'
import styled from 'styled-components'

import { COLOR } from '@/constants/colors'

export const ContainerParamsSettingsTitle = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 25px;
  text-transform: uppercase;
`

export const ContainerParamsSettingsSection = styled(Row)`
  padding: 20px;
`

export const ContainerParamsSettingsInputTitle = styled.div`
  color: ${COLOR.LIGHT};
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  padding-bottom: 8px;
`
