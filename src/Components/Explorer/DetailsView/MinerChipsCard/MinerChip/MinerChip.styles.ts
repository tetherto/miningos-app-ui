import styled from 'styled-components'

import { flexCenterRow, flexColumn } from '../../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const MinerChipContainer = styled.div`
  width: 85px;
  ${flexColumn};
  padding: 10px 5px;
  margin: 2px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid ${COLOR.LIGHT};
`
export const ChipTitleText = styled.p`
  color: ${COLOR.COLD_ORANGE};
  margin-bottom: 5px;
`

export const ChipPropertyText = styled.p`
  color: ${COLOR.LIGHT};
  margin-bottom: 4px;
  font-size: 12px;
`

export const ChipValueText = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
`

export const ChipValueTypeText = styled.p`
  font-size: 8px;
`

export const ChipMinMaxContainerText = styled.div`
  ${flexCenterRow};
  text-align: center;
  gap: 10px;
`
