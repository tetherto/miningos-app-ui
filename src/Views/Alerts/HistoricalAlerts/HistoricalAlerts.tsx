import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { HISTORICAL_LOG_TYPES } from '../../../app/services/api.utils'
import { selectFilterTags } from '../../../app/slices/devicesSlice'
import { getRangeTimestamps } from '../../../app/utils/dateUtils'
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/PresetDateRangePicker'
import useDeviceResolution from '../../../hooks/useDeviceResolution'
import { useFetchHistoricalLogsPaginatedData } from '../../../hooks/useFetchHistoricalLogsPaginatedData'
import useTableDateRange from '../../../hooks/useTableDateRange'
import useTimezone from '../../../hooks/useTimezone'
import { getAlertsTableColumns } from '../Alerts.table'
import type { AlertTableRecord } from '../Alerts.table'
import { getHistoricalAlertsData } from '../Alerts.util'
import { AlertsTableTitle } from '../AlertsTableTitle/AlertsTableTitle'
import { LocalFilters } from '../CurrentAlerts/CurrentAlerts'

import AppTable from '@/Components/AppTable/AppTable'
import { Alert } from '@/hooks/hooks.types'

interface HistoricalAlertsProps {
  localFilters: LocalFilters
  onAlertClick?: (id?: string, uuid?: string) => void
}

export const HistoricalAlerts: React.FC<HistoricalAlertsProps> = ({
  localFilters,
  onAlertClick,
}) => {
  const { isMobile } = useDeviceResolution()
  const { getFormattedDate, timezone } = useTimezone()
  const { dateRange, onTableDateRangeChange } = useTableDateRange()
  const filterTags = useSelector(selectFilterTags) as string[]

  const [pickerDates, setPickerDates] = useState(dateRange)

  const onRangeChangeHandler = (dates: [Date, Date] | null) => {
    if (!dates) return

    setPickerDates({
      start: dates[0].getTime(),
      end: dates[1].getTime(),
      period: '',
    })

    const nextTableDateRange = getRangeTimestamps(dates, timezone)
    if (nextTableDateRange && nextTableDateRange[0] && nextTableDateRange[1]) {
      onTableDateRangeChange([nextTableDateRange[0], nextTableDateRange[1]])
    }
  }

  const { data: alertsLogData, isLoading: isAlertsLogLoading } =
    useFetchHistoricalLogsPaginatedData({
      start: dateRange.start,
      end: dateRange.end,
      logType: HISTORICAL_LOG_TYPES.ALERTS,
    })

  return (
    <AppTable<AlertTableRecord>
      rowKey={(record) => record.uuid}
      title={() => (
        <AlertsTableTitle
          title="Historical Alerts Log"
          subtitle={
            <PresetDateRangePicker
              currentValue={[new Date(pickerDates.start), new Date(pickerDates.end)]}
              onRangeChange={onRangeChangeHandler}
            />
          }
        />
      )}
      pagination={{ showSizeChanger: true }}
      dataSource={getHistoricalAlertsData(alertsLogData as Alert[], {
        filterTags,
        localFilters,
        onAlertClick,
      })}
      columns={getAlertsTableColumns(isMobile, getFormattedDate)}
      loading={isAlertsLogLoading}
    />
  )
}
