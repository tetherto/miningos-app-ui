import styled from 'styled-components'

import { flexCenterRow, flexAlign, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export interface TitleProps {
  $fontSize?: number
}

export interface PowerProps {
  $color?: string
  $fontSize?: number
  $valueFontWeight: number
}

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

export const Title = styled.div<TitleProps>`
  ${flexAlign};
  color: ${COLOR.LIGHT};
  font-size: ${(props) => props.$fontSize ?? 15}px;
  font-weight: 500;
  flex-grow: 1;
`

export const Power = styled.div<PowerProps>`
  font-size: ${(props) => props.$fontSize ?? 16}px;
  font-weight: ${(props) => props.$valueFontWeight};
  color: ${(props) => props.$color ?? COLOR.WHITE};

  span {
    font-size: ${(props) => props.$fontSize ?? 13}px;
    font-weight: 400;
    color: ${(props) => props.$color ?? COLOR.GREY};
  }
`
