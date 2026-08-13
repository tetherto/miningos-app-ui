import Button from 'antd/es/button'
import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import { useCallback, useEffect, useState } from 'react'

import { HashrateChart } from './components/HashrateChart'
import { MinersStatusChart, MinersStatusData } from './components/MinersStatusChart'
import { PowerConsumptionChart } from './components/PowerConsumptionChart'
import { SiteEfficiencyChart } from './components/SiteEfficiencyChart'
import { ChartsGrid, DashboardWrapper, DatePickerContainer } from './styles'

import { Spinner } from '@/Components/Spinner/Spinner'
import { useDateRangePicker } from '@/hooks/useDatePicker'
import { useOperationsDashboardData } from '@/hooks/useOperationsDashboardData'

const CHART_IDS = {
  HASHRATE: 'hashrate',
  CONSUMPTION: 'consumption',
  EFFICIENCY: 'efficiency',
  MINERS: 'miners',
}

// Module-level ref to persist expanded chart states across component remounts
const expandedChartsRef = { current: {} as Record<string, boolean> }

const OperationsDashboard = () => {
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>(
    expandedChartsRef.current,
  )

  // Calculate default date range: 7 days ending yesterday
  const yesterday = subDays(new Date(), 1)
  const defaultDateRange = {
    start: startOfDay(subDays(yesterday, 6)).getTime(), // 7 days total including yesterday
    end: endOfDay(yesterday).getTime(),
  }

  // Date range picker - default range is last 7 days (excluding today)
  const { dateRange, datePicker, onTableDateRangeChange } = useDateRangePicker({
    start: defaultDateRange.start,
    end: defaultDateRange.end,
    isResetable: true,
    defaultRange: defaultDateRange,
  })

  // Reset to default 7 days range
  const handleReset = useCallback(() => {
    onTableDateRangeChange(null)
  }, [onTableDateRangeChange])

  const toggleExpand = useCallback((chartId: string) => {
    setExpandedCharts((prev) => ({
      ...prev,
      [chartId]: !prev[chartId],
    }))
  }, [])

  // Memoize toggle functions to prevent unnecessary re-renders
  const toggleHashrate = useCallback(() => toggleExpand(CHART_IDS.HASHRATE), [toggleExpand])
  const toggleConsumption = useCallback(() => toggleExpand(CHART_IDS.CONSUMPTION), [toggleExpand])
  const toggleEfficiency = useCallback(() => toggleExpand(CHART_IDS.EFFICIENCY), [toggleExpand])
  const toggleMiners = useCallback(() => toggleExpand(CHART_IDS.MINERS), [toggleExpand])

  // Sync state changes to module-level ref for persistence across remounts
  useEffect(() => {
    expandedChartsRef.current = expandedCharts
  }, [expandedCharts])

  // Fetch all dashboard data
  const chartData = useOperationsDashboardData(dateRange)
  const { isAnyLoading } = chartData

  return (
    <DashboardWrapper>
      <DatePickerContainer>
        {datePicker}
        <Button onClick={handleReset}>Reset</Button>
      </DatePickerContainer>

      {isAnyLoading && <Spinner />}

      <ChartsGrid>
        <HashrateChart
          hasHeaderPaddingLeft
          data={chartData.hashrate.data}
          error={chartData.hashrate.error}
          isLoading={chartData.hashrate.isLoading}
          nominalValue={chartData.hashrate.nominalValue}
          isExpanded={expandedCharts[CHART_IDS.HASHRATE] ?? false}
          legendPosition="left"
          onToggleExpand={toggleHashrate}
        />

        <PowerConsumptionChart
          hasHeaderPaddingLeft
          data={chartData.consumption.data}
          error={chartData.consumption.error}
          isLoading={chartData.consumption.isLoading}
          nominalValue={chartData.consumption.nominalValue}
          legendPosition="left"
          onToggleExpand={toggleConsumption}
          isExpanded={expandedCharts[CHART_IDS.CONSUMPTION] ?? false}
        />

        <SiteEfficiencyChart
          hasHeaderPaddingLeft
          data={chartData.efficiency.data}
          error={chartData.efficiency.error}
          isLoading={chartData.efficiency.isLoading}
          nominalValue={chartData.efficiency.nominalValue}
          legendPosition="left"
          isExpanded={expandedCharts[CHART_IDS.EFFICIENCY] ?? false}
          onToggleExpand={toggleEfficiency}
        />

        <MinersStatusChart
          contentCentered
          data={chartData.miners.data as unknown as MinersStatusData}
          isLoading={chartData.miners.isLoading}
          error={chartData.miners.error}
          isExpanded={expandedCharts[CHART_IDS.MINERS] ?? false}
          onToggleExpand={toggleMiners}
        />
      </ChartsGrid>
    </DashboardWrapper>
  )
}

export default OperationsDashboard
