import styled from 'styled-components'

import { flexJustifyCenter, flexRow } from '../../../../../app/mixins'

import { COLOR } from '@/constants/colors'
import { StatusColors } from '@/Theme/GlobalColors'

type StatusType = 'normal' | 'warning' | 'fault' | 'unavailable'

interface StyledProps {
  $status?: StatusType
}

export const StatusItemContainer = styled.div<StyledProps>`
  flex-basis: 33%;

  @media (max-width: 768px) {
    flex-basis: 100%;
  }
`

export const Content = styled.div<StyledProps>`
  ${flexRow};
  padding: 0 50px;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0;
  }
`

export const Label = styled.div<StyledProps>`
  font-size: 15px;
  font-weight: 600;
`

export const Status = styled.div<StyledProps>`
  ${flexJustifyCenter};
  font-size: 16px;
  font-weight: 700;
  border-radius: 0;
  border: 1px solid ${COLOR.ORANGE};
  padding: 5px 15px;
  background-color: ${(props) =>
    props.$status ? StatusColors[props.$status] : StatusColors.unavailable};
  min-width: 100px;
  height: fit-content;
  flex-shrink: 0;
  white-space: nowrap;
`
