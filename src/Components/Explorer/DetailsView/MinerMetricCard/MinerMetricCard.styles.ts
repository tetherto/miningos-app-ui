import styled from 'styled-components'

interface StyledProps {
  $indent?: unknown
}

import LabeledCard from '../../../Card/LabeledCard'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const LabeledCardWrapper = styled(LabeledCard)<StyledProps>`
  padding: 10px;
`

export const ContentWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 10px;
  padding: 10px 10px 0 10px;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`

export const Box = styled.div<StyledProps>`
  background-color: ${COLOR.WHITE_ALPHA_01};
  padding: 8px 10px;
  ${flexColumn};
  gap: 8px;
`

export const GridBox = styled(Box)<StyledProps>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  grid-column: span 2;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const Item = styled.div<StyledProps>`
  ${flexRow};
  gap: 6px;
  font-size: 14px;
  font-weight: 400;
  text-indent: ${(props) => (props.$indent ? '10px' : '0')};
`

export const FixedItem = styled(Item)<StyledProps>`
  @media (min-width: 1240px) {
    top: 16px;
    right: 15px;
  }
`

export const ItemLabel = styled.div<StyledProps>`
  color: ${COLOR.WHITE_ALPHA_06};
`

export const ItemValue = styled.div<StyledProps>``
