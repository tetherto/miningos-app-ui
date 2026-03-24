import styled from 'styled-components'

import { flexColumn, flexJustifyBetween } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const EntityHeaderWrapper = styled.div`
  ${flexJustifyBetween};
  align-items: flex-start;
`

export const EntityHeaderLeft = styled.div`
  ${flexColumn};
  gap: 2px;
`

export const EntityHeaderId = styled.div`
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  color: ${COLOR.WHITE};
`

export const EntityHeaderName = styled.div`
  font-size: 9px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.3px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const EntityHeaderStatus = styled.span<{ $color: string; $bgColor: string }>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  line-height: normal;
  color: ${({ $color }) => $color};
  background-color: ${({ $bgColor }) => $bgColor};
`
