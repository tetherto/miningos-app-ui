import styled from 'styled-components'

import { flexColumn, flexRow } from '../../../../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ButtonsContainer = styled.div`
  ${flexRow};
  align-items: center;
  width: 100%;
  margin: 10px 0;
  gap: 18px;
  flex-wrap: wrap;
`

export const SectionContainer = styled.div`
  ${flexColumn};
  padding: 10px;
  gap: 30px 10px;
  width: 100%;
`

export const SectionTitle = styled.div`
  color: ${COLOR.COLD_ORANGE};
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 25px;
  text-transform: uppercase;
  margin-bottom: 10px;
`

export const SubsectionTitle = styled.div`
  color: ${COLOR.LIGHT};
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin-bottom: 10px;
`

export const BiMainCoolingSystemWrapper = styled.div`
  ${flexColumn}
  gap: 12px;
`

export const PowerStatus = styled.div`
  ${flexRow};
  align-items: center;
  gap: 8px;
`
