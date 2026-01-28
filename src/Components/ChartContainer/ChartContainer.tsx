import Empty from 'antd/es/empty'
import type { ReactNode } from 'react'

import { ChildrenWrapper } from './ChartContainer.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import ChartLoadingSkeleton from '@/Components/ChartLoadingSkeleton/ChartLoadingSkeleton'
import { CHART_EMPTY_DESCRIPTION } from '@/constants/charts'
import { useChartDataCheck } from '@/hooks/useChartDataCheck'
import { NoDataWrapper } from '@/MultiSiteViews/Common.style'

interface ChartContainerProps {
  children?: ReactNode
  data?: UnknownRecord | unknown[]
  dataset?: UnknownRecord | unknown[]
  isLoading?: boolean
  showNoDataPlaceholder?: boolean
  customNoDataMessage?: string | ReactNode
  minHeight?: number
  loadingMinHeight?: number
}

export const ChartContainer = ({
  children,
  data,
  dataset,
  isLoading = false,
  showNoDataPlaceholder = true,
  customNoDataMessage,
  minHeight,
  loadingMinHeight,
}: ChartContainerProps) => {
  const hasNoData = useChartDataCheck({ data, dataset })
  const isPlaceholderVisible = !isLoading && hasNoData && showNoDataPlaceholder
  const isContentVisible = !(isLoading || isPlaceholderVisible)

  return (
    <>
      <ChildrenWrapper $isContentVisible={isContentVisible}>{children}</ChildrenWrapper>
      {isPlaceholderVisible && (
        <NoDataWrapper $minHeight={minHeight}>
          <Empty description={customNoDataMessage || CHART_EMPTY_DESCRIPTION} />
        </NoDataWrapper>
      )}
      {isLoading && <ChartLoadingSkeleton minHeight={loadingMinHeight || minHeight} />}
    </>
  )
}

export default ChartContainer
