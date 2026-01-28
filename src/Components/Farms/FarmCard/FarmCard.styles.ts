import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const FarmCardContainer = styled.div`
  width: 450px;
  background: gray;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${COLOR.BLACK_ALPHA_03};
  box-shadow: 0 0 30px 0 ${COLOR.BLACK_ALPHA_03};
  ${flexRow};
`

export const LeftColumn = styled.div`
  background: ${COLOR.DARKER_GREY};
  flex-basis: 180px;
  color: ${COLOR.WHITE};
  overflow: hidden;
`

export const RightColumn = styled.div`
  background: ${COLOR.ONYX};
  flex-grow: 1;
  row-gap: 12px;
  justify-content: center;
  position: relative;
  ${flexColumn};
`

export const MenuIconContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 0;
  color: ${COLOR.WHITE_ALPHA_06};
  cursor: pointer;
  padding: 0 8px;

  &:hover {
    color: ${COLOR.WHITE};
  }
`
