import { describe, expect, it, vi } from 'vitest'

import { executeAction } from '../Inventory.utils'

vi.mock('@/app/utils/NotificationService', () => ({
  notifyError: vi.fn(),
  notifyInfo: vi.fn(),
}))
vi.mock('@/app/services/logger', () => ({ Logger: { error: vi.fn() } }))

describe('Inventory.utils', () => {
  describe('executeAction', () => {
    it('calls onSuccess when executor resolves without error', async () => {
      const onSuccess = vi.fn()
      await executeAction({
        executor: async () => ({}),
        action: {},
        onSuccess,
      })
      expect(onSuccess).toHaveBeenCalled()
    })

    it('calls onError when executor resolves with error', async () => {
      const onError = vi.fn()
      await executeAction({
        executor: async () => ({ error: 'fail' }),
        action: {},
        onSuccess: vi.fn(),
        onError,
      })
      expect(onError).toHaveBeenCalledWith('fail')
    })

    it('calls onError when executor throws', async () => {
      const onError = vi.fn()
      await executeAction({
        executor: async () => {
          throw new Error('thrown')
        },
        action: {},
        onSuccess: vi.fn(),
        onError,
      })
      expect(onError).toHaveBeenCalled()
    })
  })
})
