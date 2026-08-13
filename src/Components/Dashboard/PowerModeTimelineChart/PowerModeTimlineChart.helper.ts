import { getTimezoneOffset } from 'date-fns-tz'
import _flatten from 'lodash/flatten'
import _isUndefined from 'lodash/isUndefined'
import _keys from 'lodash/keys'
import _reduce from 'lodash/reduce'
import _values from 'lodash/values'

import { MinerStatusColors, PowerModeColors } from '@/Theme/GlobalColors'

interface PowerModeTimelineEntry {
  ts?: number
  power_mode_group_aggr?: Record<string, string>
  status_group_aggr?: Record<string, string>
  [key: string]: unknown
}

interface MinerPowerModeTimeline {
  ts?: number
  miner?: string
  powerMode?: string
  data?: {
    from?: number
    to?: number
  }
}

export const getCombinedPowerModeTimelineByMiner = (
  data: PowerModeTimelineEntry[],
): Record<string, MinerPowerModeTimeline[]> =>
  _reduce(
    data,
    (acc: Record<string, MinerPowerModeTimeline[]>, entry: PowerModeTimelineEntry) => {
      const { ts, power_mode_group_aggr, status_group_aggr } = entry || {}

      const statusGroup = status_group_aggr as Record<string, string> | undefined
      const powerModeGroup = power_mode_group_aggr as Record<string, string> | undefined

      if (statusGroup) {
        for (const miner in statusGroup) {
          if (!acc[miner]) {
            acc[miner] = []
          }
          const powerMode = powerModeGroup?.[miner] || statusGroup[miner]
          const lastIndex = acc[miner].length - 1
          const lastEntry = acc[miner][lastIndex]

          if (lastEntry && lastEntry.powerMode === powerMode && lastEntry?.data?.to) {
            if (lastEntry.data) {
              lastEntry.data.to = ts
            }
          } else {
            acc[miner].push({
              ts,
              miner,
              powerMode,
              data: { from: ts, to: ts },
            })
          }
        }
      }

      return acc
    },
    {} as Record<string, MinerPowerModeTimeline[]>,
  )

const getTimezoneTs = (x: number | undefined, timezone: string): number => {
  if (_isUndefined(x)) return 0
  const offSet = getTimezoneOffset(timezone)

  return x + offSet
}

export const getPowerModeTimelineDatasetObject = (
  cominedPowerModeTimelineByMiner: Record<string, MinerPowerModeTimeline[]>,
  timezone: string,
) =>
  _reduce(
    _flatten(_values(cominedPowerModeTimelineByMiner)),
    (
      acc: Record<
        string,
        {
          label: string
          data: Array<{ x: [number, number]; y: string | undefined }>
          borderColor: string[]
          backgroundColor: string[]
        }
      >,
      minerPowerModeTimeline: MinerPowerModeTimeline,
    ) => {
      const powerMode = minerPowerModeTimeline.powerMode || ''
      if (!acc[powerMode]) {
        acc[powerMode] = {
          label: powerMode,
          data: [],
          borderColor: [],
          backgroundColor: [],
        }
      }
      acc[powerMode].data.push({
        x: [
          getTimezoneTs(minerPowerModeTimeline.data?.from, timezone),
          getTimezoneTs(minerPowerModeTimeline.data?.to, timezone),
        ],
        y: minerPowerModeTimeline.miner,
      })
      const color =
        PowerModeColors[powerMode as keyof typeof PowerModeColors] ||
        MinerStatusColors[powerMode as keyof typeof MinerStatusColors] ||
        ''
      acc[powerMode].borderColor.push(color)
      acc[powerMode].backgroundColor.push(color)
      return acc
    },
    {} as Record<
      string,
      {
        label: string
        data: Array<{ x: [number, number]; y: string | undefined }>
        borderColor: string[]
        backgroundColor: string[]
      }
    >,
  )

export const getPowerModeTimelineChartData = (
  data: PowerModeTimelineEntry[] | undefined,
  timezone: string,
) => {
  if (!data) {
    return {
      labels: [],
      datasets: [],
    }
  }
  const cominedPowerModeTimelineByMiner = getCombinedPowerModeTimelineByMiner(data)
  const powerModeTimelineDatasetObject = getPowerModeTimelineDatasetObject(
    cominedPowerModeTimelineByMiner,
    timezone,
  )
  return {
    labels: _keys(cominedPowerModeTimelineByMiner),
    datasets: _values(powerModeTimelineDatasetObject),
  }
}
