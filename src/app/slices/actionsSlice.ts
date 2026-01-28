import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _includes from 'lodash/includes'
import _reject from 'lodash/reject'

import type { ActionsState, PendingSubmissionAction, RootState } from '@/types/redux'

export const getExistedIndex = (state: ActionsState, payloadId: number): number =>
  _findIndex(state?.pendingSubmissions, { id: payloadId })

const initialState: ActionsState = {
  pendingSubmissions: [],
}

export const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setPendingSubmissionActions: (state, { payload }: PayloadAction<PendingSubmissionAction[]>) => {
      state.pendingSubmissions = payload
    },
    setAddPendingSubmissionAction: (
      state,
      { payload }: PayloadAction<Omit<PendingSubmissionAction, 'id'>>,
    ) => {
      state.pendingSubmissions.push({
        ...payload,
        id: state.pendingSubmissions.length + 1,
      })
    },
    removeTagsFromPendingAction: (
      state,
      { payload }: PayloadAction<{ submissionId: number; tags: string[] }>,
    ) => {
      const { submissionId, tags } = payload

      const pendingSubmission = _find(
        state.pendingSubmissions,
        ({ id }: PendingSubmissionAction) => submissionId === id,
      )

      if (pendingSubmission && pendingSubmission.tags) {
        pendingSubmission.tags = _reject(pendingSubmission.tags, (tag: string) =>
          _includes(tags, tag),
        )
      }
    },
    removePendingSubmissionAction: (state, { payload }: PayloadAction<{ id: number }>) => {
      const index = getExistedIndex(state, payload.id)
      state.pendingSubmissions.splice(index, 1)
    },
    updatePendingSubmissionAction: (
      state,
      { payload }: PayloadAction<Partial<PendingSubmissionAction> & { id: number }>,
    ) => {
      const index = getExistedIndex(state, payload.id)
      state.pendingSubmissions[index] = { ...state.pendingSubmissions[index], ...payload }
    },
    clearAllPendingSubmissions: (state) => {
      state.pendingSubmissions = []
    },
  },
})

export const selectPendingSubmissions = (state: RootState): PendingSubmissionAction[] =>
  state.actions.pendingSubmissions
