import _divide from 'lodash/divide'
import _forEach from 'lodash/forEach'
import _head from 'lodash/head'
import _last from 'lodash/last'
import _size from 'lodash/size'

import type { HashRateDataPoint, HashRateLogEntry } from './HashRateLineChart.types'

import { getHashrateString, getHashrateUnit } from '@/app/utils/deviceUtils'
import { getTimeRange } from '@/app/utils/getTimeRange'
import { WEBAPP_DISPLAY_NAME } from '@/constants'
import { CHART_COLORS } from '@/constants/colors'

export const getHashRateGraphData = (
  data: HashRateLogEntry[],
  realtimeHashrateData?: HashRateLogEntry,
) => {
  let totalAvgHashrate = 0
  let minHashrate = Number.MAX_SAFE_INTEGER
  let maxHashrate = Number.MIN_SAFE_INTEGER

  const actualData: HashRateDataPoint[] = []
  _forEach(data, (entry: HashRateLogEntry) => {
    const x = entry.ts as number
    const sumY = entry.hashrate_mhs_1m_sum_aggr || 0

    actualData.push({ x, y: sumY })
    const sumHashrate = entry.hashrate_mhs_1m_sum_aggr || 0

    totalAvgHashrate += sumHashrate

    if (sumHashrate < minHashrate) {
      minHashrate = sumHashrate
    }

    if (sumHashrate > maxHashrate) {
      maxHashrate = sumHashrate
    }
  })

  const minMaxAvg = {
    min: getHashrateString(minHashrate),
    max: getHashrateString(maxHashrate),
    avg: getHashrateString(_divide(totalAvgHashrate, _size(data) || 1)),
  }

  const timeRange = getTimeRange(_last(data)?.ts ?? 0, _head(data)?.ts ?? 0)

  const currentValue =
    realtimeHashrateData?.hashrate_mhs_1m_sum_aggr ?? _last(data)?.hashrate_mhs_1m_sum_aggr ?? 0

  return {
    yTicksFormatter: (value: number) => getHashrateString(value),
    currentValueLabel: getHashrateUnit(currentValue),
    minMaxAvg,
    timeRange,
    datasets: [
      {
        type: 'line',
        label: `${WEBAPP_DISPLAY_NAME} Hash Rate`,
        data: actualData,
        borderColor: CHART_COLORS.SKY_BLUE,
        pointRadius: 1,
      },
    ],
  }
}
