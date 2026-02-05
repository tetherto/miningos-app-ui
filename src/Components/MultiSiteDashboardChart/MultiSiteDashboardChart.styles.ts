import { Link } from 'react-router'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ChartWrapper = styled.div`
  ${flexColumn};
  padding: 20px;
  min-height: 400px;
  box-sizing: border-box;
  background-color: ${COLOR.BLACK_ALPHA_05};
`

export const ChartHeader = styled.div`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`

export const StyledLink = styled(Link)`
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 14px;
  color: ${COLOR.COLD_ORANGE};

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`

export const Title = styled.h2`
  margin: 5px 0 10px 0;
  flex: 1;
  font-size: 20px;
  font-weight: 400;
  line-height: normal;
`

export const Unit = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  color: ${COLOR.GRAY};
`
