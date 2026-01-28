import styled from 'styled-components'

interface StyledProps {
  $isNonClickable?: unknown
}

import { DeviceCardContainer } from '../ListView.styles'

export const ContainerCardContainer = styled(DeviceCardContainer)<StyledProps>`
  cursor: ${(props) => (!props.$isNonClickable ? 'pointer' : '')};
`
