import { styled } from 'styled-components'

import { flexCenterColumn, flexCenterRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const AlertsHeaderOuterContainer = styled.div`
  ${flexCenterRow};
  background-color: ${COLOR.COLD_ORANGE}33;
  margin-right: 10px;
  position: relative;
  box-sizing: border-box;

  &::after {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    z-index: 1;
  }

  &::after {
    bottom: 0;
    right: 0;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent ${COLOR.BLACK} transparent;
  }
`

export const AlertsIconContainer = styled.div`
  ${flexCenterColumn};
  cursor: pointer;
  width: 45px;
  height: 45px;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }
`
