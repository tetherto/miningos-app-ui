import { formatNumber } from '../../../../../app/utils/format'
import Efficiency from '../Icons/Efficiency'
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

interface EfficiencyValue {
  value?: number
  unit?: string
}

interface EfficiencyBoxProps {
  efficiency?: EfficiencyValue
}

const EfficiencyBox = ({ efficiency }: EfficiencyBoxProps) => (
  <HeaderStatBoxWrapper>
    <HeaderStatBoxLeftCol>
      <HeaderStatBoxHeading>
        <Efficiency />
        <HeaderStatBoxTitle>Efficiency</HeaderStatBoxTitle>
      </HeaderStatBoxHeading>
      <HeaderStatBoxValueWrapper $justify="left">
        <HeaderStatBoxValue $big>
          {efficiency?.value !== undefined ? formatNumber(efficiency.value) : '-'}
        </HeaderStatBoxValue>
        <HeaderStatBoxValueSuffix>{efficiency?.unit}</HeaderStatBoxValueSuffix>
      </HeaderStatBoxValueWrapper>
    </HeaderStatBoxLeftCol>
  </HeaderStatBoxWrapper>
)

export default statBoxWithLoading(EfficiencyBox)
