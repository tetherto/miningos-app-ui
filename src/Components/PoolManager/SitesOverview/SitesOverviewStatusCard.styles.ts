import styled, { css } from 'styled-components'

interface StyledProps {
  $textColor?: unknown
  $value?: unknown
}

import { flexCenterRow, flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const Card = styled.div<StyledProps>`
  ${flexColumn};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 12px;
  cursor: pointer;
`

export const Header = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

export const UnitInfo = styled.div<StyledProps>`
  ${flexCenterRow};
  gap: 10px;
`

export const UnitName = styled.span<StyledProps>`
  font-weight: 600;
  font-size: 14px;
`

export const StatusBadge = styled.span<StyledProps>`
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 400;
  text-transform: capitalize;
  border-radius: 4px;
  color: ${(props) => (props.$textColor as string) ?? COLOR.WHITE};
  background-color: ${(props) => {
    const color = (props.$textColor as string) ?? COLOR.WHITE
    return `${color}33`
  }};
`

export const InfoList = styled.div<StyledProps>`
  font-size: 13px;
  line-height: 1.6;
  font-weight: 300;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const OverridesUnit = styled.span<StyledProps>`
  ${({ $value }: StyledProps) =>
    (($value as number) ?? 0) > 0
      ? css<StyledProps>`
          color: ${COLOR.COLD_ORANGE};
        `
      : ''}
`
