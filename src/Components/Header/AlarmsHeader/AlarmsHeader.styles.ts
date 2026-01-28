import { styled } from 'styled-components'

import { flexCenter, flexCenterRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const BellIconContainer = styled.div`
  ${flexCenter};
  cursor: pointer;
  transition: transform 0.1s;
  width: 45px;
  height: 45px;

  &:hover {
    transform: scale(1.1);
  }
`

export const AlarmsHeaderOuterContainer = styled.div`
  ${flexCenterRow};
  gap: 10px;
  margin-right: 10px;
  background-color: ${COLOR.COLD_ORANGE}33;
  position: relative;
  box-sizing: border-box;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    z-index: 1;
  }

  &::before {
    top: 0;
    left: 0;
    border-style: solid;
    border-width: 8px 8px 0 0;
    border-color: ${COLOR.BLACK} transparent transparent transparent;
  }

  &::after {
    bottom: 0;
    right: 0;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent ${COLOR.BLACK} transparent;
  }
`

export const DangerGlow = styled.div`
  color: ${COLOR.RED};
  text-shadow:
    0 0 20px ${COLOR.RED},
    0 0 30px ${COLOR.RED},
    0 0 40px ${COLOR.RED},
    0 0 50px ${COLOR.RED},
    0 0 60px ${COLOR.RED},
    0 0 70px ${COLOR.RED},
    0 0 80px ${COLOR.RED};
`

export const Blinker = styled.div`
  animation: blinker 0.25s cubic-bezier(0.5, 0, 1, 1) infinite alternate;
  @keyframes blinker {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`
