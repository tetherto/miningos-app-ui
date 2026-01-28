import _isNumber from 'lodash/isNumber'
import _last from 'lodash/last'
import _map from 'lodash/map'
import { useRef, useState } from 'react'

import LineChart from '../../LineChart/LineChart'
import { Spinner } from '../../Spinner/Spinner'
import TimelineToggle from '../../TimelineToggle/TimelineToggle'

import {
  ChartContainer,
  Container,
  Item,
  LabelText,
  Row,
  TimeIntervalCol,
  TimeIntervalRow,
} from './BitcoinDataSection.styles'

import { useGetExtDataQuery } from '@/app/services/api'
import { getHashrateUnit } from '@/app/utils/deviceUtils'
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { formatUnit, formatValueUnit, getPercentFormattedNumber } from '@/app/utils/format'
import { shortTimelineRadioButtons } from '@/app/utils/getTimelineDropdownData'
import { decimalToMegaNumber } from '@/app/utils/numberUtils'
import { LineChartData } from '@/Components/LineChart/LineChart.utils'
import { CHART_COLORS } from '@/constants/colors'

interface DateRange {
  start: number
  end: number
}
interface BitcoinDataSectionProps {
  isLoading?: boolean
  currentHashrateValue: number
  poolHashrateValue: number
  dateRange: DateRange
}

const BitcoinDataSection = ({
  isLoading,
  currentHashrateValue,
  poolHashrateValue,
  dateRange,
}: BitcoinDataSectionProps) => {
  const chartRef = useRef<unknown>(null)

  const [timeline, setTimeline] = useState(_last(shortTimelineRadioButtons)?.value ?? '1h')

  const { data: networkData, isLoading: isLoadingNetData } = useGetExtDataQuery({
    type: 'mempool',
    query: JSON.stringify({
      hashrateRange: {
        start: dateRange.start,
        end: dateRange.end,
        interval: timeline,
      },
    }),
  })

  if (isLoading) {
    return <Spinner />
  }

  const currentHashrate = getHashrateUnit(decimalToMegaNumber(currentHashrateValue))
  const poolHashrate = getHashrateUnit(decimalToMegaNumber(poolHashrateValue))
  const netValue = (poolHashrateValue * 100) / currentHashrateValue
  const netPercent = getPercentFormattedNumber(netValue)

  type NetworkPoint = { time: number; hashrate: number }
  type NetworkResponse = unknown

  const extractNetworkPoints = (payload: NetworkResponse): NetworkPoint[] => {
    if (!Array.isArray(payload)) return []
    const first = payload[0]
    if (!Array.isArray(first)) return []
    const bucket = first[0] as unknown
    const points: unknown = (bucket as UnknownRecord)?.hashrates
    if (!Array.isArray(points)) return []
    return points.filter(
      (p: unknown): p is NetworkPoint =>
        _isNumber((p as NetworkPoint)?.time) && _isNumber((p as NetworkPoint)?.hashrate),
    )
  }

  const networkPoints = extractNetworkPoints(networkData as unknown)

  const chartsData: {
    datasets: Array<{
      label?: string
      visible?: boolean
      borderColor: string
      data: Array<{ x: number; y: number | null | undefined }>
    }>
  } = {
    datasets: [
      {
        data: _map(networkPoints, (item: NetworkPoint) => {
          const hashrateUnit = getHashrateUnit(item.hashrate)
          return {
            x: item.time,
            y: _isNumber(hashrateUnit.value) ? hashrateUnit.value : null,
          }
        }),
        borderColor: CHART_COLORS.orange,
      },
    ],
  }

  return (
    <Container>
      <Row>
        <Item>
          <span>{formatValueUnit(currentHashrate.value ?? 0, currentHashrate.unit ?? '')}</span>
          <LabelText>Current Network Hashrate</LabelText>
        </Item>
        <Item>
          <span>{netPercent}</span>
          <LabelText>% of Network</LabelText>
        </Item>
        <Item>
          <span>{formatValueUnit(poolHashrate.value ?? 0, poolHashrate.unit ?? '')}</span>
          <LabelText>Current Pool Hashrate (Total Current site)</LabelText>
        </Item>
      </Row>
      <TimeIntervalRow>
        <TimeIntervalCol>
          <TimelineToggle
            radioButtons={shortTimelineRadioButtons}
            disabled={isLoadingNetData}
            value={timeline}
            onChange={setTimeline}
          />
        </TimeIntervalCol>
      </TimeIntervalRow>
      <Row>
        {!isLoadingNetData && (
          <ChartContainer>
            <LineChart
              chartRef={
                chartRef as import('react').RefObject<import('lightweight-charts').IChartApi>
              }
              data={chartsData as LineChartData}
              customLabel="Current Network Hashrate"
              yTicksFormatter={(value: unknown) =>
                `${formatUnit(getHashrateUnit(value as number))}`
              }
            />
          </ChartContainer>
        )}
      </Row>
    </Container>
  )
}

export default BitcoinDataSection
