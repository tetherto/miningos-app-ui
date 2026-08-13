import Button from 'antd/es/button'
import { useMemo, useState } from 'react'

import {
  ChartContainer,
  ChartHeader,
  ChartTitle,
  ChartWrapper,
  DatePickerContainer,
  FilterItem,
  FiltersRow,
  TabContent,
  UnitLabel,
} from '../Hashrate.styles'
import { getMinerTypeOptionsFromApi, transformToMinerTypeBarData } from '../Hashrate.utils'
import { useHashrateData } from '../hooks/useHashrateData'

import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import MosSelect from '@/Components/MosSelect/MosSelect'
import ReportTimeFrameSelector, {
  useReportTimeFrameSelectorState,
} from '@/Components/Reports/ReportTimeFrameSelector/ReportTimeFrameSelector'
import { UNITS } from '@/constants/units'
import ThresholdBarChart from '@/MultiSiteViews/Charts/ThresholdBarChart/ThresholdBarChart'

interface MinerTypeViewFilters {
  minerType: string[]
}

const MinerTypeView = () => {
  const [filters, setFilters] = useState<MinerTypeViewFilters>({
    minerType: [],
  })

  // Date range state for time frame selector
  const reportTimeFrameState = useReportTimeFrameSelectorState()
  const { start, end } = reportTimeFrameState

  const { data: apiData, isLoading } = useHashrateData({
    dateRange: {
      start: start.getTime(),
      end: end.getTime(),
    },
    groupBy: 'miner',
  })

  const minerTypeOptions = useMemo(() => getMinerTypeOptionsFromApi(apiData?.log), [apiData])

  const chartData = useMemo(
    () => transformToMinerTypeBarData(apiData?.log, filters.minerType),
    [apiData, filters.minerType],
  )

  const handleFilterChange = (key: keyof MinerTypeViewFilters, value: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFilters({ minerType: [] })
    reportTimeFrameState.setPresetTimeFrame(1)
  }

  return (
    <TabContent>
      <FiltersRow>
        <FilterItem>
          <MosSelect
            options={minerTypeOptions}
            value={filters.minerType}
            onChange={(value) => handleFilterChange('minerType', value)}
            placeholder="Miner Type"
          />
        </FilterItem>

        <DatePickerContainer>
          <Button onClick={handleReset}>Reset</Button>
        </DatePickerContainer>
      </FiltersRow>

      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Hashrate</ChartTitle>
          <ReportTimeFrameSelector {...reportTimeFrameState} />
        </ChartHeader>
        <UnitLabel>{UNITS.HASHRATE_TH_S}</UnitLabel>
        <ChartWrapper>
          {isLoading ? (
            <ChartLoadingSkeleton />
          ) : (
            <ThresholdBarChart
              chartTitle=""
              data={chartData}
              unit=""
              barWidth={45}
              showDataLabels={false}
              isLegendVisible={false}
              noBackgroundColor
            />
          )}
        </ChartWrapper>
      </ChartContainer>
    </TabContent>
  )
}

export default MinerTypeView
