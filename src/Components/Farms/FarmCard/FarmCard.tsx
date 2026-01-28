import { FarmCardContainer, LeftColumn, MenuIconContainer, RightColumn } from './FarmCard.styles'
import { Menu } from './Icons/Menu'
import { ProfitBox } from './ProfitBox/ProfitBox'
import ConsumptionBox from './StatBox/ConsumptionBox'
import HashrateBox from './StatBox/HashrateBox'
import MinersBox from './StatBox/MinersBox'
import { TemperatureBox } from './StatBox/TemperatureBox'
import { SummaryBox } from './SummaryBox/SummaryBox'
import { TimeScaleSelector } from './TimeScaleSelector/TimeScaleSelector'

const profitData = {
  currency: '$',
  total: 15,
  day: 4.05,
  costs: 1.57,
}

const FarmCard = () => (
  <FarmCardContainer>
    <LeftColumn>
      <TimeScaleSelector value="24h" />
      <ProfitBox data={profitData} />
      <SummaryBox farmName="Super farm 1" location="Australia" starred={387} />
    </LeftColumn>
    <RightColumn>
      <MenuIconContainer>
        <Menu />
      </MenuIconContainer>
      <MinersBox total={6} on={2} off={4} />
      <HashrateBox hashrate={{ unit: 'TH/s', value: 17.03 }} />
      <ConsumptionBox consumption={{ value: 34, unit: 'kW' }} />
      <TemperatureBox boards={12} chips={7} />
    </RightColumn>
  </FarmCardContainer>
)

export { FarmCard }
