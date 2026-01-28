import { recreateSubmission } from './MinerControlsCard.util'

import { ACTION_TYPES } from '@/constants/actions'

test('recreateSubmission', () => {
  expect(() => {
    recreateSubmission(undefined)
  }).toThrow()

  expect(
    recreateSubmission({
      pendingSubmissions: [],
      selectedDevicesTags: ['a', 'b', 'c'],
      action: ACTION_TYPES.SETUP_POOLS,
    }),
  ).toEqual({
    add: ['a', 'b', 'c'],
  })

  expect(
    recreateSubmission({
      pendingSubmissions: [
        {
          type: 'voting',
          action: ACTION_TYPES.SETUP_POOLS,
          tags: ['a', 'b'],
          params: [],
          id: 1,
        },
      ],
      selectedDevicesTags: ['b', 'c'],
      action: ACTION_TYPES.SETUP_POOLS,
    }),
  ).toEqual({
    remove: [1, 'b'],
    add: ['b', 'c'],
  })
})
