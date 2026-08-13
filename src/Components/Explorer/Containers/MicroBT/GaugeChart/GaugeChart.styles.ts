import Col from 'antd/es/col'
import styled from 'styled-components'

import { flexCenterColumn } from '../../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const GaugeContainer = styled.div`
  overflow: hidden;
  ${flexCenterColumn};
`

export const ChartTitle = styled(Col)`
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 10px;
`

export const ChartValue = styled(Col)`
  font-size: 21px;
  font-weight: 500;
  line-height: 1;
  color: ${COLOR.WHITE};
  margin-top: -40px;
  text-align: center;
  display: flex;
  gap: 2px;
`
