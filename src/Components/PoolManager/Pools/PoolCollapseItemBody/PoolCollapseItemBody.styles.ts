import styled from 'styled-components'

interface StyledProps {
  $color?: string
}

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const BodyWrapper = styled.div<StyledProps>`
  ${flexColumn};
  gap: 32px;
`

export const Endpoints = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
`

export const SectionHeader = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
`

export const SectionHeaderTitle = styled.div<StyledProps>`
  font-size: 16px;
  line-height: 24px;
`

export const EndpointsList = styled.div<StyledProps>`
  ${flexColumn};
`
export const EndpointWrapper = styled.div<StyledProps>`
  ${flexRow};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  align-items: center;
  padding: 16px;
  gap: 32px;
`

export const EndpointRole = styled.div<StyledProps>`
  ${flexRow};
  gap: 8px;
  flex-basis: 150px;
  align-items: center;
`

export const EndpointRoleName = styled.div<StyledProps>`
  padding: 8px;
  background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
  flex-basis: 80px;
  ${flexRow};
  justify-content: center;
  color: ${COLOR.COLD_ORANGE};
  font-size: 12px;
`

export const EndpointField = styled.div<StyledProps>`
  ${flexColumn};
  flex: 1;
`

export const EndpointFieldTitle = styled.div<StyledProps>`
  font-size: 12px;
  line-height: 100%;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const EndpointFieldValue = styled.div<StyledProps>`
  font-size: 14px;
  line-height: 100%;
`

export const EndpointAction = styled.div<StyledProps>`
  flex: 0;
`

export const CredentialsSection = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
`

export const CredentialsWrapper = styled.div<StyledProps>`
  ${flexRow};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  padding: 16px;
  gap: 32px;
`

export const CredentialField = styled.div<StyledProps>`
  ${flexColumn};
  flex: 1;
  gap: 8px;
`

export const CredentialFieldLabel = styled.div<StyledProps>`
  font-size: 14px;
  line-height: 100%;
`

export const CredentialFieldValue = styled.div<StyledProps>`
  background-color: ${COLOR.WHITE_ALPHA_01};
  padding: 8px;
  font-size: 14px;
  line-height: 100%;
`

export const ValidationStatusSection = styled.div<StyledProps>`
  ${flexColumn};
  gap: 8px;
`

export const ValidationStatusWrapper = styled.div<StyledProps>`
  ${flexRow};
  justify-content: space-between;
  align-items: center;
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

export const ValidationTimestamp = styled.div<StyledProps>`
  font-size: 12px;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const ValidationStatusIcon = styled.div<StyledProps>`
  padding-top: 8px;
  color: ${({ $color }) => $color ?? 'inherit'};
`
