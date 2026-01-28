import styled from 'styled-components'

import { flexCenterRow, flexAlign, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const MainContainer = styled.div`
  ${flexRow};
  align-items: center;
  gap: 10px;
  color: ${COLOR.WHITE} !important;

  font-weight: 500;
  font-size: 16px;
  padding: 16px;
  border-bottom: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const TopRowInnerContainer = styled.div`
  flex: 1;
  ${flexCenterRow};
`

export const Title = styled.div`
  ${flexAlign};
  color: ${COLOR.LIGHT};
  font-size: 15px;
  font-weight: 500;
  flex-grow: 1;
`

export const Power = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${COLOR.WHITE};

  span {
    font-size: 13px;
    font-weight: 400;
    color: ${COLOR.GREY};
  }
`
