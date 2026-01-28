import type {
  HashrateAggregateResponse,
  MinerHistoricalPriceResponse,
  MinerTransactionResponse,
} from '@/types'

/**
 * Mock tail log range aggregation data (hashrate and power)
 * Structure matches HashrateAggregateResponse: ApiResponse<HashrateAggregateData[][]>
 */
export const mockTailLogRangeAggrData: HashrateAggregateResponse = {
  data: [
    [
      {
        type: 'miner',
        data: [
          {
            ts: 1755734400000, // 2025-09-01
            val: {
              hashrate_mhs_5m_sum_aggr: 50000000000000, // 50 PH/s
            },
          },
          {
            ts: 1755820800000, // 2025-09-02
            val: {
              hashrate_mhs_5m_sum_aggr: 50000000000000, // 50 PH/s
            },
          },
          {
            ts: 1755907200000, // 2025-09-03
            val: {
              hashrate_mhs_5m_sum_aggr: 50000000000000, // 50 PH/s
            },
          },
        ],
      },
      {
        type: 'powermeter',
        data: [
          {
            ts: 1755734400000, // 2025-09-01
            val: {
              site_power_w: 10000000, // 10 MW
            },
          },
          {
            ts: 1755820800000, // 2025-09-02
            val: {
              site_power_w: 10000000, // 10 MW
            },
          },
          {
            ts: 1755907200000, // 2025-09-03
            val: {
              site_power_w: 10000000, // 10 MW
            },
          },
        ],
      },
    ],
  ],
  success: true,
}

/**
 * Mock transactions data
 * Structure matches MinerTransactionResponse: ApiResponse<MinerTransaction[][]>
 */
export const mockTransactionsData: MinerTransactionResponse = {
  data: [
    [
      {
        ts: '1755734400000', // 2025-09-01
        blocksData: {},
        stats: [],
        transactions: [
          {
            id: 1,
            username: 'test_user',
            type: 'mining',
            changed_balance: 0.00005, // ~$2.5 at $50k/BTC
            created_at: 1755734400000,
            satoshis_net_earned: 5000,
            fees_colected_satoshis: 50,
            mining_extra: {
              mining_date: 1755734400000,
              settle_date: 1755734400000,
              pps: 0.00005,
              pps_fee_rate: 0.01,
              tx_fee: 0.0000005,
              tx_fee_rate: 0.02,
              hash_rate: 50000000000000, // 50 PH/s
            },
            payout_extra: null,
          },
        ],
        workers: [],
        workersCount: 0,
      },
      {
        ts: '1755820800000', // 2025-09-02
        blocksData: {},
        stats: [],
        transactions: [
          {
            id: 2,
            username: 'test_user',
            type: 'mining',
            changed_balance: 0.00006, // ~$3.06 at $51k/BTC
            created_at: 1755820800000,
            satoshis_net_earned: 6000,
            fees_colected_satoshis: 60,
            mining_extra: {
              mining_date: 1755820800000,
              settle_date: 1755820800000,
              pps: 0.00006,
              pps_fee_rate: 0.01,
              tx_fee: 0.0000006,
              tx_fee_rate: 0.02,
              hash_rate: 50000000000000,
            },
            payout_extra: null,
          },
        ],
        workers: [],
        workersCount: 0,
      },
      {
        ts: '1755907200000', // 2025-09-03
        blocksData: {},
        stats: [],
        transactions: [
          {
            id: 3,
            username: 'test_user',
            type: 'mining',
            changed_balance: 0.000055, // ~$2.86 at $52k/BTC
            created_at: 1755907200000,
            satoshis_net_earned: 5500,
            fees_colected_satoshis: 55,
            mining_extra: {
              mining_date: 1755907200000,
              settle_date: 1755907200000,
              pps: 0.000055,
              pps_fee_rate: 0.01,
              tx_fee: 0.00000055,
              tx_fee_rate: 0.02,
              hash_rate: 50000000000000,
            },
            payout_extra: null,
          },
        ],
        workers: [],
        workersCount: 0,
      },
    ],
  ],
  success: true,
}

/**
 * Mock historical prices data
 * Structure matches MinerHistoricalPriceResponse: ApiResponse<MinerHistoricalPrice[][]>
 */
export const mockHistoricalPricesData: MinerHistoricalPriceResponse = {
  data: [
    [
      {
        ts: 1755734400000, // 2025-09-01
        priceUSD: 50000,
      },
      {
        ts: 1755820800000, // 2025-09-02
        priceUSD: 51000,
      },
      {
        ts: 1755907200000, // 2025-09-03
        priceUSD: 52000,
      },
    ],
  ],
  success: true,
}

/**
 * Mock transactions data from BE team example
 * Endpoint: /auth/ext-data?type=minerpool&query={"start":1761955200000,"end":1764460800000,"key":"transactions"}
 * Expected Total Bitcoin: 0.02368399750609298 BTC (30 transactions × 0.0007894665835364325 BTC)
 */
export const mockTransactionsDataFromBE: MinerTransactionResponse = {
  data: [
    [
      {
        ts: '1761955200000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786753,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1761955200,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1761955200,
              settle_date: 1761955200,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762041600000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786754,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762041600,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762041600,
              settle_date: 1762041600,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762128000000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786755,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762128000,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762128000,
              settle_date: 1762128000,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762214400000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786756,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762214400,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762214400,
              settle_date: 1762214400,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762300800000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786757,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762300800,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762300800,
              settle_date: 1762300800,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762387200000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786758,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762387200,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762387200,
              settle_date: 1762387200,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762473600000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786759,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762473600,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762473600,
              settle_date: 1762473600,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762560000000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786760,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762560000,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762560000,
              settle_date: 1762560000,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762646400000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786761,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762646400,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762646400,
              settle_date: 1762646400,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762732800000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786762,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762732800,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762732800,
              settle_date: 1762732800,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762819200000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786763,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762819200,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762819200,
              settle_date: 1762819200,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762905600000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786764,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762905600,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762905600,
              settle_date: 1762905600,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1762992000000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786765,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1762992000,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1762992000,
              settle_date: 1762992000,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763078400000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786766,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763078400,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763078400,
              settle_date: 1763078400,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763164800000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786767,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763164800,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763164800,
              settle_date: 1763164800,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763251200000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786768,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763251200,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763251200,
              settle_date: 1763251200,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763337600000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786769,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763337600,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763337600,
              settle_date: 1763337600,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763424000000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786770,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763424000,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763424000,
              settle_date: 1763424000,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763510400000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786771,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763510400,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763510400,
              settle_date: 1763510400,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763596800000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786772,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763596800,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763596800,
              settle_date: 1763596800,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763683200000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786773,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763683200,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763683200,
              settle_date: 1763683200,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763769600000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786774,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763769600,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763769600,
              settle_date: 1763769600,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763856000000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786775,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763856000,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763856000,
              settle_date: 1763856000,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1763942400000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786776,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1763942400,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1763942400,
              settle_date: 1763942400,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1764028800000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786777,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1764028800,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1764028800,
              settle_date: 1764028800,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1764115200000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786778,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1764115200,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1764115200,
              settle_date: 1764115200,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1764201600000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786779,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1764201600,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1764201600,
              settle_date: 1764201600,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1764288000000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786780,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1764288000,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1764288000,
              settle_date: 1764288000,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1764374400000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786781,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1764374400,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1764374400,
              settle_date: 1764374400,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
      {
        ts: '1764460800000',
        stats: [],
        workers: [],
        transactions: [
          {
            username: 'haven7346',
            id: 564786782,
            type: 'revenue_fpps',
            changed_balance: 0.0007894665835364325,
            created_at: 1764460800,
            satoshis_net_earned: 0,
            fees_colected_satoshis: 0,
            mining_extra: {
              mining_date: 1764460800,
              settle_date: 1764460800,
              pps: 0.00022023072856632505,
              pps_fee_rate: 0.00529159783006455,
              tx_fee: 0.000007680034141740668,
              tx_fee_rate: 0.008237007837796056,
              hash_rate: 611539599417678,
            },
            payout_extra: null,
          },
        ],
        blocksData: {},
        workersCount: 0,
      },
    ],
  ],
  success: true,
}
