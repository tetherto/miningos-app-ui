import styled from 'styled-components'

interface StyledProps {
  $color?: string
  $bgColor?: unknown
}

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const HeaderWrapper = styled.div<StyledProps>`
  ${flexRow};
  gap: 24px;
  align-items: center;
`

export const HeaderTitleSection = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
  flex: 1;
`

export const HeaderTitle = styled.div<StyledProps>`
  font-size: 18px;
  line-height: 28px;
`

export const HeaderSubtitle = styled.div<StyledProps>`
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const MinerCountSection = styled.div<StyledProps>`
  font-size: 14px;
  line-height: 100%;
  color: ${COLOR.WHITE_ALPHA_07};
`

export const ValidationSection = styled.div<StyledProps>`
  font-size: 14px;
  line-height: 100%;
  color: ${({ $color }) => ($color ?? 'none') as string};
  background-color: ${({ $bgColor }) => ($bgColor ?? 'none') as string};
  padding: 4px 8px;
`
