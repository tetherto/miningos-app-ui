export const myActions = [
  {
    id: 1701347565575,
    action: 'setupPools',
    votesPos: ['test@test.com'],
    votesNeg: [],
    reqVotesPos: 2,
    reqVotesNeg: 2,
    status: 'VOTING',
    requiredPerms: ['miner'],
    targets: {
      'miner-am-s19xp-shelf-0': {
        calls: [
          {
            id: 'fyimhbwahprowpk',
            tags: [
              't-miner-am-s19xp',
              't-miner-am',
              't-miner',
              'antminer',
              '1',
              'pos-1-1_a4',
              'container-bitdeer-9b',
              'site-site-a',
              'id-fyimhbwahprowpk',
            ],
          },
          {
            id: 'jy1ith2ymj3pgvh',
            tags: [
              't-miner-am-s19xp',
              't-miner-am',
              't-miner',
              'antminer',
              '1',
              'pos-1-1_a5',
              'container-bitdeer-9b',
              'site-site-a',
              'id-jy1ith2ymj3pgvh',
            ],
          },
          {
            id: 'snay45muktaah6i',
            tags: [
              't-miner-am-s19xp',
              't-miner-am',
              't-miner',
              'antminer',
              '1',
              'pos-1-1_b1',
              'container-bitdeer-9b',
              'site-site-a',
              'id-snay45muktaah6i',
            ],
          },
        ],
      },
    },
    params: [],
  },
  {
    id: 1701347556559,
    action: 'setupPools',
    votesPos: ['test@test.com'],
    votesNeg: [],
    reqVotesPos: 2,
    reqVotesNeg: 2,
    status: 'VOTING',
    requiredPerms: ['miner'],
    targets: {
      'miner-am-s19xp-shelf-0': {
        calls: [
          {
            id: '9n7zykc9w0wdny7',
            tags: [
              't-miner-am-s19xp',
              't-miner-am',
              't-miner',
              'antminer',
              '1',
              'pos-1-1_a1',
              'container-bitdeer-9a',
              'site-site-a',
              'id-9n7zykc9w0wdny7',
            ],
          },
          {
            id: 'iw9pgbr3k4wv0ur',
            tags: [
              't-miner-am-s19xp',
              't-miner-am',
              't-miner',
              'antminer',
              '1',
              'pos-1-1_a2',
              'container-bitdeer-9a',
              'site-site-a',
              'id-iw9pgbr3k4wv0ur',
            ],
          },
          {
            id: 'ujcaanly8ao9i9b',
            tags: [
              't-miner-am-s19xp',
              't-miner-am',
              't-miner',
              'antminer',
              '1',
              'pos-1-1_a3',
              'container-bitdeer-9a',
              'site-site-a',
              'id-ujcaanly8ao9i9b',
            ],
          },
        ],
      },
    },
    params: [],
  },
]

export const pendingSubmissions = [
  {
    type: 'voting',
    action: 'setupPools',
    tags: ['id-fyimhbwahprowpk', 'id-ujcaanly8ao9i9b'],
    params: [],
    id: 1,
    status: 'PENDING',
  },
]

export const actions = [
  {
    remove: 1701347565575,
  },
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-ujcaanly8ao9i9b'],
      params: [],
      id: 1,
    },
  },
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-fyimhbwahprowpk'],
      params: [],
      id: 1,
    },
  },
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-jy1ith2ymj3pgvh', 'id-snay45muktaah6i'],
      params: [],
      id: 1,
    },
  },
  {
    remove: 1701347556559,
  },
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-9n7zykc9w0wdny7', 'id-iw9pgbr3k4wv0ur'],
      params: [],
      id: 1,
    },
  },
]
