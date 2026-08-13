import styled from 'styled-components'

import { flexColumn } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const DashboardWrapper = styled.div`
  ${flexColumn};
  gap: 10px;
  padding: 20px;
  box-sizing: border-box;
`

export const Title = styled.h1`
  margin: 10px 0 0 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 40px;
  color: ${COLOR.WHITE};
`
