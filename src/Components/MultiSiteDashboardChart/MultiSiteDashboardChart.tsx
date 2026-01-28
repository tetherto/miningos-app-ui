import { type ReactNode, FC } from 'react'

import {
  ChartHeader,
  ChartWrapper,
  StyledLink,
  Title,
  Unit,
} from './MultiSiteDashboardChart.styles'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'
import { ChartContainer } from '@/Components/ChartContainer/ChartContainer'

interface MultiSiteDashboardChartProps {
  title?: string
  unit?: string
  isLoading?: boolean
  data?: unknown
  dataset?: unknown
  redirectTo?: string
  children?: ReactNode
}

const MultiSiteDashboardChart: FC<MultiSiteDashboardChartProps> = ({
  title,
  unit,
  isLoading = false,
  data,
  dataset,
  redirectTo,
  children,
}) => (
  <ChartWrapper>
    <ChartHeader>
      {title && <Title>{title}</Title>}
      {redirectTo && <StyledLink to={redirectTo}>Expand</StyledLink>}
    </ChartHeader>
    {unit && <Unit>{unit}</Unit>}
    <ChartContainer
      data={data as UnknownRecord | unknown[] | undefined}
      dataset={dataset as UnknownRecord | unknown[] | undefined}
      isLoading={isLoading}
    >
      {children}
    </ChartContainer>
  </ChartWrapper>
)

export default MultiSiteDashboardChart
