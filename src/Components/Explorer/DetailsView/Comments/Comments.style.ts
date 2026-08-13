import Button from 'antd/es/button'
import styled from 'styled-components'

import { flexColumn, flexRow } from '@/app/mixins'
import { COLOR } from '@/constants/colors'

export const CommentsContainer = styled.div`
  min-width: 300px;
  ${flexColumn};
  gap: 16px;
  padding: 0 10px 10px;
`

export const CommentsHeader = styled.div`
  ${flexRow};
  justify-content: space-between;
`

export const SelectedSocket = styled.div`
  margin-bottom: 4px;
`

export const ScopeChooser = styled.div`
  ${flexRow};
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
`

export const CommentsList = styled.div`
  ${flexColumn};
  gap: 4px;
`

export const CommentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: repeat(3, auto);
  gap: 4px;
`

export const CommentMeta = styled.div`
  color: ${COLOR.WHITE_ALPHA_05};
`

export const CommentAction = styled.div`
  color: ${COLOR.WHITE_ALPHA_05};
  cursor: pointer;

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }
`

export const CommentBody = styled.div`
  margin: 8px 0;
  grid-column: 1 / -1;
`

export const Separator = styled.div`
  margin: 2px 0;
  height: 1px;
  background-color: ${COLOR.WHITE_ALPHA_01};
`

export const CommentInput = styled.textarea`
  box-sizing: border-box;
  color: ${COLOR.WHITE};
  width: 100%;
  height: 80px;
  border: none;
  border-radius: 0;
  padding: 8px;
  background-color: ${COLOR.WHITE_ALPHA_01};
  resize: none;
`

export const PostCommentButton = styled(Button)`
  ${flexRow};
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 11px;
`

export const CommentsTypeButton = styled(Button)`
  &.active {
    background: ${COLOR.COLD_ORANGE_ALPHA_02};
    color: ${COLOR.COLD_ORANGE};
    border: none;
  }

  &:hover {
    color: ${COLOR.COLD_ORANGE};
  }
`
