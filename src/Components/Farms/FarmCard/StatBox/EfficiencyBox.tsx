import { FC } from 'react'

import { formatNumber } from '../../../../app/utils/format'

import Efficiency from './Icons/Efficiency'
import {
  DataColumn,
  IconColumn,
  StatBoxContainer,
  Suffix,
  Title,
  TopRow,
  Value,
} from './StatBox.styles'
import { statBoxWithLoading } from './StatBoxWithLoading'

interface EfficiencyData {
  value: number
  unit: string
}

interface EfficiencyBoxProps {
  efficiency: EfficiencyData
}

const EfficiencyBox: FC<EfficiencyBoxProps> = ({ efficiency }) => (
  <StatBoxContainer>
    <TopRow>
      <IconColumn>
        <Efficiency />
      </IconColumn>
      <DataColumn>
        <Title>Efficiency</Title>
        <Value>
          {formatNumber(efficiency?.value)} <Suffix>{efficiency?.unit}</Suffix>
        </Value>
      </DataColumn>
    </TopRow>
  </StatBoxContainer>
)

export default statBoxWithLoading(EfficiencyBox)
