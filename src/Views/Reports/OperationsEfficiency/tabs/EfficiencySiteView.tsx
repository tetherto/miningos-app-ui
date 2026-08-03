import Button from 'antd/es/button'
import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import _head from 'lodash/head'
import _map from 'lodash/map'
import { useCallback, useMemo } from 'react'

import { SiteEfficiencyChart } from '../../OperationsDashboard/components/SiteEfficiencyChart'
import { AverageEfficiencyValue, DatePickerContainer } from '../OperationsEfficiency.styles'

import { useGetGlobalConfigQuery, useGetMetricsEfficiencyQuery } from '@/app/services/api'
import { formatUnit } from '@/app/utils/format'
import { Spinner } from '@/Components/Spinner/Spinner'
import { UNITS } from '@/constants/units'
import { useDateRangePicker } from '@/hooks/useDatePicker'
import { Label, Value } from '@/MultiSiteViews/Common.style'

interface GlobalConfig {
  nominalSiteWeightedAvgEfficiency?: number
}

const EfficiencySiteView = () => {
  // Default range: 7 days ending yesterday
  const yesterday = subDays(new Date(), 1)
  const defaultDateRange = {
    start: startOfDay(subDays(yesterday, 6)).getTime(),
    end: endOfDay(yesterday).getTime(),
  }

  const { dateRange, datePicker, onTableDateRangeChange } = useDateRangePicker({
    start: defaultDateRange.start,
    end: defaultDateRange.end,
    isResetable: true,
    defaultRange: defaultDateRange,
  })

  const handleReset = useCallback(() => {
    onTableDateRangeChange(null)
  }, [onTableDateRangeChange])

  const { data: globalConfig, isLoading: isLoadingNominal } = useGetGlobalConfigQuery({})

  const {
    data: efficiencyResponse,
    isLoading,
    isFetching,
    error,
  } = useGetMetricsEfficiencyQuery({ start: dateRange.start, end: dateRange.end })

  const chartData = useMemo(
    () =>
      _map(efficiencyResponse?.log ?? [], ({ ts, efficiencyWThs }) => ({
        ts,
        efficiency: efficiencyWThs,
      })),
    [efficiencyResponse],
  )

  const avgEfficiency = efficiencyResponse?.summary?.avgEfficiencyWThs ?? null
  const nominalValue = isLoadingNominal
    ? null
    : (_head(globalConfig as GlobalConfig[])?.nominalSiteWeightedAvgEfficiency ?? null)

  const isAnyLoading = isLoading || isFetching

  return (
    <>
      <DatePickerContainer>
        {datePicker}
        <Button onClick={handleReset}>Reset</Button>
      </DatePickerContainer>

      {isAnyLoading && <Spinner />}

      <SiteEfficiencyChart
        isExpanded
        data={chartData}
        nominalValue={nominalValue}
        isLoading={isAnyLoading}
        error={error}
        legendPosition="left"
        hasExpandedButton={false}
        onToggleExpand={() => {}}
        chartHeader={
          <>
            <Label>Average Efficiency</Label>
            <AverageEfficiencyValue>
              <Value $isHighlighted>{formatUnit({ value: avgEfficiency ?? 0 })}</Value>
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
