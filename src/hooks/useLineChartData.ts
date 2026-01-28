import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _keyBy from 'lodash/keyBy'
import _size from 'lodash/size'
import _sortBy from 'lodash/sortBy'
import _values from 'lodash/values'
import { useEffect, useState } from 'react'

import { useGetTailLogQuery } from '../app/services/api'
import { getYesterdaysTimeRange } from '../app/utils/getTimeRange'
import { LIMIT, timelineToMs } from '../Components/LineChartCard/helper'
import { POLLING_5s } from '../constants/pollingIntervalConstants'

import type { LineChartDataParams } from './hooks.types'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

const useLineChartData = ({
  timeline = '1h',
  end,
  lineType,
  lineTag,
  time,
  skipPolling,
  skipUpdates,
  dataAdapters,
  dataProcessors,
  addYesterdayAggr,
  dateRange,
  fields,
  aggrFields,
  isChartLoading,
  isFieldsCompulsory,
  extraTailLogParams,
  aggrDaily,
}: LineChartDataParams) => {
  const [dataset, setDataset] = useState<unknown[]>([])
  const yesterday = getYesterdaysTimeRange()
  const { start: startRange, end: endRange } = dateRange || {}

  // Ensure timeline has a value (should always be the case with default parameter)
  const safeTimeline: string = timeline || '1h'

  const chartReqParams: UnknownRecord = {
    key: `stat-${safeTimeline}`,
    type: lineType,
    tag: lineTag,
    ...(extraTailLogParams && extraTailLogParams[lineType] ? extraTailLogParams[lineType] : {}),
  }
  if (fields && fields[lineType]) chartReqParams.fields = JSON.stringify(fields[lineType] ?? {})
  if (aggrFields && aggrFields[lineType])
    chartReqParams.aggrFields = JSON.stringify(aggrFields[lineType])
  if (aggrDaily) chartReqParams.aggrDaily = '1'

  const { data: tailLogData, isLoading: isLineLoading } = useGetTailLogQuery(
    {
      ...chartReqParams,
      limit: LIMIT,
      // eslint-disable-next-line no-nested-ternary
      start: dateRange
        ? startRange
        : end
          ? (end as number) - timelineToMs(safeTimeline as string) * LIMIT
          : undefined,
      end: dateRange ? endRange : end,
    },
    {
      skip: !lineTag || !lineType || isChartLoading || (isFieldsCompulsory && !fields?.[lineType]),
    },
  )

  // Realtime updates with long polling
  const { data: tailLogDataUpdates } = useGetTailLogQuery(
    {
      ...chartReqParams,
      limit: 1,
      start: time,
    },
    {
      pollingInterval: (skipPolling ? false : POLLING_5s) as number | undefined,
      skip:
        skipUpdates ||
        !lineTag ||
        !lineType ||
        isChartLoading ||
        (isFieldsCompulsory && !fields?.[lineType]),
    },
  )

  const getTimeRanges = JSON.stringify([{ ...yesterday }])

  const { data: yesterdayAggregate } = useGetTailLogQuery(
    {
      ...chartReqParams,
      key: 'stat-5m',
      aggrTimes: getTimeRanges,
      start: yesterday.start,
      end: yesterday.end,
    },
    {
      skip: !addYesterdayAggr || isChartLoading || (isFieldsCompulsory && !fields?.[lineType]),
    },
  )

  useEffect(() => {
    const processor =
      Array.isArray(dataProcessors) || !dataProcessors
        ? undefined
        : (dataProcessors as Record<string, (data: unknown) => unknown>)
    const data = processor?.[lineType] ? processor[lineType](tailLogData) : tailLogData
    setDataset(() => {
      if (!end) return data as unknown[]
      return _values({
        ..._keyBy(data as unknown[], 'ts'),
        ..._keyBy(data as unknown[], 'ts'),
      }) as unknown[]
    })
  }, [tailLogData, end, lineType])

  useEffect(() => {
    // Skip data update, if taillog data is out of sync while worker buildStats are being done
    if (skipPolling || _size(tailLogDataUpdates as UnknownRecord | unknown[]) > 1) return

    const processor =
      Array.isArray(dataProcessors) || !dataProcessors
        ? undefined
        : (dataProcessors as Record<string, (data: unknown) => unknown>)
    const data = processor?.[lineType]
      ? processor[lineType](tailLogDataUpdates)
      : tailLogDataUpdates
    setDataset(
      (state: unknown) =>
        _values({
          ..._keyBy(state as unknown[], 'ts'),
          ..._keyBy(data as UnknownRecord, 'ts'),
        }) as unknown[],
    )
  }, [tailLogDataUpdates, lineType, skipPolling])

  const adapter =
    Array.isArray(dataAdapters) || !dataAdapters
      ? undefined
      : (dataAdapters as Record<string, (data: unknown, yesterday?: unknown) => unknown>)
  const lineData = adapter?.[lineType]?.(
    _sortBy(_filter(dataset, 'ts'), 'ts'),
    _head(yesterdayAggregate as unknown[]),
  )

  return { lineData, isLineLoading, dataset }
}

export default useLineChartData
