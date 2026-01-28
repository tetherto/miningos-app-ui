import _map from 'lodash/map'

import { getPoolAndWorkerNameFromUsername, megaToTera } from '@/app/utils/deviceUtils'
import type { Device, UnknownRecord } from '@/app/utils/deviceUtils/types'
import { collectionToCSV, downloadFileFromData } from '@/app/utils/downloadUtils'

export const downloadJson = (miners: UnknownRecord[]) => {
  downloadFileFromData(
    { dateExported: new Date(), miners },
    'application/json',
    `container_miners_stats_${new Date()}.json`,
  )
}

export const downloadCsv = (miners: UnknownRecord[]) => {
  const csv = collectionToCSV(miners)

  downloadFileFromData(csv, 'text/csv', `container_miners_stats_${new Date()}.csv`)
}

export const getMinersFormattedJson = (connectedMiners: Device[]) =>
  _map(connectedMiners, (miner) => {
    const snap = miner?.last?.snap
    const stats = snap?.stats
    const info = miner?.info
    const hashRate = (stats?.hashrate_mhs as UnknownRecord | undefined)?.t_5m as number | undefined
    const config = snap?.config

    const poolNames = getPoolAndWorkerNameFromUsername(
      (((config?.pool_config as UnknownRecord[] | undefined)?.[0] as UnknownRecord | undefined)
        ?.username as string | undefined) ?? '',
    )
    const getEfficiencyValue = () => {
      const powerW = stats?.power_w as number | undefined
      if (!powerW || !hashRate || hashRate <= 0) return ''
      const value = powerW / megaToTera(hashRate)
      return value
    }
    return {
      id: miner?.id,
      type: miner?.type,
      site: info?.site,
      container: info?.container,
      position: info?.pos,
      serialNumber: info?.serialNum,
      macAddress: info?.macAddress,
      ipAddress: miner?.address,
      firmwareVersion: config?.firmware_ver,
      status: stats?.status,
      powerMode: config?.power_mode,
      hashrateMhs: hashRate,
      efficiencyWThs: getEfficiencyValue(),
      powerW: stats?.power_w,
      temperatureC: stats?.temperature_c,
      workerName: poolNames.workerName,
      activePool: poolNames?.poolName,
      alerts: miner?.last?.alerts,
      uptimeMs: stats?.uptime_ms,
    }
  })
