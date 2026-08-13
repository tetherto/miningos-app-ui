import styled from 'styled-components'

import { flexCenterRow } from '@/app/mixins'
import { DeviceCommentCell } from '@/Components/Comments/Comments.styles'

export const ActionsCell = styled.div`
  ${flexCenterRow};
  gap: 12px;
`

export const CommentCell = styled(DeviceCommentCell)`
  word-break: break-word;
`
