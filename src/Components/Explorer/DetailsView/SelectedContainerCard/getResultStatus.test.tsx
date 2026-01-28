import { getResultStatus } from './helper'

import type { CardAction } from '@/Components/ActionsSidebar/ActionCard/ActionCard'

test('getResultStatus success', () => {
  const cardAction: CardAction = {
    id: 'test-action-1',
    action: 'test-action',
    targets: {
      'webapp-wrk-container-bitdeer-1': {
        calls: [
          {
            id: '45a20aa2-3da4-467a-b788-4b26d038740a',
            result: {
              success: true,
            },
          },
        ],
      },
    },
  }

  expect(getResultStatus(cardAction, '45a20aa2-3da4-467a-b788-4b26d038740a')?.result?.success).toBe(
    true,
  )
})

test('getResultStatus error', () => {
  const cardAction: CardAction = {
    id: 'test-action-2',
    action: 'test-action',
    targets: {
      'webapp-wrk-container-bitdeer-1': {
        calls: [
          {
            id: '45a20aa2-3da4-467a-b788-4b26d038740a',
            error: 'ABC',
          },
        ],
      },
    },
  }

  expect(getResultStatus(cardAction, '45a20aa2-3da4-467a-b788-4b26d038740a')?.error).toBe('ABC')
})

test('getResultStatus not found', () => {
  const cardAction: CardAction = {
    id: 'test-action-3',
    action: 'test-action',
    targets: {
      'webapp-wrk-container-bitdeer-1': {
        calls: [
          {
            id: '45a20aa2-3da4-467a-b788-4b26d038740a',
            error: 'ABC',
          },
        ],
      },
    },
  }

  expect(getResultStatus(cardAction, 'abc')?.error).toBe(undefined)
})
