import Empty from 'antd/es/empty'
import Row from 'antd/es/row'
import Timeline from 'antd/es/timeline'
import styled, { css } from 'styled-components'

interface StyledProps {
  type?: string
  $status?: unknown
  $isEmpty?: unknown
  $listHeight?: unknown
}

import { flexCenterColumn, flexColumn, flexRow } from '../../app/mixins'
import { ALERT_SEVERITY_TYPES } from '../../app/utils/alertUtils'

import { LIST_HEIGHT, LOG_TYPES } from './constants'

import { COLOR } from '@/constants/colors'

export const LogContainer = styled.div<StyledProps>`
  ${flexRow};
  width: 100%;
`
export const LogHeaderContainer = styled.div<StyledProps>`
  ${flexRow};
  align-items: center;
`

export const LogInnerContainer = styled.div<StyledProps>`
  ${flexRow};
  gap: 5px;
  width: 100%;
  cursor: pointer;
`
export const LogDataContainer = styled.div<StyledProps>`
  ${flexColumn};
  flex: 1;
`

export const LogStatusIcon = styled.div<StyledProps>`
  background-color: ${(props) =>
    // eslint-disable-next-line no-nested-ternary
    props.$status === ALERT_SEVERITY_TYPES.CRITICAL
      ? 'red'
      : // eslint-disable-next-line no-nested-ternary
        props.$status === ALERT_SEVERITY_TYPES.HIGH
        ? 'orange'
        : props.$status === ALERT_SEVERITY_TYPES.MEDIUM
          ? 'yellow'
          : ''};
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 5px;
  margin-top: 8px;
`
export const LogsListContainer = styled.div<StyledProps>`
  ${flexColumn};
  height: 100%;
  overflow-y: auto;
  gap: 15px;
  padding: ${({ $isEmpty }) => ($isEmpty ? '0' : '10px')};
  padding-bottom: 0;
  ${(props: StyledProps) =>
    props?.$listHeight && !props?.$isEmpty
      ? css`
          height: ${String(props?.$listHeight)}px;
        `
      : ''}
  max-height: ${LIST_HEIGHT}px;
  &::-webkit-scrollbar {
    width: 4px;
    background: transparent; /* make scrollbar transparent */
  }
`

export const LogTitleText = styled.div<StyledProps>`
  font-size: 12px;
  color: ${COLOR.LIGHT};
`

export const LogSubTitleText = styled.div<StyledProps>`
  font-size: 10px;
  color: ${COLOR.CARD_SUBTITLE_TEXT};
  padding: 5px 0;
  max-width: 100%;
`

export const LogBodyText = styled.div<StyledProps>`
  display: flex;
  gap: 5px;
  font-size: 10px;
  color: ${COLOR.CARD_BODY_TEXT};
`

export const StyledTimeline = styled(Timeline)<StyledProps>`
  width: 100%;
  .ant-timeline-item-tail {
    border-inline-start: ${(props) =>
      props.type === LOG_TYPES.ACTIVITY
        ? `2px solid ${COLOR.CARD_BODY_TEXT} !important`
        : '0px solid !important'};
    margin-top: 5px;
    height: calc(100% - 20px);
  }

  .ant-timeline-item-head {
    background-color: transparent !important;
  }
`

export const LogsCardInnerContainer = styled.div<StyledProps>`
  ${flexColumn};
  width: 100%;
`
export const IconWrapper = styled.div<StyledProps>`
  margin: 5px;
  ${flexCenterColumn};
`

export const RowContainer = styled.div<StyledProps>`
  ${flexRow};
  gap: 8px;
`

export const EmptyLogs = styled(Empty)<StyledProps>`
  padding: 20px;
  ${flexCenterColumn};
`
export const SkeletonRow = styled(Row)<StyledProps>`
  ${flexRow};
  gap: 14px;
`
