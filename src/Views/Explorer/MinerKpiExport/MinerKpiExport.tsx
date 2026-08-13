import _isArray from 'lodash/isArray'
import _map from 'lodash/map'

import { useLazyGetListThingsQuery } from '@/app/services/api'
import { isDemoMode } from '@/app/services/api.utils'
import { GetListThingsFunction, recursiveListThingsApiCall } from '@/app/utils/apiCallUtils'
import { getMinerShortCode, getPoolAndWorkerNameFromUsername } from '@/app/utils/deviceUtils'
import { collectionToCSV, downloadFileFromData } from '@/app/utils/downloadUtils'
import { notifyError } from '@/app/utils/NotificationService'
import { getByTagsQuery } from '@/app/utils/queryUtils'
import { StatsExport } from '@/Components/StatsExport/StatsExport'
import { Miner } from '@/types'

export const MinerKpiExport = () => {
  const [getListThings] = useLazyGetListThingsQuery()

  const onExportClicked = async (isCsv: boolean) => {
    const data = await recursiveListThingsApiCall(
      getListThings as GetListThingsFunction<never>,
      100,
      0,
      [],
      {
        status: 1,
        query: getByTagsQuery(['t-miner']),
        fields: JSON.stringify({
          id: 1,
          tags: 1,
          info: 1,
          type: 1,
          'opts.address': 1,
          'last.snap.config.pool_config': 1,
          'last.snap.stats.status': 1,
          'last.snap.config.power_mode': 1,
          'last.snap.config.network_config.ip_address': 1,
          'last.snap.stats.hashrate_mhs.t_5m': 1,
          'last.snap.stats.power_w': 1,
          'last.snap.stats.temperature_c': 1,
          'last.alerts': 1,
          'last.snap.stats.uptime_ms': 1,
        }),
      },
    )
    const miners = _map(data, (miner: Miner) => {
      const poolConfig = miner?.last?.snap?.config?.pool_config
      const poolNames = getPoolAndWorkerNameFromUsername(
        _isArray(poolConfig) ? poolConfig[0]?.username : undefined,
      )

      return {
        id: miner?.id,
        status: miner?.last?.snap?.stats?.status,
        powerMode: miner?.last?.snap?.config?.power_mode,
        site: miner?.info?.site,
        container: miner?.info?.container,
        position: miner?.info?.pos,
        shortCode: getMinerShortCode(miner?.code, miner?.tags),
        hashrateMhs: (miner?.last?.snap?.stats?.hashrate_mhs as { t_5m?: number })?.t_5m,
        powerW: miner?.last?.snap?.stats?.power_w,
        workerName: poolNames.workerName,
        activePool: poolNames?.poolName,
        serialNumber: miner?.info?.serialNum,
        macAddress: miner?.info?.macAddress,
        type: miner?.type,
        temperatureC: miner?.last?.snap?.stats?.temperature_c,
        alerts: miner?.last?.alerts,
        uptimeMs: miner?.last?.snap?.stats?.uptime_ms,
        ip: miner?.address,
      }
    })

    if (miners.length <= 0) {
      notifyError('Error occurred while downloading', 'Miners not found')
      return
    }

    if (isCsv) {
      const csv = collectionToCSV(miners)

      downloadFileFromData(csv, 'text/csv', `realtime_miners_stats_${new Date()}.csv`)
      return Promise.resolve()
    }

    downloadFileFromData(
      { dateExported: new Date(), miners },
      'application/json',
      `realtime_miners_stats_${new Date()}.json`,
    )
    return Promise.resolve()
  }

  return (
    <StatsExport
      disabled={isDemoMode}
      onCsvExport={() => onExportClicked(true)}
      onJsonExport={() => onExportClicked(false)}
    />
  )
}
