import _map from 'lodash/map'

import {
  Card,
  CardRow,
  CardBody,
  CardLabel,
  CardPower,
  CardTitle,
  CardValue,
  CardHeader,
  DataCardGrid,
  CardPowerUnit,
  CardValueUnit,
  CardPowerValue,
  CardValueNumber,
} from './DataCard.styles'

import { formatNumber } from '@/app/utils/format'

export type DataCardChild = {
  label: string
  value: number
  unit: string
}

export type DataCardItem = {
  title: string
  power: number
  unit: string
  children: DataCardChild[]
}

type DataCardProps = {
  data: DataCardItem[]
  padding?: number
  columns?: number
  minWidth?: number
}

const DataCard = ({ data, columns = 4, minWidth = 275, padding = 0 }: DataCardProps) => (
  <DataCardGrid $columns={columns} $minWidth={minWidth} $padding={padding}>
    {_map(data, ({ title, power, unit, children }) => (
      <Card key={title}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardPowerValue>
            <CardPower>
              {formatNumber(power, {
                minimumFractionDigits: 2,
              })}
            </CardPower>
            <CardPowerUnit>{unit}</CardPowerUnit>
          </CardPowerValue>
        </CardHeader>
        <CardBody>
          {_map(children, ({ label, value, unit }) => (
            <CardRow key={label}>
              <CardLabel>{label}</CardLabel>
              <CardValue>
                <CardValueNumber>
                  {formatNumber(value, {
                    minimumFractionDigits: 2,
                  })}
                </CardValueNumber>
                <CardValueUnit>{unit}</CardValueUnit>
              </CardValue>
            </CardRow>
          ))}
        </CardBody>
      </Card>
    ))}
  </DataCardGrid>
)

export default DataCard
