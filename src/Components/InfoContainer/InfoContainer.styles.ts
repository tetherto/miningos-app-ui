import styled from 'styled-components'

import { flexColumn, flexRow } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

export const InfoText = styled.div`
  font-weight: 600;
  margin-right: 5px;
  color: ${COLOR.DARK_GREY};
`

export const InfoValue = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 200px;
`

export const InfoContainerDiv = styled.div`
  ${flexRow};
  justify-content: space-between;
  font-size: 12px;
`
export const DeviceInfoContainer = styled.div`
  ${flexColumn};
  box-sizing: border-box;
  width: 100%;
  gap: 5px;
  padding: 10px;
`
