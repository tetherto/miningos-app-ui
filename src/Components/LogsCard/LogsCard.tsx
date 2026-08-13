import Skeleton from 'antd/es/skeleton'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

import LabeledCard from '../Card/LabeledCard'
import { StyledPagination } from '../Explorer/List/ListView.styles'

import { EMPTY_MESSAGE_INCIDENTS, INITIAL_SKELETON_ROWS } from './constants'
import {
  EmptyLogs,
  LogsCardInnerContainer,
  LogsListContainer,
  SkeletonRow,
} from './LogsCard.styles'
import { Row } from './Row'

interface LogEntry {
  id?: string
  [key: string]: unknown
}

interface Pagination {
  current: number
  total: number
  pageSize: number
  handlePaginationChange: (page: number) => void
}

interface LogsCardProps {
  type?: string
  logsData?: LogEntry[]
  label?: string
  pagination?: Pagination
  skeletonRows?: number
  onLogClicked?: (id: string) => void
  emptyMessage?: string
  isDark?: boolean
  isLoading?: boolean
}

const LogsCard = ({
  type,
  logsData,
  label,
  pagination,
  onLogClicked,
  isDark = false,
  isLoading = false,
  skeletonRows = INITIAL_SKELETON_ROWS,
  emptyMessage = EMPTY_MESSAGE_INCIDENTS,
}: LogsCardProps) => {
  const isPaginationHidden = pagination?.current === 1 || _isEmpty(logsData)

  return (
    <LabeledCard label={label} isDark={isDark} underline noMargin>
      {isLoading ? (
        <SkeletonRow>
          {Array.from({ length: skeletonRows }).map((_, index: number) => (
            <Skeleton.Input key={index} block active />
          ))}
        </SkeletonRow>
      ) : (
        <LogsCardInnerContainer>
          <LogsListContainer $isEmpty={_isEmpty(logsData)}>
            {isPaginationHidden ? (
              <EmptyLogs description={emptyMessage} />
            ) : (
              _map(logsData, (log: unknown, index: number) => (
                <Row
                  key={index}
                  style={{}}
                  log={
                    log as {
                      status: string
                      title: string
                      subtitle: string
                      body: string
                      uuid: string
                    }
                  }
                  onLogClicked={onLogClicked}
                  type={type || ''}
                />
              ))
            )}
          </LogsListContainer>
          {pagination && !isPaginationHidden && (
            <StyledPagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={pagination.handlePaginationChange}
            />
          )}
        </LogsCardInnerContainer>
      )}
    </LabeledCard>
  )
}

export default LogsCard
