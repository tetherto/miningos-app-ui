import { getPools } from './PoolManagerPools.utils'

describe('PoolManagerPools Utils', () => {
  describe('getPools', () => {
    it('it should parse the data correctly', () => {
      const poolResponseData = [
        [
          {
            rackId: 'miner-am-s19xp_h-shelf-1',
            requestValue: [
              {
                url: 'stratum+tcp://btc-asia.ocean.com:3000',
                worker_name: 'test',
                worker_password: 'XXX',
                pool: 'Ocean',
              },
              {
                url: 'stratum+tcp://btc-asia.ocean.com:3001',
                worker_name: 'test',
                worker_password: 'XXX',
                pool: 'Ocean',
              },
            ],
          },
          {
            rackId: 'miner-am-s19xp-shelf-0',
            requestValue: [
              {
                url: 'stratum+tcp://btc-asia.ocean.com:3000',
                worker_name: 'test',
                worker_password: 'XXX',
                pool: 'Ocean',
              },
              {
                url: 'stratum+tcp://btc-asia.ocean.com:3001',
                worker_name: 'test',
                worker_password: 'XXX',
                pool: 'Ocean',
              },
            ],
          },
          {
            rackId: 'miner-av-a1346-shelf-0',
            requestValue: [
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1313',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
            ],
          },
          {
            rackId: 'miner-wm-m30sp-shelf-1',
            requestValue: [
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1313',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1315',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1316',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
            ],
          },
          {
            rackId: 'miner-wm-m53s-shelf-3',
            requestValue: [
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1313',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1315',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1316',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
            ],
          },
          {
            rackId: 'miner-wm-m56s-shelf-0',
            requestValue: [
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1313',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1315',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
              {
                url: 'stratum+tcp://btc-asia.f2pool.com:1316',
                worker_name: 'haven7346',
                worker_password: 'XXX',
                pool: 'F2Pool',
              },
            ],
          },
        ],
      ]

      const tailLogResponseData: Array<Array<Array<Record<string, unknown>>>> = [
        [
          [],
          [
            {
              hashrate_mhs_5m_active_container_group_cnt: {
                'bitdeer-5a': 3,
                'bitdeer-5b': 2,
                'bitdeer-1a': 1,
              },
              ts: 1764654900000,
              aggrTsRange: '',
              aggrCount: 1,
              aggrIntervals: 1,
            },
          ],
          [
            {
              hashrate_mhs_5m_active_container_group_cnt: {
                'microbt-2': 3,
                'microbt-1': 2,
              },
              ts: 1764654900000,
              aggrTsRange: '',
              aggrCount: 1,
              aggrIntervals: 1,
            },
          ],
          [
            {
              hashrate_mhs_5m_active_container_group_cnt: {
                'bitdeer-10b': 3,
                'bitdeer-10a': 3,
                'emca-1': 1,
              },
              ts: 1764654900000,
              aggrTsRange: '',
              aggrCount: 1,
              aggrIntervals: 1,
            },
          ],
          [],
          [
            {
              hashrate_mhs_5m_active_container_group_cnt: {},
              ts: 1764654900000,
              aggrTsRange: '',
              aggrCount: 1,
              aggrIntervals: 1,
            },
          ],
          [
            {
              hashrate_mhs_5m_active_container_group_cnt: {},
              ts: 1764654900000,
              aggrTsRange: '',
              aggrCount: 1,
              aggrIntervals: 1,
            },
          ],
          [
            {
              hashrate_mhs_5m_active_container_group_cnt: {},
              ts: 1764654900000,
              aggrTsRange: '',
              aggrCount: 1,
              aggrIntervals: 1,
            },
          ],
          [],
          [],
        ],
      ]

      const pools = getPools(poolResponseData, tailLogResponseData)

      expect(pools).toStrictEqual([
        {
          name: 'Ocean',
          description: '',
          units: 0,
          miners: 0,
          endpoints: [
            {
              role: 'PRIMARY',
              host: 'btc-asia.ocean.com',
              port: '3000',
            },
            {
              role: 'FAILOVER_1',
              host: 'btc-asia.ocean.com',
              port: '3001',
            },
          ],
        },
        {
          name: 'F2Pool',
          description: '',
          units: 8,
          miners: 18,
          endpoints: [
            {
              role: 'PRIMARY',
              host: 'btc-asia.f2pool.com',
              port: '1313',
            },
            {
              role: 'FAILOVER_1',
              host: 'btc-asia.f2pool.com',
              port: '1315',
            },
            {
              role: 'FAILOVER_2',
              host: 'btc-asia.f2pool.com',
              port: '1316',
            },
          ],
        },
      ])
    })
  })
})
