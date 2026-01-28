import Button from 'antd/es/button'
import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import { useMemo, useState } from 'react'

import {
  ChartWrapper,
  DatePickerContainer,
  FilterItem,
  FiltersRow,
  TabContent,
} from '../Hashrate.styles'
import type { HashrateApiDataPoint } from '../Hashrate.types'
import { getMinerTypeOptionsFromApi, transformToSiteViewData } from '../Hashrate.utils'
import { useHashrateData } from '../hooks/useHashrateData'

import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import MosSelect from '@/Components/MosSelect/MosSelect'
import { UNITS } from '@/constants/units'
import { useDateRangePicker } from '@/hooks/useDatePicker'
import { ThresholdLineChart } from '@/MultiSiteViews/Charts/ThresholdLineChart/ThresholdLineChart'

interface SiteViewFilters {
  minerType: string[]
}

const SiteView = () => {
  const [filters, setFilters] = useState<SiteViewFilters>({
    minerType: [],
  })

  // Calculate default date range: 7 days ending yesterday
  const defaultDateRange = useMemo(() => {
    const yesterday = subDays(new Date(), 1)
    const endDate = endOfDay(yesterday)
    const startDate = startOfDay(subDays(yesterday, 6)) // 7 days total including yesterday
    return {
      start: startDate.getTime(),
      end: endDate.getTime(),
    }
  }, [])

  // Date range picker
  const { dateRange, datePicker, onTableDateRangeChange } = useDateRangePicker({
    start: defaultDateRange.start,
    end: defaultDateRange.end,
    isResetable: true,
    defaultRange: defaultDateRange,
  })

  // Fetch hashrate data from API
  const { data: apiData, isLoading } = useHashrateData({ dateRange })

  // Generate filter options from API data
  const minerTypeOptions = useMemo(
    () => getMinerTypeOptionsFromApi(apiData as HashrateApiDataPoint[] | undefined),
    [apiData],
  )

  // Transform API data to chart format with filters applied
  const chartData = useMemo(
    () => transformToSiteViewData(apiData as HashrateApiDataPoint[] | undefined, filters.minerType),
    [apiData, filters.minerType],
  )

  const handleFilterChange = (key: keyof SiteViewFilters, value: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFilters({
      minerType: [],
    })
    onTableDateRangeChange(null)
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

        <FilterItem>{datePicker}</FilterItem>

        <DatePickerContainer>
          <Button onClick={handleReset}>Reset</Button>
        </DatePickerContainer>
      </FiltersRow>

      <ChartWrapper>
        {isLoading ? (
          <ChartLoadingSkeleton />
        ) : (
          <ThresholdLineChart
            data={chartData}
            title="Hashrate"
            unit={UNITS.HASHRATE_TH_S}
            timeframeType={undefined}
            isLegendVisible
            legendPlacement="bottom"
            fillArea
          />
        )}
      </ChartWrapper>
    </TabContent>
  )
}

export default SiteView
