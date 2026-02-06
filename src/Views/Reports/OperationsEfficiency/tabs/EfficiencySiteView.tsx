import Button from 'antd/es/button'
import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import { useCallback } from 'react'

import { SiteEfficiencyChart } from '../../OperationsDashboard/components/SiteEfficiencyChart'
import { AverageEfficiencyValue, DatePickerContainer } from '../OperationsEfficiency.styles'

import { formatUnit } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { UNITS } from '@/constants/units'
import { useDateRangePicker } from '@/hooks/useDatePicker'
import { useOperationsDashboardData } from '@/hooks/useOperationsDashboardData'
import { Label, Value } from '@/MultiSiteViews/Common.style'
import { getLogSummary } from '@/Views/Financial/HashBalance/utils/hashRevenueCost.utils'

const EfficiencySiteView = () => {
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

  const { efficiency } = useOperationsDashboardData({
    start: dateRange.start,
    end: dateRange.end,
  })
  const { avg } = getLogSummary(efficiency.data)

  return (
    <>
      <DatePickerContainer>
        {datePicker}
        <Button onClick={handleReset}>Reset</Button>
      </DatePickerContainer>

      {efficiency.isLoading && <Spinner />}

      <SiteEfficiencyChart
        isExpanded
        data={efficiency.data}
        nominalValue={efficiency.nominalValue}
        isLoading={efficiency.isLoading}
        error={efficiency.error}
        legendPosition="left"
        hasExpandedButton={false}
        onToggleExpand={() => {}}
        chartHeader={
          <>
            <Label>Average Efficiency</Label>
            <AverageEfficiencyValue>
              <Value $isHighlighted>
                {formatUnit({
                  value: avg.efficiency,
                })}
              </Value>
              <Value $isTransparentColor $isValueMedium>
                {UNITS.EFFICIENCY_W_PER_TH_S}
              </Value>
            </AverageEfficiencyValue>
          </>
        }
      />
    </>
  )
}

export default EfficiencySiteView
