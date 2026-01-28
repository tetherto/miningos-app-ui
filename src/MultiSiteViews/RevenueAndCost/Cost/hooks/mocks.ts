/**
 * Mocks for Avg All-in Power Cost chart data
 * These mocks simulate API responses for testing and development
 * Data covers all 12 months of 2024 for comprehensive testing
 */

// Helper to get first day of month timestamp for 2024
const getMonthStart = (month: number) => new Date(2024, month - 1, 1).getTime()

// Mock transactions data (minerpool) - data for all 12 months
export const mockTransactionsData = [
  [
    // January 2024
    {
      ts: String(getMonthStart(1)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786701,
          type: 'revenue_fpps',
          changed_balance: 0.12, // Increased from 0.0012 (~100x increase)
          created_at: getMonthStart(1) / 1000,
          mining_extra: {
            mining_date: getMonthStart(1) / 1000,
            settle_date: getMonthStart(1) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // February 2024
    {
      ts: String(getMonthStart(2)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786702,
          type: 'revenue_fpps',
          changed_balance: 0.11, // Increased from 0.0011 (~100x increase)
          created_at: getMonthStart(2) / 1000,
          mining_extra: {
            mining_date: getMonthStart(2) / 1000,
            settle_date: getMonthStart(2) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // March 2024
    {
      ts: String(getMonthStart(3)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786703,
          type: 'revenue_fpps',
          changed_balance: 0.13, // Increased from 0.0013 (~100x increase)
          created_at: getMonthStart(3) / 1000,
          mining_extra: {
            mining_date: getMonthStart(3) / 1000,
            settle_date: getMonthStart(3) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // April 2024
    {
      ts: String(getMonthStart(4)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786704,
          type: 'revenue_fpps',
          changed_balance: 0.15, // Increased from 0.0018094665835364325 (~83x increase)
          created_at: getMonthStart(4) / 1000,
          mining_extra: {
            mining_date: getMonthStart(4) / 1000,
            settle_date: getMonthStart(4) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00002768003414174067,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // May 2024
    {
      ts: String(getMonthStart(5)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786705,
          type: 'revenue_fpps',
          changed_balance: 0.14, // Increased from 0.0014 (~100x increase)
          created_at: getMonthStart(5) / 1000,
          mining_extra: {
            mining_date: getMonthStart(5) / 1000,
            settle_date: getMonthStart(5) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // June 2024
    {
      ts: String(getMonthStart(6)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786706,
          type: 'revenue_fpps',
          changed_balance: 0.18, // Increased from 0.0015 (~120x increase)
          created_at: getMonthStart(6) / 1000,
          mining_extra: {
            mining_date: getMonthStart(6) / 1000,
            settle_date: getMonthStart(6) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00003,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // July 2024
    {
      ts: String(getMonthStart(7)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786707,
          type: 'revenue_fpps',
          changed_balance: 0.16, // Increased from 0.0016 (~100x increase)
          created_at: getMonthStart(7) / 1000,
          mining_extra: {
            mining_date: getMonthStart(7) / 1000,
            settle_date: getMonthStart(7) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // August 2024
    {
      ts: String(getMonthStart(8)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786708,
          type: 'revenue_fpps',
          changed_balance: 0.17, // Increased from 0.0017 (~100x increase)
          created_at: getMonthStart(8) / 1000,
          mining_extra: {
            mining_date: getMonthStart(8) / 1000,
            settle_date: getMonthStart(8) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // September 2024
    {
      ts: String(getMonthStart(9)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786709,
          type: 'revenue_fpps',
          changed_balance: 0.19, // Increased from 0.0018 (~105x increase)
          created_at: getMonthStart(9) / 1000,
          mining_extra: {
            mining_date: getMonthStart(9) / 1000,
            settle_date: getMonthStart(9) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // October 2024
    {
      ts: String(getMonthStart(10)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786710,
          type: 'revenue_fpps',
          changed_balance: 0.2, // Increased from 0.0019 (~105x increase)
          created_at: getMonthStart(10) / 1000,
          mining_extra: {
            mining_date: getMonthStart(10) / 1000,
            settle_date: getMonthStart(10) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // November 2024
    {
      ts: String(getMonthStart(11)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786711,
          type: 'revenue_fpps',
          changed_balance: 0.22, // Increased from 0.002 (~110x increase)
          created_at: getMonthStart(11) / 1000,
          mining_extra: {
            mining_date: getMonthStart(11) / 1000,
            settle_date: getMonthStart(11) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
    // December 2024
    {
      ts: String(getMonthStart(12)),
      stats: [],
      workers: [],
      transactions: [
        {
          username: 'haven7346',
          id: 564786712,
          type: 'revenue_fpps',
          changed_balance: 0.21, // Increased from 0.0021 (~100x increase)
          created_at: getMonthStart(12) / 1000,
          mining_extra: {
            mining_date: getMonthStart(12) / 1000,
            settle_date: getMonthStart(12) / 1000,
            pps: 0.00022023072856632505,
            pps_fee_rate: 0.00529159783006455,
            tx_fee: 0.00001,
            tx_fee_rate: 0.008237007837796056,
            hash_rate: 611539599617678,
          },
          payout_extra: null,
        },
      ],
      blocksData: {},
      workersCount: 0,
    },
  ],
]

// Mock BTC prices data (mempool HISTORICAL_PRICES) - prices for all 12 months
export const mockBtcPricesData = [
  [
    { ts: getMonthStart(1), priceUSD: 42000 },
    { ts: getMonthStart(2), priceUSD: 43000 },
    { ts: getMonthStart(3), priceUSD: 45000 },
    { ts: getMonthStart(4), priceUSD: 47000 },
    { ts: getMonthStart(5), priceUSD: 46000 },
    { ts: getMonthStart(6), priceUSD: 65000 },
    { ts: getMonthStart(7), priceUSD: 62000 },
    { ts: getMonthStart(8), priceUSD: 68000 },
    { ts: getMonthStart(9), priceUSD: 67000 },
    { ts: getMonthStart(10), priceUSD: 66000 },
    { ts: getMonthStart(11), priceUSD: 69000 },
    { ts: getMonthStart(12), priceUSD: 71000 },
  ],
]

// Mock power consumption data (tail-log/range-aggr) - data for all 12 months
export const mockPowerData = [
  [
    {
      type: 'powermeter',
      data: [
        { ts: getMonthStart(1), val: { site_power_w: 140000000 } }, // January - ~140 MW
        { ts: getMonthStart(2), val: { site_power_w: 141000000 } }, // February
        { ts: getMonthStart(3), val: { site_power_w: 142000000 } }, // March
        { ts: getMonthStart(4), val: { site_power_w: 141301458 } }, // April - ~141.3 MW
        { ts: getMonthStart(5), val: { site_power_w: 143000000 } }, // May
        { ts: getMonthStart(6), val: { site_power_w: 150000000 } }, // June
        { ts: getMonthStart(7), val: { site_power_w: 148000000 } }, // July
        { ts: getMonthStart(8), val: { site_power_w: 145000000 } }, // August
        { ts: getMonthStart(9), val: { site_power_w: 148000000 } }, // September
        { ts: getMonthStart(10), val: { site_power_w: 150000000 } }, // October
        { ts: getMonthStart(11), val: { site_power_w: 152000000 } }, // November
        { ts: getMonthStart(12), val: { site_power_w: 150000000 } }, // December
      ],
      error: null,
    },
  ],
]

// Mock production costs data (global/data productionCosts) - costs for all 12 months
export const mockProductionCostsData = [
  {
    site: 'Site-A',
    year: 2024,
    month: 1,
    energyCostsUSD: 13000,
    operationalCostsUSD: 20000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 2,
    energyCostsUSD: 13500,
    operationalCostsUSD: 20500,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 3,
    energyCostsUSD: 14000,
    operationalCostsUSD: 21000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 4,
    energyCostsUSD: 14400,
    operationalCostsUSD: 21863,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 5,
    energyCostsUSD: 15000,
    operationalCostsUSD: 22500,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 6,
    energyCostsUSD: 20000,
    operationalCostsUSD: 25000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 7,
    energyCostsUSD: 19000,
    operationalCostsUSD: 24000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 8,
    energyCostsUSD: 18000,
    operationalCostsUSD: 22000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 9,
    energyCostsUSD: 19000,
    operationalCostsUSD: 23000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 10,
    energyCostsUSD: 19500,
    operationalCostsUSD: 23500,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 11,
    energyCostsUSD: 21000,
    operationalCostsUSD: 24000,
  },
  {
    site: 'Site-A',
    year: 2024,
    month: 12,
    energyCostsUSD: 20000,
    operationalCostsUSD: 24000,
  },
]
