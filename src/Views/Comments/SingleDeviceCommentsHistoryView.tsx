import _get from 'lodash/get'
import _head from 'lodash/head'
import _includes from 'lodash/includes'
import _replace from 'lodash/replace'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { CABINET_IDENTIFIER, FeatureConfig } from './Comments'
import { getCommentPayloadBase, mutateCommentAsync, sortCommentsByRecent } from './Comments.util'
import {
  CommentDeletionConfirmationContent,
  CommentsHistoryRoot,
} from './SingleDeviceCommentsHistoryView.styles'

type Device = Record<string, unknown>

import {
  useDeleteThingCommentMutation,
  useEditThingCommentMutation,
  useGetFeatureConfigQuery,
  useGetListThingsQuery,
} from '@/app/services/api'
import { selectUserEmail } from '@/app/slices/userInfoSlice'
import { getCabinetTitle, getMinerShortCode } from '@/app/utils/deviceUtils'
import { getLvCabinetDevicesByRoot } from '@/app/utils/queryUtils'
import AppTable from '@/Components/AppTable/AppTable'
import { Breadcrumbs } from '@/Components/Breadcrumbs/Breadcrumbs'
import { EditCommentModal } from '@/Components/CommentsModal/EditCommentModal'
import { groupCabinetDevices } from '@/Components/Explorer/List/ListView.util'
import { SimpleConfirmationModal } from '@/Components/SimpleConfirmationModal/SimpleConfirmationModal'
import {
  getCommentsHistoryTableColumns,
  type CommentRecord,
} from '@/Components/SingleDeviceCommentsHistory/SingleDeviceCommentsHistory.table'
import { POLLING_20s } from '@/constants/pollingIntervalConstants'
import useDeviceResolution from '@/hooks/useDeviceResolution'
import { useSmartPolling } from '@/hooks/useSmartPolling'
import useTimezone from '@/hooks/useTimezone'

const SingleDeviceCommentsHistoryView = () => {
  const smartPolling20s = useSmartPolling(POLLING_20s)
  const { id } = useParams()
  const { getFormattedDate } = useTimezone()
  const userEmail = useSelector(selectUserEmail)
  const [commentToEdit, setCommentToEdit] = useState<CommentRecord | undefined>(undefined)
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false)
  const [isDeletingComment, setIsDeletingComment] = useState<boolean>(false)

  const isCabinet = _includes(id, CABINET_IDENTIFIER)

  const featureConfigQuery = useGetFeatureConfigQuery(undefined)
  const featureConfig = (featureConfigQuery.data as FeatureConfig | undefined) ?? {}
  const isCommentsEnabled = Boolean(featureConfig.comments)

  const [editThingComment, { isLoading: isEditingThingComment }] = useEditThingCommentMutation()
  const [deleteThingComment, { isLoading: isDeletingThingComment }] =
    useDeleteThingCommentMutation()

  const { isMobile, isTablet } = useDeviceResolution()

  const devicesListQuery = useGetListThingsQuery(
    {
      query: isCabinet
        ? getLvCabinetDevicesByRoot(_replace(id as string, CABINET_IDENTIFIER, ''))
        : JSON.stringify({
            $and: [{ tags: { $in: [`id-${id}`] } }],
          }),
      status: 1,
      overwriteCache: true,
    },
    {
      pollingInterval: smartPolling20s,
    },
  )

  const devicesList = (devicesListQuery.data as Device[][] | undefined) ?? []
  const { isLoading, refetch } = devicesListQuery

  const groupedDevices = (_head(devicesList) as Device[]) || []
  const device = isCabinet
    ? (_head(groupCabinetDevices(groupedDevices)) as Device | undefined)
    : (_head(groupedDevices) as Device | undefined)
  const comments = sortCommentsByRecent(_get(device, 'comments', []) as Device[]) || []

  const handleItemEdit = (comment: CommentRecord) => {
    setIsEditingComment(true)
    setCommentToEdit(comment)
  }

  const handleCommentChangeCancel = () => {
    setCommentToEdit(undefined)
    setIsEditingComment(false)
    setIsDeletingComment(false)
  }

  const handleItemDeleteConfirm = () => {
    if (!commentToEdit) return
    const basePayload = getCommentPayloadBase(device, commentToEdit as unknown as Device, isCabinet)
    const payload = {
      ...basePayload,
      comment: _get(commentToEdit, 'comment') as string,
    }

    mutateCommentAsync(deleteThingComment, payload, {
      refetch,
      successMessage: 'Comment deleted successfully',
      errorMessage: 'Failed to delete comment',
      onFinally: handleCommentChangeCancel,
    })
  }

  const handleEditCommentConfirm = (editedComment: string) => {
    if (!commentToEdit) return
    const comment = commentToEdit
    const basePayload = getCommentPayloadBase(device, commentToEdit as unknown as Device, isCabinet)
    const payload = {
      ...basePayload,
      ts: _get(comment, 'ts') as number,
      comment: editedComment,
    }

    mutateCommentAsync(editThingComment, payload, {
      refetch,
      successMessage: 'Comment updated successfully',
      errorMessage: 'Failed to update comment',
      onFinally: handleCommentChangeCancel,
    })
  }

  const handleItemDelete = (comment: CommentRecord) => {
    setCommentToEdit(comment)
    setIsDeletingComment(true)
  }

  if (!isCommentsEnabled) return null

  const isDataLoading = isLoading || isEditingThingComment || isDeletingThingComment

  return (
    <CommentsHistoryRoot>
      <Breadcrumbs title={'Comments History'} destination={'/comments'} />
      <div
        style={{
          marginTop: isMobile ? '15px' : '20px',
          overflow: 'auto',
        }}
      >
        <AppTable<CommentRecord>
          rowKey={(record) => `Comments_History${record?.ts || ''}`}
          pagination={{
            showSizeChanger: !isMobile,
            size: isMobile ? 'small' : 'default',
          }}
          dataSource={comments as CommentRecord[]}
          columns={getCommentsHistoryTableColumns({
            isMobile,
            isTablet,
            getFormattedDate,
            deviceName: isCabinet
              ? getCabinetTitle(device as Device)
              : getMinerShortCode(_get(device, 'code') as string, _get(device, 'tags') as string[]),
            onEdit: handleItemEdit,
            onDelete: handleItemDelete,
            user: userEmail,
          })}
          loading={isDataLoading}
          scroll={{ x: 1000 }}
        />
      </div>
      <SimpleConfirmationModal
        title="Delete Comment"
        isOpened={isDeletingComment && commentToEdit !== undefined}
        message={
          <>
            <span>Are you sure you want to delete the following comment?</span>
            <CommentDeletionConfirmationContent>
              {_get(commentToEdit, 'comment') as string}
            </CommentDeletionConfirmationContent>
          </>
        }
        onCancel={handleCommentChangeCancel}
        onConfirm={handleItemDeleteConfirm}
      />
      <EditCommentModal
        isOpened={isEditingComment && commentToEdit !== undefined}
        comment={
          commentToEdit
            ? {
                comment: commentToEdit.comment,
                user: commentToEdit.user,
                ts: commentToEdit.ts,
              }
            : undefined
        }
        onSave={handleEditCommentConfirm}
        onCancel={handleCommentChangeCancel}
      />
    </CommentsHistoryRoot>
  )
}

export default SingleDeviceCommentsHistoryView
