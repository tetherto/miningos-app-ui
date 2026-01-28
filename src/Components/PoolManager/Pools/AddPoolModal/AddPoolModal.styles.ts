import styled from 'styled-components'

interface StyledProps {
  $color?: string
}

import { FormField } from '../../PoolManager.common.styles'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const SectionHeader = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`

export const SectionHeaderTitle = styled.div<StyledProps>`
  font-size: 16px;
  line-height: 24px;
`

export const ValidationStatusSection = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
`

export const ValidationStatusWrapper = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  align-items: baseline;
  padding: 16px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
`

export const ValidationStatusIndicator = styled.div<StyledProps>`
  ${flexRow};
  gap: 8px;
  align-items: baseline;
`

export const ValidationStatus = styled.div<StyledProps>`
  font-size: 14px;
  line-height: 20px;

  color: ${({ $color }) => $color ?? 'inherit'};
`

export const ValidationStatusIcon = styled.div<StyledProps>`
  padding-top: 8px;
  color: ${({ $color }) => $color ?? 'inherit'};
`

export const EndpointsSection = styled.div<StyledProps>`
  ${flexColumn};
  gap: 16px;
`

export const EndpointsSectionHeader = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`

export const EndpointsWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
`

export const EndpointWrapper = styled.div<StyledProps>`
  ${flexColumn};
  background-color: ${COLOR.OBSIDIAN};
  gap: 8px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 16px;
`

export const EndpointHeader = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`

export const EndpointPointRole = styled.div<StyledProps>`
  background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
  flex-basis: 80px;
  ${flexRow};
  justify-content: center;
  color: ${COLOR.COLD_ORANGE};
  font-size: 12px;
  align-items: center;
`

export const EndpointFields = styled.div<StyledProps>`
  ${flexRow};
  gap: 16px;

  & > ${FormField} {
    flex: 1;
  }
`

export const EndpointFieldValue = styled.div<StyledProps>`
  background-color: ${COLOR.WHITE_ALPHA_01};
  padding: 8px;
  font-size: 14px;
  line-height: 100%;
`
