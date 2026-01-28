import styled from 'styled-components'

import { flexRow } from '../../../app/mixins'
import { DetailsViewContainer } from '../DetailsView/DetailsView.styles'

import { COLOR } from '@/constants/colors'

export const LvCabinetDetailsViewContainer = styled(DetailsViewContainer)`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  overflow-y: auto;
  background: ${COLOR.EBONY};
`
export const Title = styled.h3`
  font-size: 20px;
  font-weight: 400;
  color: ${COLOR.WHITE};
  margin: 0 0 10px 0;
`

export const DataBox = styled.div`
  padding: 10px;
  border: 1px solid ${COLOR.WHITE_ALPHA_01};
  margin-bottom: 5px;
  background: ${COLOR.EBONY};
`

export const DataBoxTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${COLOR.WHITE};
  margin-bottom: 8px;
  justify-content: space-between;
  ${flexRow};
`

export const DataRow = styled.div`
  ${flexRow};
  color: ${COLOR.DARK_GREY};
  column-gap: 8px;
`

export const Label = styled.div`
  flex-grow: 1;
`

export const Value = styled.div`
  color: ${(props) => props.color && props.color};
`

export const Unit = styled.div``

export const NoWarningsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
`

export const NoWarningsText = styled.div`
  color: ${COLOR.DARK_GREY};
  font-size: 14px;
`
