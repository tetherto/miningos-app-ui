import notification from 'antd/es/notification'

import { notifyError, notifyInfo, notifySuccess, notifyWarning } from '../NotificationService'

vi.mock('antd/es/notification', () => ({
  default: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}))
vi.mock('../../store', () => ({
  store: { dispatch: vi.fn() },
}))

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('notifySuccess', () => {
    it('calls notification.success with message and description', () => {
      notifySuccess('Done', 'Operation completed')
      expect(notification.success).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Done',
          description: 'Operation completed',
          duration: 3,
          placement: 'topLeft',
        }),
      )
    })
  })

  describe('notifyError', () => {
    it('calls notification.error with duration 3 by default', () => {
      notifyError('Error', 'Something failed')
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error',
          description: 'Something failed',
          duration: 3,
        }),
      )
    })
    it('calls notification.error with duration 0 when dontClose true', () => {
      notifyError('Error', 'Persistent', true)
      expect(notification.error).toHaveBeenCalledWith(expect.objectContaining({ duration: 0 }))
    })
  })

  describe('notifyInfo', () => {
    it('calls notification.info', () => {
      notifyInfo('Info', 'Note')
      expect(notification.info).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Info', description: 'Note' }),
      )
    })
  })

  describe('notifyWarning', () => {
    it('calls notification.warning', () => {
      notifyWarning('Warning', 'Careful')
      expect(notification.warning).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Warning', description: 'Careful' }),
      )
    })
  })
})
