import { NumericFormat } from 'react-number-format'
import styled from 'styled-components'

interface StyledProps {
  $longText?: unknown
  $color?: string
}

import { flexColumn, flexRow, alignCenter, flexCenterRow } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const Item = styled.div<StyledProps>`
  ${flexCenterRow};
  font-size: 20px;
  font-weight: 700;

  input {
    width: 100%;
    max-width: 134px;
    border: 1px solid ${COLOR.ORANGE};
    border-radius: 2px;
    background: ${COLOR.GRAY};
    color: white;
  }

  @media (min-width: 992px) {
    ${(prop: StyledProps & { inline?: boolean }) => (prop.inline ? flexRow : flexColumn)};
  }
`

export const LabelText = styled.span<StyledProps>`
  font-size: 12px;
  color: ${COLOR.COLD_ORANGE};
  font-weight: 500;
  text-align: center;

  @media (min-width: 992px) {
    max-width: ${(prop) => (prop.$longText ? '190px' : '135px')};
  }
`

export const Value = styled.span<StyledProps>`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.$color};
`

export const Boxed = styled.div<StyledProps>`
  border: 1px solid ${COLOR.ORANGE};
  border-radius: 0;
  ${flexRow};
  ${alignCenter};
  gap: 10px;
  margin: 0 10px;
  min-width: 140px;
  min-height: 70px;
`

export const NumericInputWrapper = styled(NumericFormat)<StyledProps>`
  flex: 1;
  margin: 2px 0;
`
