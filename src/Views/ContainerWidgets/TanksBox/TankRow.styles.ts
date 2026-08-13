import styled, { css } from 'styled-components'

import { flashTextAnimation, flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

const rootGap = '12px'

export const TankRowRoot = styled.div`
  ${flexColumn};
  gap: ${rootGap};
  flex: 1;
  padding: 12px;
  font-size: 12px;
  font-weight: 400;
  line-height: 12px;
  background-color: ${COLOR.WHITE_ALPHA_005};
`

export const TankParams = styled.div`
  ${flexColumn};
  gap: 8px;
`

export const TankParam = styled.div`
  ${flexRow};
  flex: 1;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  gap: 8px;
`

interface TankParamLabelProps {
  $color?: string
  $flash?: boolean
}

interface TankParamValueProps {
  $color?: string
  $flash?: boolean
}

export const TankParamLabel = styled.span<TankParamLabelProps>`
  font-size: 12px;
  text-align: left;
  text-wrap: nowrap;

  ${({ $color, $flash }) =>
    $color === COLOR.WHITE
      ? css`
          color: ${COLOR.WHITE_ALPHA_05};
        `
      : css`
          color: ${$color || COLOR.WHITE_ALPHA_05};
          ${$flash &&
          css`
            animation: ${flashTextAnimation($color, COLOR.WHITE_ALPHA_05)} 1s infinite;
          `}
        `}
`

export const TankParamValue = styled.span<TankParamValueProps>`
  ${flexRow};
  color: ${({ $color }) => $color || COLOR.GREY};

  ${(props) =>
    props.$flash &&
    css`
      animation: ${flashTextAnimation(props.$color)} 1s infinite;
    `}
`

// ---------------- Pump Statuses ----------------
export const TankPumpStatuses = styled.div`
  ${flexRow};
  gap: 16px;
  padding-top: ${rootGap};
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};

  & > * {
    flex: 1;

    * {
      font-size: 10px;

      @media (max-width: 768px) {
        font-size: 9px;
      }
    }
  }
`
