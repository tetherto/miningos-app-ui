import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { executeCreateAction } from '../../app/utils/actionUtils'
import { ACTION_STATUS_TYPES } from '../../constants/actions'
import { useSubmitActions } from '../useSubmitActions'

import { API_ERRORS } from '@/constants/errors'

const dispatchMock = vi.fn()
const cancelActionsMock = vi.fn()
const addNewActionMock = vi.fn()
const addNewBatchActionMock = vi.fn()
const refetchActionsDataMock = vi.fn()
const notifyErrorMock = vi.fn()
const notifyInfoMock = vi.fn()
const notifySuccessMock = vi.fn()

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(() => dispatchMock),
}))

vi.mock('@/contexts/ActionsContext', () => ({
  useActionsContext: vi.fn(() => ({
    refetchActionsData: refetchActionsDataMock,
  })),
}))

vi.mock('../../app/services/api', () => ({
  useAddNewActionMutation: vi.fn(() => [addNewActionMock, { isLoading: false }]),
  useAddNewBatchActionMutation: vi.fn(() => [addNewBatchActionMock, { isLoading: false }]),
  useCancelActionsMutation: vi.fn(() => [cancelActionsMock, { isLoading: false }]),
}))

vi.mock('../useNotification', () => ({
  useNotification: vi.fn(() => ({
    notifyError: notifyErrorMock,
    notifyInfo: notifyInfoMock,
    notifySuccess: notifySuccessMock,
    notifyWarning: vi.fn(),
  })),
}))

vi.mock('../../app/utils/actionUtils', () => ({
  executeCreateAction: vi.fn(),
  getErrorMessage: vi.fn(),
}))

describe('useSubmitActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refetchActionsDataMock.mockResolvedValue(undefined)
  })

  it('should handle batch action submission with success', async () => {
    const mockPayload = { id: 'mockBatch', action: 'test' }
    vi.mocked(executeCreateAction).mockResolvedValue({
      isBatch: true,
      newActionPayload: mockPayload,
      data: undefined,
      error: undefined,
    })

    const actions = [{ create: true }]
    const { result } = renderHook(() => useSubmitActions({ actions }))

    await result.current.submitActions()

    expect(notifyInfoMock).toHaveBeenCalledWith('Batch action submitted', '')
    expect(dispatchMock).toHaveBeenCalled()
    expect(refetchActionsDataMock).toHaveBeenCalled()
  })

  it('should show batch action error notification if error exists', async () => {
    vi.mocked(executeCreateAction).mockResolvedValue({
      isBatch: true,
      newActionPayload: { action: 'test' },
      data: undefined,
      error: { data: { message: 'Error' } },
    })

    const actions = [{ create: true }]
    const { result } = renderHook(() => useSubmitActions({ actions }))

    await result.current.submitActions()

    expect(notifyErrorMock).toHaveBeenCalledWith('Error occurred while batch action submission', '')
    expect(refetchActionsDataMock).toHaveBeenCalled()
  })

  it('should handle permission error (ERR_ORK_ACTION_CALLS_EMPTY)', async () => {
    vi.mocked(executeCreateAction).mockResolvedValue({
      isBatch: false,
      newActionPayload: { action: 'test' },
      data: [{ errors: [API_ERRORS.ERR_ORK_ACTION_CALLS_EMPTY] }],
      error: undefined,
    })

    const actions = [{ create: true }]
    const { result } = renderHook(() => useSubmitActions({ actions }))

    await result.current.submitActions()

    expect(notifyErrorMock).toHaveBeenCalledWith(
      'Error occurred while submission',
      'This user role is not authorized to submit this action',
    )
    expect(refetchActionsDataMock).toHaveBeenCalled()
  })

  it('should handle successful APPROVED action', async () => {
    const headItem = { id: '1', data: { status: ACTION_STATUS_TYPES.APPROVED } }
    vi.mocked(executeCreateAction).mockResolvedValue({
      isBatch: false,
      newActionPayload: { action: 'test' },
      data: [headItem],
      error: undefined,
    })

    const actions = [{ create: true }]
    const { result } = renderHook(() => useSubmitActions({ actions }))

    await result.current.submitActions()

    expect(notifySuccessMock).toHaveBeenCalledWith(
      'Submitted Action',
      'Action was submitted successfully',
    )
    expect(dispatchMock).toHaveBeenCalled()
    expect(refetchActionsDataMock).toHaveBeenCalled()
  })

  it('should handle successful VOTING action', async () => {
    const headItem = { id: '1', data: { status: ACTION_STATUS_TYPES.VOTING } }
    vi.mocked(executeCreateAction).mockResolvedValue({
      isBatch: false,
      newActionPayload: { action: 'test' },
      data: [headItem],
      error: undefined,
    })

    const actions = [{ create: true }]
    const { result } = renderHook(() => useSubmitActions({ actions }))

    await result.current.submitActions()

    expect(notifyInfoMock).toHaveBeenCalledWith(
      'Action Submitted',
      'Action submitted, pending approval',
    )
    expect(dispatchMock).toHaveBeenCalled()
    expect(refetchActionsDataMock).toHaveBeenCalled()
  })

  it('should show generic error when data is invalid', async () => {
    vi.mocked(executeCreateAction).mockResolvedValue({
      isBatch: false,
      newActionPayload: { action: 'test' },
      data: null,
      error: undefined,
    })

    const actions = [{ create: true }]
    const { result } = renderHook(() => useSubmitActions({ actions }))

    await result.current.submitActions()

    expect(notifyErrorMock).toHaveBeenCalledWith(
      'Error occurred while submission',
      'This user role is not authorized to submit this action',
    )
    expect(refetchActionsDataMock).toHaveBeenCalled()
  })
})
