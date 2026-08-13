import Spin from 'antd/es/spin'
import { FC } from 'react'

import { SpinnerContainer } from './Spinner.styles'

interface SpinnerProps {
  className?: string
  isFullScreen?: boolean
}

export const Spinner: FC<SpinnerProps> = ({ className = '', isFullScreen = true }) => (
  <SpinnerContainer className={className} $isFullScreen={isFullScreen}>
    <Spin size="large" />
  </SpinnerContainer>
)
