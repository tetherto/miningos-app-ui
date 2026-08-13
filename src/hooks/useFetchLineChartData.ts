import _isEmpty from 'lodash/isEmpty'

import { useGetTailLogQuery } from '../app/services/api'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'
import { LIMIT, timelineToMs } from '../Components/LineChartCard/helper'
import { TIME } from '../constants'
import { POLLING_5s } from '../constants/pollingIntervalConstants'

import useSubtractedTime from './useSubtractedTime'

interface UseFetchLineChartDataParams {
  dateRange?: { start?: number; end?: number }
  skipPolling?: boolean
  isFieldsCompulsory?: boolean
  fields?: UnknownRecord
  skipUpdates?: boolean
  timeline?: string
  aggrFields?: UnknownRecord
  type?: string
  tag?: string
  end?: number
  skip?: boolean
  limit?: number
  pollingInterval?: number
}

const useFetchLineChartData = ({
  dateRange,
  skipPolling,
  isFieldsCompulsory,
  fields,
  skipUpdates,
  timeline,
  aggrFields,
  type,
  tag,
  end,
  skip,
  limit,
  pollingInterval,
}: UseFetchLineChartDataParams) => {
  const { start: startRange, end: endRange } = dateRange || {}
  const time = useSubtractedTime(TIME.TEN_MINS, TIME.ONE_MIN)

  const chartReqParams: UnknownRecord = {
    key: `stat-${timeline}`,
    type,
    tag,
  }
  if (fields) chartReqParams.fields = JSON.stringify(fields)
  if (aggrFields) chartReqParams.aggrFields = JSON.stringify(aggrFields)

  const { data: tailLogData, isLoading } = useGetTailLogQuery(
    {
      ...chartReqParams,
      limit: limit || LIMIT,
      // eslint-disable-next-line no-nested-ternary
      start: dateRange
        ? startRange
        : end !== undefined
          ? end - (timelineToMs(timeline || '1D') ?? 0) * (limit || LIMIT)
          : undefined,
      end: dateRange ? endRange : end || undefined,
    },
    { skip: skip || (isFieldsCompulsory && _isEmpty(fields)) },
  )

  const { data: tailLogDataUpdates } = useGetTailLogQuery(
    {
      ...chartReqParams,
      limit: 1,
      start: time,
    },
    {
      pollingInterval: skipPolling ? undefined : pollingInterval || POLLING_5s,
      skip: skip || (isFieldsCompulsory && _isEmpty(fields)) || skipUpdates,
    },
  )
  return { tailLogData, tailLogDataUpdates, isLoading }
}

export default useFetchLineChartData
