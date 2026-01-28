import _ceil from 'lodash/ceil'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import _times from 'lodash/times'

import {
  PrimaryText,
  SecondaryText,
  Row,
  LineChartCardFooterContainer,
  LineChartCardFooterMinMaxAvgContainer,
  FooterStats,
  FooterStatsCol,
  FooterStatsRow,
  FooterStatLabel,
  FooterStatValue,
} from './LineChartCard.styles'
import MinMaxAvg from './MinMaxAvg'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

interface FooterStatItem {
  label: string
  value: string | number
}

interface LineChartCardFooterProps {
  secondaryValueLabel?: UnknownRecord
  minMaxAvg?: UnknownRecord
  stats?: FooterStatItem[]
  statsItemsPerCol?: number
}

const LineChartCardFooter = ({
  secondaryValueLabel = {},
  minMaxAvg = {},
  stats = [],
  statsItemsPerCol = 1,
}: LineChartCardFooterProps) => (
  <LineChartCardFooterContainer $statsItemsPerCol={statsItemsPerCol}>
    {!_isEmpty(minMaxAvg) && (
      <LineChartCardFooterMinMaxAvgContainer>
        <MinMaxAvg {...minMaxAvg} />
      </LineChartCardFooterMinMaxAvgContainer>
    )}
    {!_isEmpty(stats) && (
      <FooterStats $statsItemsPerCol={statsItemsPerCol}>
        {_times(_ceil(_size(stats) / statsItemsPerCol), (colIndex: number) => {
          const colItemsFirstIndex = colIndex * statsItemsPerCol

          const colItems = _slice(stats, colItemsFirstIndex, colItemsFirstIndex + statsItemsPerCol)

          const rowStyle = {
            flex: 1 / statsItemsPerCol,
          }

          return (
            <FooterStatsCol key={colIndex}>
              {_map(colItems, (item: FooterStatItem) => (
                <FooterStatsRow
                  style={rowStyle}
                  key={item.label}
                  $statsItemsPerCol={statsItemsPerCol}
                >
                  <FooterStatLabel>{item.label}</FooterStatLabel>
                  <FooterStatValue>{item.value}</FooterStatValue>
                </FooterStatsRow>
              ))}
            </FooterStatsCol>
          )
        })}
      </FooterStats>
    )}
    <Row>
      <PrimaryText>{secondaryValueLabel?.title as string | undefined}</PrimaryText>
      <SecondaryText style={{ fontSize: 15 }}>
        {secondaryValueLabel?.value as string | number | undefined}
      </SecondaryText>
    </Row>
  </LineChartCardFooterContainer>
)

export default LineChartCardFooter
