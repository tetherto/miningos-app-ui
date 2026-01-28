import Col from 'antd/es/col'
import Row from 'antd/es/row'
import styled from 'styled-components'

import { flexColumn, flexJustifyBetween, flexRow } from '../../../app/mixins'

import { COLOR } from '@/constants/colors'

export const ContentBoxContainer = styled.div`
  background: ${COLOR.EBONY};
  padding: 0;
  flex-grow: 1;
  flex-basis: 50%;

  @media (max-width: 768px) {
    flex-basis: 100%;
  }
`

export const Title = styled.div`
  color: ${COLOR.WHITE};
  font-size: 18px;
  font-weight: 400;
  margin: 10px 0;
`

export const Content = styled.div``

export const ButtonsRow = styled.div`
  ${flexColumn};
  flex-wrap: wrap;
  gap: 10px;
`

export const StyledBulkControlsRow = styled(Row)`
  padding: 5px;
  justify-content: center;
`

export const TogglesRow = styled.div`
  ${flexColumn};
  flex-wrap: wrap;
  gap: 18px;
  margin: 20px 0 5px 0;
  justify-content: space-between;

  button.ant-btn {
    width: 100%;
    padding: 0;
  }
`

export const Toggle = styled.div`
  ${flexJustifyBetween};
  flex-basis: 50%;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0 5px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-bottom: 5px;
`

export const TableBox = styled.div`
  display: table;
  width: 100%;
`

export const EnabledDisableToggleWrapper = styled.div`
  ${flexRow};
  justify-content: center;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const StyledCol = styled(Col)`
  padding: 0 !important;
`
