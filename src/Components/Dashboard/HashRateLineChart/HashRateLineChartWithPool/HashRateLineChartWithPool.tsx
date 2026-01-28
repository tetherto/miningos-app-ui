import { IChartApi } from 'lightweight-charts'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { useEffect, useRef, useState } from 'react'

import {
  CHART_MIN_HEIGHT,
  MINER_AGGR_FIELDS,
  MINER_FIELDS,
} from './HashRateLineChartWithPool.const'
import { StyledRow } from './HashRateLineChartWithPool.styles'
import { Timeline, MinerPoolDataItem } from './HashRateLineChartWithPool.types'
import {
  buildLegends,
  buildChartData,
  calculateMinMaxAvg,
  calculateTimeRange,
  getHashRateTimeRange,
  transformHashRateData,
  calculateAggrPoolData,
  extractUniquePoolTypes,
  filterAndDownsampleMinerPoolData,
} from './HashRateLineChartWithPool.utils'

import { useGetTailLogQuery, useGetFeatureConfigQuery } from '@/app/services/api'
import { getHashrateString } from '@/app/utils/deviceUtils'
import { getTimelineRadioButtons } from '@/app/utils/getTimelineDropdownData'
import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import LineChart from '@/Components/LineChart/LineChart'
import { LIMIT, getTimelineDateFormat } from '@/Components/LineChartCard/helper'
import {
  LegendColor,
  LegendsFlexCol,
  LegendContainer,
  LegendLabelText,
  LegendLabelsRow,
  NoDataContainer,
  LoaderContainer,
  FetchingOverlay,
  LineChartContainer,
  HeaderLeftContainer,
  LineChartCardContainer,
} from '@/Components/LineChartCard/LineChartCard.styles'
import LineChartCardFooter from '@/Components/LineChartCard/LineChartCardFooter'
import LineChartCardToggle from '@/Components/LineChartCard/LineChartCardToggle'
import { Loader } from '@/Components/Loader/Loader'
import { DATE_RANGE } from '@/constants'
import { CHART_TITLES } from '@/constants/charts'
import { useChartDataCheck } from '@/hooks/useChartDataCheck'
import { useFetchExtDataPaginated } from '@/hooks/useFetchExtDataPaginated'

interface HashRateLineChartWithPoolProps {
  tag: string
}

export const HashRateLineChartWithPool = ({ tag = 't-miner' }: HashRateLineChartWithPoolProps) => {
  const featureConfig = useGetFeatureConfigQuery({}).data as { isOneMinItvEnabled?: boolean }
  const isOneMinEnabled = featureConfig?.isOneMinItvEnabled

  const chartRef = useRef<IChartApi | null>(null)

  const [timeline, setTimeline] = useState<Timeline>(DATE_RANGE.M5)
  const [legendHidden, setLegendHidden] = useState<Record<string, boolean>>({})

  const { data: minerpoolData, isInitialLoading: isMinerpoolInitialLoading } =
    useFetchExtDataPaginated<MinerPoolDataItem>({
      type: 'minerpool',
      queryKey: 'stats-history',
    })

  const {
    data: minerTailLogData,
    isLoading: isMinerTailLogLoading,
    isFetching: isMinerTailLogFetching,
  } = useGetTailLogQuery({
    key: `stat-${timeline}`,
    type: 'miner',
    tag,
    limit: LIMIT,
    fields: MINER_FIELDS,
    aggrFields: MINER_AGGR_FIELDS,
  })

  const timelineRadioButtons = getTimelineRadioButtons({ isOneMinEnabled })

  const [isFetching, setIsFetching] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (isMinerTailLogFetching) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setIsFetching(true)
    } else if (isFetching) {
      rafRef.current = requestAnimationFrame(() => {
        setIsFetching(false)
      })
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isMinerTailLogFetching, isFetching])

  const hashRateTimeRange = getHashRateTimeRange(minerTailLogData)
  const minerPoolData = filterAndDownsampleMinerPoolData(minerpoolData, hashRateTimeRange, timeline)
  const hashRateData = transformHashRateData(minerTailLogData)
  const aggrPoolData = calculateAggrPoolData(minerPoolData)
  const hasData = !_isEmpty(hashRateData) || !_isEmpty(minerPoolData)
  const minMaxAvg = calculateMinMaxAvg(hashRateData)
  const timeRange = calculateTimeRange(hashRateData)
  const uniquePoolTypes = extractUniquePoolTypes(minerPoolData)
  const legends = buildLegends(uniquePoolTypes, hasData)
  const chartData = buildChartData({
    legends,
    hashRateData,
    aggrPoolData,
    minerPoolData,
    legendHidden,
    timeRange,
  })
  const hasNoData = useChartDataCheck({ data: chartData })

  const handleLegendClick = (label: string) => {
    setLegendHidden((prevState) => ({
      ...prevState,
      [label]: !prevState[label],
    }))
  }

  const isLoading = isMinerTailLogLoading || isMinerpoolInitialLoading

  if (isLoading) {
    return (
      <LoaderContainer>
        <ChartLoadingSkeleton minHeight={CHART_MIN_HEIGHT} />
      </LoaderContainer>
    )
  }

  return (
    <LineChartCardContainer>
      <StyledRow>
        <HeaderLeftContainer>
          <LineChartCardToggle
            timeline={timeline}
            title={CHART_TITLES.HASH_RATE}
            radioButtons={timelineRadioButtons}
            onChangeTimeline={setTimeline}
          />
          <LegendsFlexCol $expand>
            {!hasNoData && !_isEmpty(legends) && (
              <LegendLabelsRow>
                {_map(legends, (item, index) => (
                  <LegendContainer
                    key={`${item.label}-${index}`}
                    $hidden={legendHidden[item.label]}
                    onClick={() => handleLegendClick(item.label)}
                  >
                    <LegendColor color={item.color} />
                    <LegendLabelText>{item.label}</LegendLabelText>
                  </LegendContainer>
                ))}
              </LegendLabelsRow>
            )}
          </LegendsFlexCol>
        </HeaderLeftContainer>
      </StyledRow>
      <LineChartContainer>
        {isMinerTailLogFetching && (
          <FetchingOverlay>
            <Loader />
          </FetchingOverlay>
        )}
        {hasNoData ? (
          <NoDataContainer>No records found</NoDataContainer>
        ) : (
          <LineChart
            data={chartData}
            chartRef={chartRef}
            timeline={timeline}
            customDateFormat={getTimelineDateFormat(timeline)}
            yTicksFormatter={(value: number) => getHashrateString(value)}
          />
        )}
      </LineChartContainer>
      {!hasNoData && <LineChartCardFooter minMaxAvg={minMaxAvg} />}
    </LineChartCardContainer>
  )
}
