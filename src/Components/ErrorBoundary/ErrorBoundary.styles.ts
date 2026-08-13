import Collapse from 'antd/es/collapse'
import styled from 'styled-components'

import { COLOR } from '../../constants/colors'

export const ErrorBoundaryRoot = styled(Collapse)`
  border: 1px solid ${COLOR.RED};
  margin: 5px;
`

export const ErrorBoundaryTitle = styled.span`
  user-select: none;
`

export const ErrorBoundaryComponentName = styled.span`
  font-weight: 700;
  text-decoration: underline;
`

export const ErrorBoundaryMessage = styled.span`
  color: ${COLOR.RED};
`
