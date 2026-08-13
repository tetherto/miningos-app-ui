import styled from 'styled-components'

import { flexCenter, flexCenterColumn } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const SigninContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  gap: 30px;
  ${flexCenterColumn};
`

export const LogoContainer = styled.a`
  color: ${COLOR.COLD_ORANGE};
  transform: translateX(75px);
  transition: filter 0.4s;
  margin-right: 140px;

  &:hover {
    filter: brightness(120%);
  }
`

export const Title = styled.h4`
  font-size: 24px;
  font-weight: 900;
  line-height: 29px;
  margin-top: 0;
`

export const GoogleButton = styled.a`
  ${flexCenter};
  height: 45px;
  width: 320px;
  font-size: 16px;
  column-gap: 8px;
  font-weight: 600;
  text-decoration: none;
  color: ${COLOR.WHITE};
  background-color: ${COLOR.BLACK};
  border: 1px solid ${COLOR.ORANGE};
  transition: color 0.2s;

  &:hover {
    color: ${COLOR.ORANGE};
  }
`

export const ErrorMessage = styled.p`
  font-weight: bold;
  color: ${COLOR.RED};
  margin: 20px 0 0 0;
`
