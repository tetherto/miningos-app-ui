import _head from 'lodash/head'
import _isNumber from 'lodash/isNumber'
import _reduce from 'lodash/reduce'

import { useGetListThingsQuery } from '../app/services/api'
import { isTransformerPowermeter } from '../app/utils/deviceUtils'
import type { UnknownRecord } from '../app/utils/deviceUtils/types'
import { POLLING_5s } from '../constants/pollingIntervalConstants'

import { useSmartPolling } from './useSmartPolling'

interface UseTotalTransformerPMConsumptionParams {
  skip?: boolean
}

interface Device {
  type?: string
  info?: {
    pos?: string
  }
  last?: {
    snap?: {
      stats?: {
        power_w?: number
      }
    }
  }
}

export const useTotalTransformerPMConsumption = ({
  skip,
}: UseTotalTransformerPMConsumptionParams) => {
  const smartPolling5s = useSmartPolling(POLLING_5s)
  const { data: cabinetDevices, isLoading: isCabinetDevicesLoading } = useGetListThingsQuery(
    {
      query: JSON.stringify({
        $and: [{ tags: { $in: ['t-powermeter'] } }, { 'info.pos': { $regex: 'tr' } }],
      }),
      status: 1,
      limit: 200,
      sort: JSON.stringify({ 'info.pos': 1 }),
      fields: JSON.stringify({
        'last.snap.stats.power_w': 1,
        info: 1,
        type: 1,
      }),
    },
    {
      pollingInterval: smartPolling5s,
      skip,
    },
  )

  const devices = _head(cabinetDevices as unknown[][]) as Device[] | undefined
  const totalPowerConsumptionW = _reduce(
    devices,
    (prev, device) => {
      const deviceRecord = device as UnknownRecord
      const isTransformerPM = isTransformerPowermeter(
        (deviceRecord?.type as string) || '',
        ((deviceRecord?.info as UnknownRecord)?.pos as string) || '',
      )
      const devicePower = ((deviceRecord?.last as UnknownRecord)?.snap as UnknownRecord)
        ?.stats as UnknownRecord
      const powerW = devicePower?.power_w
      if (!isTransformerPM || !powerW || !_isNumber(powerW)) return prev
      return (prev as number) + (powerW as number)
    },
    0,
  )

  return { totalPowerConsumptionW, isPowerConsumptionLoading: isCabinetDevicesLoading }
}
