import Spin from 'antd/es/spin'
import { FC } from 'react'

import { StyledRoot, StyledSpinnerOutlined } from './ChartLoadingSkeleton.styles'

interface ChartLoadingSkeletonProps {
  minHeight?: number
}

const ChartLoadingSkeleton: FC<ChartLoadingSkeletonProps> = ({ minHeight }) => (
  <StyledRoot $minHeight={minHeight}>
    <Spin size="large" indicator={<StyledSpinnerOutlined spin />} />
  </StyledRoot>
)

export default ChartLoadingSkeleton
