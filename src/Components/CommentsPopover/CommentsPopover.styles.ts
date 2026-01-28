import Button from 'antd/es/button'
import Input from 'antd/es/input'
import { styled } from 'styled-components'

interface StyledProps {
  $hideMarginTop?: unknown
  $hasMarginTop?: unknown
}

import { flexRow } from '../../app/mixins'

import { COLOR } from '@/constants/colors'

const { TextArea } = Input

export const CommentsPopoverContentContainer = styled.div<StyledProps>`
  width: 100%;

  @media screen and (max-width: 768px) {
    min-width: 250px;
  }
`

export const TitleRow = styled.div<StyledProps>`
  align-items: center;
  gap: 15px;
  ${flexRow};
`

export const TimestampText = styled.div<StyledProps>`
  font-size: 12px;
  font-weight: 400;
`

export const FooterButtonsContainer = styled.div<StyledProps>`
  ${flexRow};
  gap: 12px;
  padding-top: 24px;
  justify-content: flex-end;
  border-top: 1px solid ${COLOR.WHITE_ALPHA_01};
  margin-top: ${({ $hideMarginTop }) => ($hideMarginTop ? '0' : '24px')};
`

export const NonResizableTextArea = styled(TextArea)<StyledProps>`
  resize: none !important;
  margin-top: ${({ $hasMarginTop }) => ($hasMarginTop ? '12px' : '0')};
  max-height: min(550px, 50dvh);
`

export const CommentsPopoverListContainer = styled.div<StyledProps>`
  max-height: 500px;
  margin-bottom: 20px;
  overflow-y: auto;
`

export const DescriptionWrapper = styled.div<StyledProps>`
  word-break: break-word;
  overflow-wrap: break-word;
`

export const CommentButton = styled(Button)<StyledProps>`
  background: none !important;
  box-shadow: none !important;

  span {
    display: flex;
  }
`

export const CommentText = styled.span`
  word-break: break-word;
  overflow-wrap: break-word;
`
