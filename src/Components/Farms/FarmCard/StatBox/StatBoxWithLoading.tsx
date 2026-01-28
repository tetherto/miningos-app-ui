import Skeleton from 'antd/es/skeleton'
import type { ComponentType } from 'react'

import { StatBoxContainer } from './StatBox.styles'

interface WithLoadingProps {
  isLoading?: boolean
}

export const statBoxWithLoading = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const HOC = ({ isLoading = false, ...props }: WithLoadingProps & P) => {
    if (isLoading)
      return (
        <StatBoxContainer>
          <Skeleton.Input active></Skeleton.Input>
        </StatBoxContainer>
      )
    return <WrappedComponent {...(props as P)} />
  }

  return HOC
}
