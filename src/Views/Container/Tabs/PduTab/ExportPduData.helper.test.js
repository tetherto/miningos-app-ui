import { getMinersFormattedJson } from './ExportPduData.helper'

const connectedMiners = [
  {
    id: 1,
    last: {
      snap: {
        stats: {
          hashrate_mhs: {
            t_5m: 100000000,
          },
          power_w: 500,
          temperature_c: 40,
          uptime_ms: 3600000,
          status: 'mining',
        },
        config: {
          pool_config: [
            {
              username: 'pool.worker',
            },
          ],
          firmware_ver: '1.0.0',
          power_mode: 'high',
        },
      },
      alerts: ['alert1', 'alert2'],
    },
    info: {
      site: 'site1',
      container: 'container1',
      pos: 'position1',
      serialNum: '123456',
      macAddress: '00:00:00:00:00:00',
    },
    address: '192.168.0.1',
    type: 'miner_type',
  },
]

describe('getMinersFormattedJson', () => {
  it('returns formatted JSON for connected miners', () => {
    const formattedMiners = getMinersFormattedJson(connectedMiners)

    expect(formattedMiners).toEqual([
      {
        id: 1,
        type: 'miner_type',
        site: 'site1',
        container: 'container1',
        position: 'position1',
        serialNumber: '123456',
        macAddress: '00:00:00:00:00:00',
        ipAddress: '192.168.0.1',
        firmwareVersion: '1.0.0',
        status: 'mining',
        powerMode: 'high',
        hashrateMhs: 100000000,
        efficiencyWThs: 5,
        powerW: 500,
        temperatureC: 40,
        workerName: 'worker',
        activePool: 'pool',
        alerts: ['alert1', 'alert2'],
        uptimeMs: 3600000,
      },
    ])
  })
})
