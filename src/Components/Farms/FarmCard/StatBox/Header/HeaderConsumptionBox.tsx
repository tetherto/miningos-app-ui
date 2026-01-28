import Tooltip from 'antd/es/tooltip'
import _isNil from 'lodash/isNil'

import { formatNumber } from '../../../../../app/utils/format'
import { COLOR } from '../../../../../constants/colors'
import { ColIconContainer } from '../../../../Explorer/List/MinerCard/MinerCard.styles'
import { Blinker, DangerGlow } from '../../../../Header/AlarmsHeader/AlarmsHeader.styles'
import useConsumptionColor from '../hooks/useConsumptionColor'
import Alert from '../Icons/Alert'
import { Consumption } from '../Icons/Consumption'
import { statBoxWithLoading } from '../StatBoxWithLoading'

import {
  HeaderStatBoxHeading,
  HeaderStatBoxLeftCol,
  HeaderStatBoxTitle,
  HeaderStatBoxValue,
  HeaderStatBoxValueSuffix,
  HeaderStatBoxValueWrapper,
  HeaderStatBoxWrapper,
} from './HeaderStatBox.styles'

interface ConsumptionValue {
  value?: number
  unit?: string
  realValue?: number
}

interface ConsumptionBoxProps {
  consumption?: ConsumptionValue
  error?: string
}

const ConsumptionBox = ({ consumption, error }: ConsumptionBoxProps) => {
  const consumptionForHook = consumption
    ? {
        realValue: consumption.realValue,
      }
    : undefined
  const color = useConsumptionColor({ consumption: consumptionForHook })
  const consumptionExists = consumption && !_isNil(consumption?.value)

  return (
    <HeaderStatBoxWrapper>
      <HeaderStatBoxLeftCol>
        <HeaderStatBoxHeading>
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
          <HeaderStatBoxTitle $color={color} $flash={color === COLOR.RED && consumptionExists}>
            Consumption
          </HeaderStatBoxTitle>
        </HeaderStatBoxHeading>
        <HeaderStatBoxValueWrapper
          $justify="left"
          $color={color}
          $flash={color === COLOR.RED && consumptionExists}
        >
          <HeaderStatBoxValue $big>
            {consumption?.value !== undefined
              ? formatNumber(consumption.value, { maximumFractionDigits: 3 })
              : '-'}
          </HeaderStatBoxValue>
          <HeaderStatBoxValueSuffix>{consumption?.unit}</HeaderStatBoxValueSuffix>
        </HeaderStatBoxValueWrapper>
      </HeaderStatBoxLeftCol>
    </HeaderStatBoxWrapper>
  )
}

export default statBoxWithLoading(ConsumptionBox)
