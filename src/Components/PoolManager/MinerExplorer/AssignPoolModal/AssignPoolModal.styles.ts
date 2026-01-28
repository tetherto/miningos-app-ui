import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const PoolMeta = styled.div`
  ${flexRow};
  gap: 8px;

  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0%;

  color: ${COLOR.WHITE_ALPHA_05};
`

export const EndpointsList = styled.div`
  ${flexColumn};
`
export const EndpointWrapper = styled.div`
  ${flexRow};
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  align-items: center;
  padding: 16px;
  gap: 8px;
`

export const EndpointRole = styled.div`
  ${flexRow};
  gap: 8px;
  flex-basis: 100px;
  align-items: center;
`

export const EndpointRoleName = styled.div`
  padding: 8px;
  background-color: ${COLOR.COLD_ORANGE_ALPHA_02};
  flex-basis: 80px;
  ${flexRow};
  justify-content: center;
  color: ${COLOR.COLD_ORANGE};
  font-size: 12px;
`

export const EndpointFields = styled.div`
  ${flexRow};
  flex: 1;
  justify-content: space-between;
`

export const EndpointFieldValueSecondary = styled.div`
  font-size: 12px;
  line-height: 100%;
  color: ${COLOR.WHITE_ALPHA_05};
`

export const EndpointFieldValue = styled.div`
  font-size: 14px;
  line-height: 100%;
`

export const CredentialTemplatePreview = styled.div`
  ${flexRow};
  justify-content: space-between;
  padding: 10px;
`

export const TemplateFieldName = styled.div`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0%;
`

export const TemplateFieldValue = styled.div`
  font-family: Inter;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
  color: ${COLOR.COLD_ORANGE};
`
