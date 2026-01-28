import styled, { css } from 'styled-components'

import { flexCenter, flexJustifyAround, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const ContainerWidgetsRoot = styled.div<{ $column?: boolean }>`
  ${flexJustifyAround};
  margin-top: 20px;
  padding: 0 20px;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 8px;

  ${({ $column }) =>
    $column &&
    css`
      flex-direction: column;
    `};
`

export const ErrorMessage = styled.div`
  color: ${COLOR.BRICK_RED};
  font-weight: 700;
  padding: 40px 0;
  text-align: center;
`

export const OfflineMessage = styled.div`
  ${flexCenter};
  font-size: 15px;
  font-weight: 500;
  padding: 40px 0;
  text-align: center;
  text-transform: uppercase;
  gap: 10px;
`

export const ContainersWrapper = styled.div`
  ${flexRow};
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  padding: 12px 0;

  a,
  a:hover,
  a:active,
  a:visited {
    color: ${COLOR.WHITE};
  }

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 475px) {
    gap: 8px;
  }
`
