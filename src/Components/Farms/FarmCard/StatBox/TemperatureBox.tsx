import { TemperatureCelsius } from './Icons/TemperatureCelsius'
import {
  BottomRow,
  DataColumn,
  IconColumn,
  StatBoxContainer,
  Tag,
  Title,
  TopRow,
  TemperatureLabel,
  TemperatureItem,
  TemperatureRowContainer,
  TemperatureValue,
} from './StatBox.styles'

interface TemperatureBoxProps {
  boards?: number | string
  chips?: number | string
}

const TemperatureBox = ({ boards, chips }: TemperatureBoxProps) => (
  <StatBoxContainer>
    <TopRow>
      <IconColumn>
        <TemperatureCelsius />
      </IconColumn>
      <DataColumn>
        <Title>
          Temperature
          <Tag>Max</Tag>
        </Title>
      </DataColumn>
    </TopRow>
    <BottomRow>
      <TemperatureRowContainer>
        <TemperatureItem>
          <TemperatureLabel>boards</TemperatureLabel>
          <TemperatureValue>{boards}°</TemperatureValue>
        </TemperatureItem>
        <TemperatureItem>
          <TemperatureLabel>chips</TemperatureLabel>
          <TemperatureValue>{chips}°</TemperatureValue>
        </TemperatureItem>
      </TemperatureRowContainer>
    </BottomRow>
  </StatBoxContainer>
)

export { TemperatureBox }
