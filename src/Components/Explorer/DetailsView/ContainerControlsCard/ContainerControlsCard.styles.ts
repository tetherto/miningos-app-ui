import Row from 'antd/es/row'
import styled from 'styled-components'

import { flexRow } from '../../../../app/mixins'

export const ControlWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 5px;
`

export const ContainerControlsCardRow = styled(Row)`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 10px;

  button.ant-btn {
    width: 100%;
  }
`

export const ContainerControlStatsRow = styled.div`
  ${flexRow};
  width: 100%;
`
