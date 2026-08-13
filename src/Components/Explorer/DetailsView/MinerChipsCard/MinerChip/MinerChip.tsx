import { FC } from 'react'

import { formatNumber } from '../../../../../app/utils/format'

import {
  ChipMinMaxContainerText,
  ChipPropertyText,
  ChipTitleText,
  ChipValueText,
  ChipValueTypeText,
  MinerChipContainer,
} from './MinerChip.styles'

interface MinerChipProps {
  index: number
  frequency: {
    current: number
  }
  temperature: {
    avg: number
    min: number
    max: number
  }
}

const MinerChip: FC<MinerChipProps> = ({ index, frequency, temperature }) => (
  <MinerChipContainer>
    <ChipTitleText>Chip {index}</ChipTitleText>
    <ChipPropertyText>Temperature</ChipPropertyText>
    <ChipValueText>{formatNumber(temperature.avg)} °C</ChipValueText>
    <ChipMinMaxContainerText>
      <ChipValueText>
        {formatNumber(temperature.min)}
        <ChipValueTypeText> min (°C) </ChipValueTypeText>
      </ChipValueText>
      <ChipValueText>
        {formatNumber(temperature.max)}
        <ChipValueTypeText> max (°C)</ChipValueTypeText>
      </ChipValueText>
    </ChipMinMaxContainerText>
    <ChipPropertyText>Frequency</ChipPropertyText>
    <ChipValueText>{formatNumber(frequency.current)} MHz</ChipValueText>
  </MinerChipContainer>
)

export default MinerChip
