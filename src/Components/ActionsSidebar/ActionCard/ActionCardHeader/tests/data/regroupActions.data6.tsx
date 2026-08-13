export const myActions = [
  {
    id: 1701421286742,
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
    tags: ['id-fyimhbwahprowpk', 'id-jy1ith2ymj3pgvh', 'id-snay45muktaah6i'],
    params: [],
    id: 1,
    status: 'PENDING',
  },
]

export const actions = [
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-fyimhbwahprowpk', 'id-jy1ith2ymj3pgvh', 'id-snay45muktaah6i'],
      params: [],
      id: 1,
    },
  },
]
