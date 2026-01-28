/**
 * Mock data based on exact documentation responses
 * Used for visual verification of Revenue Summary calculations
 *
 * To enable mocks:
 * 1. Set USE_DOCUMENTATION_MOCKS to true
 * 2. The hook will automatically use mock data instead of API calls
 * 3. The default date range will be set to the documentation period (Nov 2025)
 *
 * Expected values when using mocks:
 * - Total Bitcoin: 0.02368399750609298 BTC
 * - Avg Hash Revenue (SATS): ~134,183,000,000 SATS/PH/s/day (1,341.83 BTC per PH/s per day)
 * - Avg Energy Revenue (SATS): ~23.28 SATS/MWh
 * - Avg Hashrate: 1.525 PH/s
 * - Avg Power Consumption: 141.301 KW (site_power_w / aggrIntervals = 1,261,539,418.3259432 / 8,928 = 141,301.458146 W)
 */

import type {
  HashrateAggregateResponse,
  MinerHistoricalPriceResponse,
  MinerTransactionResponse,
} from '@/types'

// Flag to enable/disable mocks - set to true to use mock data
export const USE_DOCUMENTATION_MOCKS = false

// Transactions API Response
// API: /auth/ext-data?type=minerpool&query={"start":1761955200000,"end":1764460800000,"key":"transactions"}
export const mockTransactionsDataFromDoc: MinerTransactionResponse = {
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

// Range Aggregation API Response
// API: /auth/tail-log/range-aggr?keys=[...]
// Note: Using type assertion because aggregated response structure differs from type definition
export const mockTailLogRangeAggrDataFromDoc = {
  data: [
    [
      {
        type: 'miner',
        data: {
          hashrate_mhs_5m_avg_aggr: 27803862.826273315,
          hashrate_mhs_5m_sum_aggr: 13617098532771.879,
          nominal_hashrate_mhs_avg_aggr: 163114850.4273514,
          nominal_efficiency_w_ths_avg_aggr: 16.029700854700653,
          hashrate_mhs_1m_avg_aggr: 27803862.826273315,
          efficiency_w_ths_avg_aggr: 15.07553240740718,
          hashrate_mhs_1m_sum_aggr: 13617098532771.879,
          hashrate_mhs_1m_cnt_aggr: 339264,
          hashrate_mhs_1m_cnt_active_aggr: 214272,
          offline_or_sleeping_miners_amount_aggr: 53568,
          online_or_minor_error_miners_amount_aggr: 214272,
          error_miners_amount_aggr: 124992,
          pools_accepted_shares_total_aggr: 49067916,
          pools_rejected_shares_total_aggr: 14289636,
          pools_stale_shares_total_aggr: 4348308,
          aggrCount: 53568,
          aggrIntervals: 8928,
        },
        error: null,
      },
      {
        type: 'powermeter',
        data: {
          // Correct value: site_power_w is in W
          // Avg Power Consumption = site_power_w / aggrIntervals = 1,261,539,418.3259432 / 8,928 = 141,301.458146 W = 141.301 KW
          site_power_w: 1261539418.3259432,
          aggrCount: 44640,
          aggrIntervals: 8928,
        },
        error: null,
      },
    ],
  ],
  success: true,
} as unknown as HashrateAggregateResponse

// Historical Prices API Response
// API: /auth/ext-data?type=mempool&key=HISTORICAL_PRICES&start=1761955200000&end=1764460800000
export const mockHistoricalPricesDataFromDoc: MinerHistoricalPriceResponse = {
  data: [
    [
      { ts: 1761955200000, priceUSD: 109529 },
      { ts: 1762041600000, priceUSD: 110033 },
      { ts: 1762128000000, priceUSD: 109959 },
      { ts: 1762214400000, priceUSD: 106422 },
      { ts: 1762300800000, priceUSD: 101260 },
      { ts: 1762387200000, priceUSD: 103709 },
      { ts: 1762473600000, priceUSD: 101383 },
      { ts: 1762560000000, priceUSD: 103620 },
      { ts: 1762646400000, priceUSD: 102355 },
      { ts: 1762732800000, priceUSD: 104699 },
      { ts: 1762819200000, priceUSD: 106051 },
      { ts: 1762905600000, priceUSD: 102960 },
      { ts: 1762992000000, priceUSD: 101969 },
      { ts: 1763078400000, priceUSD: 99751 },
      { ts: 1763164800000, priceUSD: 95100 },
      { ts: 1763251200000, priceUSD: 95551 },
      { ts: 1763337600000, priceUSD: 94110 },
      { ts: 1763424000000, priceUSD: 92149 },
      { ts: 1763510400000, priceUSD: 93100 },
      { ts: 1763596800000, priceUSD: 90424 },
      { ts: 1763683200000, priceUSD: 87975 },
      { ts: 1763769600000, priceUSD: 84278 },
      { ts: 1763856000000, priceUSD: 85029 },
      { ts: 1763942400000, priceUSD: 87967 },
      { ts: 1764028800000, priceUSD: 88653 },
      { ts: 1764115200000, priceUSD: 87622 },
      { ts: 1764201600000, priceUSD: 90365 },
      { ts: 1764288000000, priceUSD: 91336 },
      { ts: 1764374400000, priceUSD: 91049 },
      { ts: 1764460800000, priceUSD: 90768 },
    ],
  ],
  success: true,
}

// Global Config API Response
// API: /auth/global-config?
export const mockGlobalConfigFromDoc = {
  aggrTailLogTimezones: [
    {
      code: 'UTC',
      offset: 0,
    },
  ],
  nominalSiteHashrate_MHS: 709032000000,
  nominalSiteMinerCapacity: 4232,
  nominalSiteWeightedAvgEfficiency: 28.36,
  nominalPowerAvailability_MW: 22.5, // Note: code expects _MW suffix, not MWh
  siteEnergyDataThresholdMWh: 0.05,
  consumptionLevels: {
    low: 50000,
    medium: 22450000,
    high: 22470000,
    critical: 22490000,
  },
  transformerThresholds: {
    medium: 1300000,
    high: 1400000,
  },
  isAutoSleepAllowed: false,
}

// Mock site data
export const mockSiteDataFromDoc = {
  site: 'haven7346',
}

// Mock mempool data (current BTC price)
export const mockMempoolDataFromDoc = {
  data: [
    [
      {
        currentPrice: 90768, // Last price from historical prices
      },
    ],
  ],
  success: true,
}

// Mock production costs (empty for now)
export const mockProductionCostsFromDoc: Array<{
  year: number
  month: number
  energyCostsUSD?: number
  operationalCostsUSD?: number
}> = []

// Mock electricity data (empty for now - not needed for basic calculations)
export const mockElectricityDataFromDoc: Array<
  Array<{ ts: number; energy?: { usedEnergy?: number; availableEnergy?: number } }>
> = []

// Mock block sizes data (empty for now)
export const mockBlockSizesDataFromDoc = {
  data: [[]],
  success: true,
}
