export const myActions = [
  {
    id: 1700505551724,
    action: 'setupPools',
    votesPos: ['test@test.com'],
    votesNeg: [],
    reqVotesPos: 2,
    reqVotesNeg: 2,
    status: 'VOTING',
    requiredPerms: ['miner'],
    targets: {
      'miner-av-a1346-shelf-0': {
        calls: [
          {
            id: 'v4cqxhtbymbdkzm',
            tags: [
              't-miner-av-a1346',
              't-miner-av',
              't-miner',
              'avalon',
              '1',
              'pos-1-1_a5',
              'container-bitdeer-4b',
              'site-site-a',
              'id-v4cqxhtbymbdkzm',
            ],
          },
        ],
      },
    },
    params: [],
  },
  {
    id: 1700505445717,
    action: 'setupPools',
    votesPos: ['test@test.com'],
    votesNeg: [],
    reqVotesPos: 2,
    reqVotesNeg: 2,
    status: 'VOTING',
    requiredPerms: ['miner'],
    targets: {
      'miner-av-a1346-shelf-0': {
        calls: [
          {
            id: 'foz2pcbdww9pwmu',
            tags: [
              't-miner-av-a1346',
              't-miner-av',
              't-miner',
              'avalon',
              '1',
              'pos-1-1_a1',
              'container-bitdeer-4a',
              'site-site-a',
              'id-foz2pcbdww9pwmu',
            ],
          },
        ],
      },
    },
    params: [],
  },
  {
    id: 1700505335240,
    action: 'setupPools',
    votesPos: ['test@test.com'],
    votesNeg: [],
    reqVotesPos: 2,
    reqVotesNeg: 2,
    status: 'VOTING',
    requiredPerms: ['miner'],
    targets: {
      'miner-av-a1346-shelf-0': {
        calls: [
          {
            id: 'mzuoz4d2u57ddnb',
            tags: [
              't-miner-av-a1346',
              't-miner-av',
              't-miner',
              'avalon',
              '1',
              'pos-1-1_a4',
              'container-bitdeer-4b',
              'site-site-a',
              'id-mzuoz4d2u57ddnb',
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
    tags: ['id-09ywqbvvglieus9', 'id-4yx2liii1hfuhqm', 'id-foz2pcbdww9pwmu'],
    params: [],
    id: 1,
    status: 'PENDING',
  },
]

export const actions = [
  {
    remove: 1700505445717,
  },
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-09ywqbvvglieus9', 'id-4yx2liii1hfuhqm'],
      params: [],
      id: 1,
    },
  },
  {
    create: {
      type: 'voting',
      action: 'setupPools',
      tags: ['id-foz2pcbdww9pwmu'],
      params: [],
      id: 1,
    },
  },
]
