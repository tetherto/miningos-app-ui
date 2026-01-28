import styled from 'styled-components'

interface StyledProps {
  $isActive?: boolean
}

import { flexAlign, flexRow } from '../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const TimeScaleSelectorContainer = styled.div<StyledProps>`
  ${flexRow};
  padding: 24px 24px 0 24px;
  justify-content: space-between;
  align-items: center;
`

export const Scale = styled.div<StyledProps>`
  color: ${(props) => (props.$isActive ? COLOR.BLUE : COLOR.LIGHT_GREY)};
  font-weight: 400;
  font-size: 13px;
  cursor: pointer;
`

export const ScaleControl = styled.div<StyledProps>`
  ${flexAlign};
`
