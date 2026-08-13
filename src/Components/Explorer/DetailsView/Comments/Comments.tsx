import { DeleteOutlined } from '@ant-design/icons'
import _filter from 'lodash/filter'
import _head from 'lodash/head'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _sortBy from 'lodash/sortBy'
import React, { useEffect, useState, FC } from 'react'

import { useNotification } from '../../../../hooks/useNotification'
import useTimezone from '../../../../hooks/useTimezone'
import LabeledCard from '../../../Card/LabeledCard'

import {
  CommentAction,
  CommentBody,
  CommentInput,
  CommentMeta,
  CommentWrapper,
  CommentsContainer,
  CommentsList,
  PostCommentButton,
  CommentsTypeButton,
  ScopeChooser,
  SelectedSocket,
  Separator,
} from './Comments.style'

import {
  useDeleteThingCommentMutation,
  useAddThingCommentMutation,
  useGetListThingsQuery,
} from '@/app/services/api'

const COMMENTS_TYPE = {
  MINER: 'miner',
  SOCKET: 'socket',
}

interface Comment {
  id: string
  ts: number
  comment: string
  pos?: string
  [key: string]: unknown
}

interface CommentsProps {
  rack?: string
  socket?: string
  thingId?: string
  minerId?: string
  minerRackId?: string
  socketRackId?: string
  hasMiner?: boolean
}

const Comments: FC<CommentsProps> = ({
  rack,
  socket,
  thingId,
  minerId,
  minerRackId,
  socketRackId,
  hasMiner,
}) => {
  const { notifyError, notifySuccess } = useNotification()
  const [commentsType, setCommentsType] = useState(
    hasMiner ? COMMENTS_TYPE.MINER : COMMENTS_TYPE.SOCKET,
  )
  const { getFormattedDate } = useTimezone()
  const [deleteThingComment, { isLoading: isDeletingThingComment }] =
    useDeleteThingCommentMutation()
  const [addNewThingComment, { isLoading: isAddingNewThingComment }] = useAddThingCommentMutation()
  const [minerComments, setMinerComments] = useState<Comment[]>([])
  const [socketComments, setSocketComments] = useState<Comment[]>([])

  const [newComment, setNewComment] = useState('')

  const queryId = commentsType === COMMENTS_TYPE.MINER ? minerId : thingId

  const { data, isLoading, refetch } = useGetListThingsQuery({
    query: JSON.stringify({
      $and: [{ id: queryId }],
    }),
  })

  const delayedRefetch = () => {
    // refetching right after the comment is added or deleted
    // will result in the comment not being there.
    // To workaround this, we delay the refetch by 2 seconds,
    // and show the comments immediately by adding the sent payload to the local state.
    setTimeout(refetch, 2000)
  }

  useEffect(() => {
    setCommentsType(hasMiner ? COMMENTS_TYPE.MINER : COMMENTS_TYPE.SOCKET)
  }, [hasMiner])

  useEffect(() => {
    if (isLoading || !data) {
      return
    }
    const dataArray = data as unknown[]

    // the data structure is an array of arrays, get the first inner array then the first item
    const firstArray = _head(dataArray) as unknown[] | undefined
    const firstData = _head(firstArray) as { comments?: Comment[] } | undefined

    const fetchedComment = _sortBy(firstData?.comments, 'ts')

    if (commentsType === COMMENTS_TYPE.MINER) {
      setMinerComments(fetchedComment || [])
    } else {
      const filteredComments = _filter(
        fetchedComment || [],
        ({ pos }: Comment) => pos === `${rack}-${socket}`,
      )
      setSocketComments(filteredComments)
    }
  }, [data, isLoading, rack, socket, commentsType])

  const getCurrentComments = () =>
    commentsType === COMMENTS_TYPE.MINER ? minerComments : socketComments

  const updateComments = (newComments: Comment[]) => {
    if (commentsType === COMMENTS_TYPE.MINER) {
      setMinerComments(newComments)
    } else {
      setSocketComments(newComments)
    }
    delayedRefetch()
  }

  const handleSwitchCommentType = (type: string) => {
    if (type === commentsType) return
    setCommentsType(type)
    delayedRefetch()
  }

  const handleCommentDelete = async (comment: Comment) => {
    if (isDeletingThingComment) return

    const { data } = await deleteThingComment({
      id: comment.id,
      thingId: commentsType === COMMENTS_TYPE.MINER ? minerId : thingId,
      rackId: commentsType === COMMENTS_TYPE.MINER ? minerRackId : socketRackId,
      ts: comment.ts,
    })

    const responseData = _head(data as Array<{ success?: number }> | undefined)
    if (responseData?.success === 1) {
      // update local state immediately
      const currentComments = getCurrentComments()
      const updatedComments = _reject(currentComments, { id: comment.id })
      updateComments(updatedComments)

      notifySuccess('Comment deleted successfully', '')
      refetch()
    } else {
      notifyError('Failed to delete comment', '')
    }
  }

  const addNewComment = async () => {
    if (isAddingNewThingComment) return

    // build API payload - DON'T include id or ts for new comments
    const apiPayload: {
      thingId?: string
      rackId?: string
      comment: string
      pos?: string
    } = {
      thingId: commentsType === COMMENTS_TYPE.MINER ? minerId : thingId,
      rackId: commentsType === COMMENTS_TYPE.MINER ? minerRackId : socketRackId,
      comment: newComment,
    }

    if (COMMENTS_TYPE.SOCKET === commentsType) {
      apiPayload.pos = `${rack}-${socket}`
    }

    const { data } = await addNewThingComment(apiPayload)

    // local payload for state update includes id, ts, and pos
    const newCommentPayload: Comment = {
      id: '',
      comment: newComment,
      ts: Date.now(),
      ...(apiPayload.pos && { pos: apiPayload.pos }),
    }

    const responseData = _head(data as Array<{ success?: number }> | undefined)

    if (responseData?.success === 1) {
      // update local state immediately
      const currentComments = getCurrentComments()
      const updatedComments = _sortBy([newCommentPayload as Comment, ...currentComments], 'ts')
      updateComments(updatedComments as Comment[])
      setNewComment('')
      notifySuccess('Submitted Comment', 'Message sent successfully')
      delayedRefetch()
    } else {
      setNewComment('')
      notifyError('Error occurred while submission', '')
    }
  }

  const commentsList = (
    <CommentsList>
      {_map(getCurrentComments() || [], (comment: Comment) => (
        <React.Fragment key={comment.id || comment.ts}>
          <Separator />
          <CommentWrapper>
            <CommentMeta>{getFormattedDate(new Date(comment.ts))}</CommentMeta>
            <CommentAction>
              {comment.id && <DeleteOutlined onClick={() => handleCommentDelete(comment)} />}
            </CommentAction>
            <CommentMeta>{comment.user as string}</CommentMeta>
            <CommentBody>{(comment as { comment?: string }).comment}</CommentBody>
          </CommentWrapper>
        </React.Fragment>
      ))}
    </CommentsList>
  )

  return (
    <LabeledCard label="Comments" isDark noMargin>
      <CommentsContainer>
        <SelectedSocket>
          Rack {rack} | Socket {socket}
        </SelectedSocket>
        <ScopeChooser>
          <CommentsTypeButton
            disabled={!hasMiner}
            className={commentsType === COMMENTS_TYPE.MINER ? 'active' : ''}
            block
            onClick={() => handleSwitchCommentType(COMMENTS_TYPE.MINER)}
          >
            Miner
          </CommentsTypeButton>
          <CommentsTypeButton
            className={commentsType === COMMENTS_TYPE.SOCKET ? 'active' : ''}
            block
            onClick={() => handleSwitchCommentType(COMMENTS_TYPE.SOCKET)}
          >
            Socket
          </CommentsTypeButton>
        </ScopeChooser>
        {isLoading ? 'Loading Comments...' : commentsList}
        <Separator />
        <div>Comment</div>
        <CommentInput
          placeholder="Enter Comment..."
          value={newComment}
          onChange={(e: unknown) =>
            setNewComment((e as { target: { value: string } }).target.value)
          }
        />
        <PostCommentButton onClick={addNewComment}>Post Comment</PostCommentButton>
      </CommentsContainer>
    </LabeledCard>
  )
}

export default Comments
