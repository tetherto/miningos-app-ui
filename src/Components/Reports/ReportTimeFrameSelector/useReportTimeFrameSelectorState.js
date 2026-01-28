import endOfDay from 'date-fns/endOfDay'
import endOfYesterday from 'date-fns/endOfYesterday'
import startOfDay from 'date-fns/startOfDay'
import startOfYesterday from 'date-fns/startOfYesterday'
import sub from 'date-fns/sub'
import _isNil from 'lodash/isNil'
import { useState } from 'react'

const useReportTimeFrameSelectorState = () => {
  const [presetTimeFrame, setPresetTimeFrame] = useState(1)
  const [dateRange, setDateRange] = useState([
    startOfDay(
      sub(startOfYesterday(), {
        months: 1,
      }),
    ),
    endOfYesterday(),
  ])

  const [start, end] = (() => {
    if (!_isNil(presetTimeFrame)) {
      return [
        sub(startOfYesterday(), {
          days: presetTimeFrame - 1,
        }),
        endOfYesterday(),
      ]
    }

    return [startOfDay(dateRange[0]), endOfDay(dateRange[1])]
  })()

  return {
    start,
    end,
    presetTimeFrame,
    dateRange,
    setPresetTimeFrame,
    setDateRange,
  }
}

export default useReportTimeFrameSelectorState
