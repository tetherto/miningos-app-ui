import { type LazyExoticComponent, type FC, type ComponentType, Suspense } from 'react'

import { Spinner } from '../Spinner/Spinner'

interface SuspenseWrapperProps {
  component: LazyExoticComponent<ComponentType>
}

export const SuspenseWrapper: FC<SuspenseWrapperProps> = ({ component: Component }) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
)
