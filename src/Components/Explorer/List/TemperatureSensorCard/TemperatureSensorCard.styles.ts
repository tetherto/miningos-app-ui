import styled from 'styled-components'

interface StyledProps {
  $isSelected?: boolean
}

import { DeviceCardContainer } from '../ListView.styles'

import { COLOR } from '@/constants/colors'

export const TemperatureSensorCardContainer = styled(DeviceCardContainer)<StyledProps>`
  cursor: pointer;
  margin: 0 0 10px 0;

  border-color: ${(props) => (props.$isSelected ? COLOR.OCEAN_GREEN : COLOR.EMERALD)};
`
