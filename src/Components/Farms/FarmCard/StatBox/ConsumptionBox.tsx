import Tooltip from 'antd/es/tooltip'
import { FC } from 'react'

import { formatNumber } from '../../../../app/utils/format'
import { ColIconContainer } from '../../../Explorer/List/MinerCard/MinerCard.styles'
import { Blinker, DangerGlow } from '../../../Header/AlarmsHeader/AlarmsHeader.styles'

import useConsumptionColor from './hooks/useConsumptionColor'
import Alert from './Icons/Alert'
import { Consumption } from './Icons/Consumption'
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

interface ConsumptionData {
  value: number
  unit: string
  realValue?: number
  [key: string]: unknown
}

interface ConsumptionBoxProps {
  consumption: ConsumptionData
  error?: string
}

const ConsumptionBox: FC<ConsumptionBoxProps> = ({ consumption, error }) => {
  const colour = useConsumptionColor({
    consumption: consumption as { realValue?: number; [key: string]: unknown },
  })

  return (
    <StatBoxContainer $colour={colour}>
      <TopRow>
        <IconColumn $colour={colour}>
          {error ? (
            <Blinker>
              <DangerGlow>
                <Tooltip title={error}>
                  <ColIconContainer>
                    <Alert />
                  </ColIconContainer>
                </Tooltip>
              </DangerGlow>
            </Blinker>
          ) : (
            <Consumption />
          )}
        </IconColumn>
        <DataColumn $colour={colour}>
          <Title>Consumption</Title>
          <Value>
            {formatNumber(consumption?.value)} <Suffix $colour={colour}>{consumption?.unit}</Suffix>
          </Value>
        </DataColumn>
      </TopRow>
    </StatBoxContainer>
  )
}

export default statBoxWithLoading(ConsumptionBox)
